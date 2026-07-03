import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import PollWidget from '@/components/PollWidget'
import CreatePollForm from './CreatePollForm'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Anketler | Sinezon',
  description: 'Film ve dizi anketleri — oy ver, tartış.',
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
            <div className="text-4xl mb-3">🗳️</div>
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
