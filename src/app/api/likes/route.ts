import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { review_id } = await req.json()

  const { error } = await supabase
    .from('review_likes')
    .insert({ user_id: user.id, review_id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Yorumun sahibine bildirim gönder (kendi yorumunu beğenirse gönderme)
  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', review_id)
    .single()

  if (review && review.user_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: review.user_id,
      actor_id: user.id,
      type: 'like',
      review_id,
    })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { review_id } = await req.json()

  const { error } = await supabase
    .from('review_likes')
    .delete()
    .eq('user_id', user.id)
    .eq('review_id', review_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
