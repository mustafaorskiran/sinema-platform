import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConversationList from './ConversationList'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconMessageSquare } from '@/components/icons'

export const metadata: Metadata = { title: 'Mesajlar' }

export default async function MesajlarPage() {
  const supabase = await createClient()
  const { t } = await getTranslations()
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
    <>
      {/* Mobil: tam liste göster */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold text-white mb-4">{t('messages.title')}</h1>
        <ConversationList
          conversations={(conversations ?? []) as any[]}
          currentUserId={user.id}
        />
      </div>

      {/* Masaüstü: sağ panel placeholder (sidebar zaten layout'ta var) */}
      <div className="hidden md:flex flex-col items-center justify-center h-[60vh] rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="mb-3"><IconMessageSquare size={40} /></div>
        <p className="text-sm font-medium text-white mb-1">{t('messages.selectConversation')}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('messages.selectConversationHint')}</p>
      </div>
    </>
  )
}
