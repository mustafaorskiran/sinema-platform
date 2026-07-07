import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/pushNotify'

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
    const actor = (data as { profiles?: { username?: string } | null })?.profiles
    const actorName = actor?.username ?? 'Biri'

    await Promise.all([
      supabase.from('notifications').insert({ user_id: review.user_id, actor_id: user.id, type: 'reply', review_id }),
      sendPushToUser(review.user_id, '💬 Yorumuna cevap geldi', `@${actorName}: ${content.trim().slice(0, 80)}`, '/bildirimler'),
    ])

    // E-posta bildirimi
    if (process.env.RESEND_API_KEY && process.env.INTERNAL_API_KEY) {
      const { data: targetProfile } = await supabase.from('profiles').select('email_on_reply').eq('id', review.user_id).single()
      if (targetProfile?.email_on_reply) {
        const { data: targetUser } = await supabase.auth.admin.getUserById(review.user_id)
        if (targetUser?.user?.email) {
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_API_KEY },
            body: JSON.stringify({
              to: targetUser.user.email,
              subject: `@${actorName} yorumuna cevap yazdı`,
              html: `<p><strong>@${actorName}</strong> yorumuna cevap yazdı:</p><blockquote>${content.trim().slice(0, 300)}</blockquote><p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'}/bildirimler">Bildirimleri görüntüle →</a></p>`,
            }),
          }).catch(() => {})
        }
      }
    }
  }

  return NextResponse.json(data)
}
