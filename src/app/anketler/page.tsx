import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import PollWidget from '@/components/PollWidget'
import CreatePollForm from './CreatePollForm'
import { getTranslations } from '@/lib/i18n'
import { IconClipboard } from '@/components/icons'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return {
    title: `${t('community.pollsTitle')} | Sinezon`,
    description: t('community.pollsSubtitle'),
  }
}

export default async function AnketlerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { t } = await getTranslations()

  const { data: polls } = await supabase
    .from('polls')
    .select('*, profiles(username, avatar_url), poll_votes(option_idx, user_id)')
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('community.pollsTitle')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('community.pollsSubtitle')}</p>
        </div>
        {user && <CreatePollForm />}
      </div>

      <div className="space-y-4">
        {(polls ?? []).length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <div className="mb-3 flex justify-center"><IconClipboard size={40} /></div>
            <p>{t('community.noPolls')}</p>
          </div>
        ) : (
          (polls ?? []).map((poll: any) => (
            <div key={poll.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  @{poll.profiles?.username}
                </span>
              </div>
              <PollWidget poll={poll} currentUserId={user?.id} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
