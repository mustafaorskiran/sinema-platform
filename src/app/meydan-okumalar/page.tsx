import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconPencil, IconStarFilled, IconBookOpen, IconUsers, IconClipboard, IconGamepad, IconSwords, IconTrophy } from '@/components/icons'

export const metadata: Metadata = { title: 'Meydan Okumalar | Sinezon' }

const MONTHLY_CHALLENGES = [
  { key: 'write_5_reviews', label: 'community.challengeWrite5ReviewsLabel', desc: 'community.challengeWrite5ReviewsDesc', goal: 5, Icon: IconPencil },
  { key: 'rate_20_films', label: 'community.challengeRate20FilmsLabel', desc: 'community.challengeRate20FilmsDesc', goal: 20, Icon: IconStarFilled },
  { key: 'add_10_diary', label: 'community.challengeAdd10DiaryLabel', desc: 'community.challengeAdd10DiaryDesc', goal: 10, Icon: IconBookOpen },
  { key: 'follow_5_users', label: 'community.challengeFollow5UsersLabel', desc: 'community.challengeFollow5UsersDesc', goal: 5, Icon: IconUsers },
  { key: 'create_list', label: 'community.challengeCreateListLabel', desc: 'community.challengeCreateListDesc', goal: 1, Icon: IconClipboard },
  { key: 'use_quiz', label: 'community.challengeUseQuizLabel', desc: 'community.challengeUseQuizDesc', goal: 1, Icon: IconGamepad },
]

export default async function MeydanOkumalarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')
  const { t } = await getTranslations()

  const monthYear = new Date().toISOString().slice(0, 7)
  const startOfMonth = `${monthYear}-01`

  const [
    { count: reviewCount },
    { count: diaryCount },
    { data: progressData },
    { count: followCount },
    { count: listCount },
  ] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfMonth),
    supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('watched_at', startOfMonth),
    supabase.from('challenge_progress').select('*').eq('user_id', user.id).eq('month_year', monthYear),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id).gte('created_at', startOfMonth),
    supabase.from('lists').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfMonth),
  ])

  const progressMap = new Map((progressData ?? []).map((p: any) => [p.challenge_key, p]))

  const realProgress: Record<string, number> = {
    write_5_reviews: reviewCount ?? 0,
    rate_20_films: (reviewCount ?? 0) + (diaryCount ?? 0),
    add_10_diary: diaryCount ?? 0,
    follow_5_users: followCount ?? 0,
    create_list: listCount ?? 0,
    use_quiz: progressMap.get('use_quiz')?.progress ?? 0,
  }

  // Upsert progress
  for (const ch of MONTHLY_CHALLENGES) {
    const prog = Math.min(realProgress[ch.key] ?? 0, ch.goal)
    const done = prog >= ch.goal
    await supabase.from('challenge_progress').upsert({
      user_id: user.id,
      challenge_key: ch.key,
      month_year: monthYear,
      progress: prog,
      goal: ch.goal,
      completed: done,
      completed_at: done && !progressMap.get(ch.key)?.completed ? new Date().toISOString() : (progressMap.get(ch.key)?.completed_at ?? null),
    }, { onConflict: 'user_id,challenge_key,month_year' })
  }

  const completedCount = MONTHLY_CHALLENGES.filter(ch => (realProgress[ch.key] ?? 0) >= ch.goal).length
  const monthLabel = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  const totalXP = MONTHLY_CHALLENGES.reduce((s, ch) => s + ch.goal * 5, 0)
  const earnedXP = MONTHLY_CHALLENGES.reduce((s, ch) => {
    const prog = Math.min(realProgress[ch.key] ?? 0, ch.goal)
    return s + prog * 5
  }, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white inline-flex items-center gap-2"><IconSwords size={26} />{t('community.challengesTitle')}</h1>
      </div>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {monthLabel} · {t('community.challengesSummary', { completed: completedCount, total: MONTHLY_CHALLENGES.length })}
      </p>

      {/* Genel progress */}
      <div className="rounded-xl p-4 mb-6" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">{t('community.monthlyProgress')}</span>
          <span className="text-sm font-bold" style={{ color: '#D4A843' }}>{earnedXP} / {totalXP} XP</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round((earnedXP / totalXP) * 100)}%`, background: 'linear-gradient(90deg,#E11D48,#be123c)' }} />
        </div>
        <p className="text-[10px] mt-1.5 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t('community.tasksCompletedCount', { completed: completedCount, total: MONTHLY_CHALLENGES.length })}
        </p>
      </div>

      <div className="space-y-3">
        {MONTHLY_CHALLENGES.map(ch => {
          const prog = Math.min(realProgress[ch.key] ?? 0, ch.goal)
          const done = prog >= ch.goal
          const pct = Math.round((prog / ch.goal) * 100)

          return (
            <div key={ch.key} className="rounded-xl p-4" style={{
              background: done ? 'rgba(52,211,153,0.06)' : 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))',
              border: done ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.06)',
            }}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5"><ch.Icon size={24} /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`font-semibold text-sm ${done ? 'text-green-400' : 'text-white'}`}>{t(ch.label)}</p>
                    <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: done ? '#34d399' : 'rgba(255,255,255,0.4)' }}>
                      {prog}/{ch.goal}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{t(ch.desc)}</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: done ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#E11D48,#be123c)' }} />
                  </div>
                  {done && <p className="text-[10px] mt-1 text-green-400 font-semibold">{t('community.taskDoneMark')}</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {completedCount === MONTHLY_CHALLENGES.length && (
        <div className="text-center mt-8 p-8 rounded-2xl" style={{ background: 'linear-gradient(160deg,rgba(212,168,67,0.1),rgba(212,168,67,0.05))', border: '1px solid rgba(212,168,67,0.3)' }}>
          <div className="flex justify-center mb-3"><IconTrophy size={40} /></div>
          <p className="text-lg font-bold" style={{ color: '#D4A843' }}>{t('community.allChallengesDoneTitle')}</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('community.allChallengesDoneDesc')}</p>
        </div>
      )}
    </div>
  )
}
