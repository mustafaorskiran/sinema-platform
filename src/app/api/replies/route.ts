import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { review_id, content } = await req.json()
  if (!review_id || !content?.trim()) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('review_replies')
    .insert({ review_id, user_id: user.id, content: content.trim() })
    .select('*, profiles(username, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Yorumun sahibine bildirim gönder (kendi yorumuna cevap verirse gönderme)
  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', review_id)
    .single()

  if (review && review.user_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: review.user_id,
      actor_id: user.id,
      type: 'reply',
      review_id,
    })
  }

  return NextResponse.json(data)
}
