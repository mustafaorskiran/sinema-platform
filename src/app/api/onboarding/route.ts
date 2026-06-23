import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const {
    genre_preferences = [],
    platform_preferences = [],
    favorite_actors = [],
    ratings = [],
  } = await req.json()

  // Profil güncelle
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      genre_preferences,
      platform_preferences,
      favorite_actors,
    })
    .eq('id', user.id)

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  // Puanları review olarak kaydet (varsa üzerine yaz)
  if (ratings.length > 0) {
    await supabase.from('reviews').upsert(
      ratings.map((r: { media_id: number; media_type: string; rating: number }) => ({
        user_id: user.id,
        media_id: r.media_id,
        media_type: r.media_type,
        rating: r.rating,
        content: null,
      })),
      { onConflict: 'user_id,media_id,media_type', ignoreDuplicates: false }
    )
  }

  return NextResponse.json({ ok: true })
}
