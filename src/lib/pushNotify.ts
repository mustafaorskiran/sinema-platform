import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

let vapidReady = false

function initVapid() {
  if (vapidReady) return
  const subject = process.env.VAPID_SUBJECT
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!subject || !pub || !priv) return
  webpush.setVapidDetails(subject, pub, priv)
  vapidReady = true
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url = '/'
) {
  if (!process.env.VAPID_PRIVATE_KEY) return
  initVapid()

  const supabase = await createClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs?.length) return

  const payload = JSON.stringify({ title, body, url })

  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
      } catch {
        // Süresi dolmuş subscription'ı temizle
        await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      }
    })
  )
}
