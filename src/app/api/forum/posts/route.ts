import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/pushNotify'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { thread_id, content } = await req.json()
  if (!thread_id || !content?.trim()) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('forum_posts')
    .insert({ thread_id, content: content.trim(), user_id: user.id })
    .select('id, created_at, content, profiles(username, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Thread sahibine bildirim gönder (kendisi değilse)
  const { data: thread } = await supabase
    .from('forum_threads')
    .select('user_id, title')
    .eq('id', thread_id)
    .single()

  if (thread && thread.user_id !== user.id) {
    const { data: actor } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    const actorName = actor?.username ?? 'Biri'

    await Promise.all([
      supabase.from('notifications').insert({
        user_id: thread.user_id,
        actor_id: user.id,
        type: 'forum_reply',
        content: `Konuna yeni bir yanıt geldi: "${thread.title?.slice(0, 60)}"`,
        link: `/forum/${thread_id}`,
        read: false,
      }),
      sendPushToUser(thread.user_id, '💬 Forum konuna yanıt geldi', `@${actorName}: ${content.trim().slice(0, 80)}`, `/forum/${thread_id}`),
    ])

    // E-posta bildirimi (RESEND_API_KEY varsa)
    if (process.env.RESEND_API_KEY && process.env.INTERNAL_API_KEY) {
      const { data: targetUser } = await supabase.auth.admin.getUserById(thread.user_id)
      if (targetUser?.user?.email) {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_API_KEY },
          body: JSON.stringify({
            to: targetUser.user.email,
            subject: `Forum konuna yanıt geldi: "${thread.title?.slice(0, 50)}"`,
            html: `<p><strong>@${actorName}</strong> forum konuna yanıt yazdı.</p><p><em>${content.trim().slice(0, 200)}</em></p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'}/forum/${thread_id}">Konuyu görüntüle →</a></p>`,
          }),
        }).catch(() => {})
      }
    }
  }

  return NextResponse.json(data)
}
