import { createClient } from '@/lib/supabase/server'
import KatkilClient from './KatkilClient'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Katkıda Bulun | Sinezon',
  description: 'Sinezon\'a eksik film ve dizi ekle.',
}

export default async function KatkilPage() {
  const { t } = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Top katkıda bulunanlar
  const { data: topContributors } = await supabase
    .from('contributions')
    .select('user_id, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(100)

  const countMap: Record<string, { username: string; avatar_url: string | null; count: number }> = {}
  for (const c of topContributors ?? []) {
    const p = c.profiles as any
    if (!p) continue
    if (!countMap[c.user_id]) countMap[c.user_id] = { username: p.username, avatar_url: p.avatar_url, count: 0 }
    countMap[c.user_id].count++
  }
  const leaders = Object.values(countMap).sort((a, b) => b.count - a.count).slice(0, 5)

  // Toplam katkı sayısı
  const { count: totalContributions } = await supabase
    .from('contributions')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <KatkilClient isLoggedIn={!!user} />

      {/* Katkı istatistikleri */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-semibold text-white text-sm">{t('contribute.topContributorsTitle')}</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(212,168,67,0.1)', color: '#D4A843' }}>
              {t('contribute.totalContentBadge', { count: totalContributions ?? 0 })}
            </span>
          </div>
          {leaders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {t('contribute.noContributionsYet')}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {leaders.map((l, i) => (
                <div key={l.username} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm font-bold w-5 shrink-0 text-center"
                    style={{ color: ['#FFD700','#C0C0C0','#CD7F32','rgba(255,255,255,0.3)','rgba(255,255,255,0.3)'][i] }}>
                    {i + 1}
                  </span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0"
                    style={{ background: 'var(--accent)' }}>
                    {l.avatar_url
                      ? <img src={l.avatar_url} alt={l.username} className="w-full h-full object-cover" />
                      : l.username[0].toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{l.username}</p>
                  </div>
                  <span className="text-sm font-bold shrink-0" style={{ color: '#D4A843' }}>
                    {t('contribute.contributionCount', { count: l.count })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
