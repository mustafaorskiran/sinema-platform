import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  // Ban check
  const { data: profile } = await supabase
    .from('profiles')
    .select('banned')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 })
  if (profile.banned) return NextResponse.json({ error: 'Hesabın yasaklanmış.' }, { status: 403 })

  // Rate limit: 20 watchlist changes per minute
  if (!await rateLimit(`watchlist:${user.id}`, 60_000, 20)) {
    return NextResponse.json({ error: 'Çok fazla işlem yaptın. Lütfen bekle.' }, { status: 429 })
  }

  const { media_id, media_type, status } = await req.json()

  const { data, error } = await supabase
    .from('watchlist')
    .upsert(
      { user_id: user.id, media_id, media_type, status },
      { onConflict: 'user_id,media_id,media_type' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { media_id, media_type } = await req.json()

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('media_id', media_id)
    .eq('media_type', media_type)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
