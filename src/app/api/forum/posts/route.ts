import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    await supabase.from('notifications').insert({
      user_id: thread.user_id,
      actor_id: user.id,
      type: 'forum_reply',
      content: `Konuna yeni bir yanıt geldi: "${thread.title?.slice(0, 60)}"`,
      link: `/forum/${thread_id}`,
      read: false,
    })
  }

  return NextResponse.json(data)
}
