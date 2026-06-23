import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const SITE_URL = 'https://sinema-platform.vercel.app'

export async function POST(req: Request) {
  // Sadece Vercel Cron veya admin çağırabilir
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY tanımlı değil' }, { status: 500 })
  }

  const supabase = await createClient()

  // E-posta bildirimi açık olan kullanıcıları çek
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, email_notifications')
    .eq('email_notifications', true)
    .limit(500)

  if (!users?.length) {
    return NextResponse.json({ sent: 0 })
  }

  // Son 7 günün en çok yorumlanan içerikleri
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: topReviews } = await supabase
    .from('reviews')
    .select('media_id, media_type, profiles(username)')
    .gte('created_at', since)
    .limit(100)

  // Media başına yorum sayısını say
  const mediaCount: Record<string, { media_id: number; media_type: string; count: number }> = {}
  for (const r of topReviews ?? []) {
    const key = `${r.media_type}-${r.media_id}`
    if (!mediaCount[key]) mediaCount[key] = { media_id: r.media_id, media_type: r.media_type, count: 0 }
    mediaCount[key].count++
  }

  const topMedia = Object.values(mediaCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // E-posta HTML içeriği
  const mediaListHtml = topMedia.map(m =>
    `<li><a href="${SITE_URL}/${m.media_type}/${m.media_id}" style="color:#e50914">${m.media_type === 'film' ? '🎬' : '📺'} ${m.media_type} #${m.media_id}</a> — ${m.count} yorum</li>`
  ).join('')

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="utf-8"><title>Haftalık SineMa Özeti</title></head>
    <body style="font-family:sans-serif;background:#141414;color:#fff;padding:32px;max-width:600px;margin:0 auto">
      <h1 style="color:#e50914">🎬 Bu Haftanın Özeti</h1>
      <p style="color:#aaa">Bu hafta SineMa'da neler oldu?</p>
      <h2 style="color:#fff;font-size:18px">En Çok Yorumlanan İçerikler</h2>
      <ul style="padding-left:20px;color:#ddd;line-height:2">${mediaListHtml || '<li>Bu hafta içerik yok</li>'}</ul>
      <hr style="border-color:#333;margin:24px 0">
      <p style="color:#666;font-size:12px">
        Bu e-postayı durdurmak için <a href="${SITE_URL}/profil/ayarlar" style="color:#e50914">bildirim ayarlarını</a> düzenleyebilirsin.
      </p>
    </body>
    </html>
  `

  // Tüm kullanıcılara gönder (batch mantığı — büyük listede Resend batch API kullanılmalı)
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  for (const au of authUsers?.users ?? []) {
    if (au.email) emailMap[au.id] = au.email
  }

  let sent = 0
  for (const profile of users) {
    const email = emailMap[profile.id]
    if (!email) continue
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'SineMa <bildirim@sinema-platform.vercel.app>',
          to: email,
          subject: 'Haftalık SineMa Özeti',
          html,
        }),
      })
      if (res.ok) sent++
    } catch {}
  }

  return NextResponse.json({ sent, total: users.length })
}
