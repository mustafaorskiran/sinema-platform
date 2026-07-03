import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'
import { IconMedal, IconUsers } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Davet Liderleri — Sinezon',
  description: 'Sinezon\'a en çok kişiyi davet edenler',
}

export default async function DavetLeaderboardPage() {
  const { t } = await getTranslations()
  const supabase = await createClient()

  // Referral kodu olan profilleri getir
  const { data: leaders } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, referral_code')
    .not('referral_code', 'is', null)
    .order('created_at', { ascending: true })
    .limit(30)

  // Her leader için davet sayısını hesapla
  const leaderWithCount = await Promise.all(
    (leaders ?? []).map(async (l) => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', l.id)
      return { ...l, inviteCount: count ?? 0 }
    })
  )

  const sortedLeaders = leaderWithCount
    .sort((a, b) => b.inviteCount - a.inviteCount)
    .filter(l => l.inviteCount > 0)
    .slice(0, 10)

  const medalColorClasses = ['text-[#D4A803]', 'text-[#C0C0C0]', 'text-[#B87333]']

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white">{t('invite.leaderboardTitle')}</h1>
      </div>
      <p className="text-sm text-[--text-secondary] mb-8">
        {t('invite.leaderboardSubtitle')}
      </p>

      {sortedLeaders.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center text-[--text-secondary]"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="mb-3 flex justify-center"><IconUsers size={32} /></p>
          <p className="text-sm">{t('invite.leaderboardEmpty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLeaders.map((leader, index) => (
            <div
              key={leader.id}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: index === 0
                  ? 'linear-gradient(160deg,rgba(212,168,67,0.08),rgba(14,20,32,0.95))'
                  : 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
                border: index === 0
                  ? '1px solid rgba(212,168,67,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Sıra */}
              <span className="shrink-0 w-8 flex items-center justify-center">
                {index < 3 ? <IconMedal size={20} className={medalColorClasses[index]} /> : <span className="text-sm font-bold text-[--text-secondary]">#{index + 1}</span>}
              </span>

              {/* Avatar */}
              <div
                className="h-10 w-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-white"
                style={{ background: 'var(--accent)' }}
              >
                {leader.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={leader.avatar_url} alt={leader.username} className="w-full h-full object-cover" />
                ) : (
                  leader.username?.[0]?.toUpperCase()
                )}
              </div>

              {/* Kullanıcı adı */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/profil/${leader.username}`}
                  className="font-semibold text-sm text-white hover:text-[--accent] transition-colors"
                >
                  {leader.username}
                </Link>
              </div>

              {/* Davet sayısı */}
              <div className="text-right shrink-0">
                <span className="text-sm font-bold" style={{ color: index === 0 ? '#D4A843' : 'var(--text-primary)' }}>
                  {leader.inviteCount}
                </span>
                <p className="text-[10px] text-[--text-secondary]">{t('invite.inviteCountSuffix')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 p-5 rounded-2xl text-center" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-semibold text-white mb-2">{t('invite.ctaTitle')}</p>
        <p className="text-xs text-[--text-secondary] mb-4">
          {t('invite.ctaDesc')}
        </p>
        <Link
          href="/profil"
          className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'var(--accent)' }}
        >
          {t('invite.goToProfile')}
        </Link>
      </div>
    </div>
  )
}
