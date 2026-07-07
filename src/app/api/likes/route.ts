import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/pushNotify'

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
    const { data: actor } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    const actorName = actor?.username ?? 'Biri'

    await Promise.all([
      supabase.from('notifications').insert({ user_id: review.user_id, actor_id: user.id, type: 'like', review_id }),
      sendPushToUser(review.user_id, '❤️ Yorumun beğenildi', `@${actorName} yorumunu beğendi`, '/bildirimler'),
    ])

    // E-posta bildirimi
    if (process.env.RESEND_API_KEY && process.env.INTERNAL_API_KEY) {
      const { data: targetProfile } = await supabase.from('profiles').select('email_on_like').eq('id', review.user_id).single()
      if (targetProfile?.email_on_like) {
        const { data: targetUser } = await supabase.auth.admin.getUserById(review.user_id)
        if (targetUser?.user?.email) {
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_API_KEY },
            body: JSON.stringify({
              to: targetUser.user.email,
              subject: `@${actorName} yorumunu beğendi`,
              html: `<p><strong>@${actorName}</strong> Sinezon'daki yorumunu beğendi! <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'}/bildirimler">Bildirimleri görüntüle →</a></p>`,
            }),
          }).catch(() => {})
        }
      }
    }
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
