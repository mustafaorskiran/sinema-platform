import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatWindow from './ChatWindow'

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { data: conv } = await supabase
    .from('conversations')
    .select('id, p1:profiles!participant_1(id, username, avatar_url), p2:profiles!participant_2(id, username, avatar_url)')
    .eq('id', conversationId)
    .single()

  if (!conv) notFound()

  const conv2 = conv as unknown as { id: string; p1: { id: string; username: string; avatar_url: string | null }; p2: { id: string; username: string; avatar_url: string | null } }
  if (conv2.p1.id !== user.id && conv2.p2.id !== user.id) notFound()

  const other = conv2.p1.id === user.id ? conv2.p2 : conv2.p1

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*, profiles!sender_id(username, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200)

  // Mark as read
  await supabase.from('direct_messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('read', false)

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 112px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[--border]">
        <a href="/mesajlar" className="md:hidden text-[--text-secondary] hover:text-white text-sm transition-colors">← Geri</a>
        {other.avatar_url
          ? <img src={other.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          : <div className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>{other.username[0]?.toUpperCase()}</div>}
        <div>
          <a href={`/profil/${other.username}`} className="text-sm font-semibold text-white hover:text-[--accent] transition-colors">@{other.username}</a>
        </div>
      </div>

      <ChatWindow
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={(messages ?? []) as any[]}
      />
    </div>
  )
}
