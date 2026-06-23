import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

// GET /api/messages?conversation_id=...
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const conversationId = req.nextUrl.searchParams.get('conversation_id')
  if (!conversationId) return NextResponse.json([])

  // Verify user is a participant in this conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('participant_1, participant_2')
    .eq('id', conversationId)
    .single()

  if (!conv || (conv.participant_1 !== user.id && conv.participant_2 !== user.id)) {
    return NextResponse.json([], { status: 403 })
  }

  const { data } = await supabase
    .from('direct_messages')
    .select('*, profiles!sender_id(username, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200)

  // Mark incoming as read
  await supabase.from('direct_messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('read', false)

  return NextResponse.json(data ?? [])
}

// POST /api/messages  { conversation_id, content }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  // Ban check
  const { data: profile } = await supabase.from('profiles').select('banned').eq('id', user.id).single()
  if (profile?.banned) return NextResponse.json({ error: 'Hesabın yasaklanmış.' }, { status: 403 })

  // Rate limit: 30 messages per minute
  if (!rateLimit(`msg:${user.id}`, 60_000, 30)) {
    return NextResponse.json({ error: 'Çok fazla mesaj gönderdin. Lütfen bekle.' }, { status: 429 })
  }

  const { conversation_id, content } = await req.json()
  if (!conversation_id || !content?.trim()) return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
  if (content.trim().length > 2000) return NextResponse.json({ error: 'Mesaj çok uzun' }, { status: 400 })

  // Verify user is a participant before allowing POST
  const { data: conv } = await supabase
    .from('conversations')
    .select('participant_1, participant_2')
    .eq('id', conversation_id)
    .single()

  if (!conv || (conv.participant_1 !== user.id && conv.participant_2 !== user.id)) {
    return NextResponse.json({ error: 'Bu konuşmaya erişim yetkiniz yok.' }, { status: 403 })
  }

  const { data, error } = await supabase.from('direct_messages').insert({
    conversation_id,
    sender_id: user.id,
    content: content.trim(),
  }).select('*, profiles!sender_id(username, avatar_url)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation_id)

  return NextResponse.json(data)
}
