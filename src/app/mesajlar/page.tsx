import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConversationList from './ConversationList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mesajlar' }

export default async function MesajlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`id, updated_at, p1:profiles!participant_1(id, username, avatar_url), p2:profiles!participant_2(id, username, avatar_url), messages(content, created_at, sender_id)`)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('updated_at', { ascending: false })
    .order('created_at', { referencedTable: 'messages', ascending: false })
    .limit(1, { referencedTable: 'messages' })
    .limit(30)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Mesajlar</h1>
      <ConversationList
        conversations={(conversations ?? []) as any[]}
        currentUserId={user.id}
      />
    </div>
  )
}
