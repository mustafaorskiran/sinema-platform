import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Sadece admin push gönderebilir
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, title, body, url } = await req.json()

  const query = supabase.from('push_subscriptions').select('endpoint, p256dh, auth')
  if (userId) query.eq('user_id', userId)
  const { data: subs } = await query

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const payload = JSON.stringify({ title, body, url: url ?? '/' })
  let sent = 0

  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
      sent++
    } catch {
      // Expired subscription — temizle
      await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
    }
  }))

  return NextResponse.json({ sent })
}
