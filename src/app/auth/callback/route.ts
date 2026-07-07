import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Google'dan gelen display name'i geçerli username'e dönüştür
function buildBaseUsername(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')       // boşluk → alt çizgi
    .replace(/[^a-z0-9_]/g, '') // özel karakter temizle
    .replace(/^_+|_+$/g, '')    // başındaki/sonundaki _ sil
    .slice(0, 20)
  return cleaned || 'kullanici'
}

// Benzersiz kullanıcı adı bul; gerekirse rakam ekle
async function uniqueUsername(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string
): Promise<string> {
  let candidate = base
  for (let i = 1; i <= 99; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle()
    if (!data) return candidate
    candidate = `${base}${i}`
  }
  // Çok nadir uç durum: timestamp son 6 hanesi ile garanti et
  return `${base}${Date.now().toString().slice(-6)}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  // Reverse proxy (Traefik/Coolify) arkasında request.url'in origin'i container'ın
  // iç adresini (localhost:3000) yansıtabiliyor — bunun yerine site URL'ini kullan.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
  const ref  = searchParams.get('ref')

  // Şifre sıfırlama akışı — hemen yönlendir
  if (type === 'recovery' && code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(`${origin}/auth/sifre-sifirla`)
  }

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const provider = user.app_metadata?.provider as string | undefined
      let isNewUser = false

      // OAuth (Google vb.) — yeni profil oluştur
      if (provider && provider !== 'email') {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existing) {
          isNewUser = true
          const rawName: string =
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split('@')[0] ??
            'kullanici'

          const avatarUrl: string | null =
            user.user_metadata?.avatar_url ?? null

          const base     = buildBaseUsername(rawName)
          const username = await uniqueUsername(supabase, base)

          await supabase.from('profiles').insert({
            id:         user.id,
            username,
            avatar_url: avatarUrl,
          })
        }
      }

      // Davet eden kullanıcıyı otomatik takip et
      if (ref) {
        try {
          const { data: refProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', ref)
            .maybeSingle()
          if (refProfile && refProfile.id !== user.id) {
            await supabase.from('follows').upsert(
              { follower_id: user.id, following_id: refProfile.id },
              { onConflict: 'follower_id,following_id' }
            )
          }
        } catch { /* ignore referral errors */ }
      }

      // Yeni kullanıcı veya onboarding tamamlanmamış → onboarding'e yönlendir
      if (isNewUser) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()

      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
