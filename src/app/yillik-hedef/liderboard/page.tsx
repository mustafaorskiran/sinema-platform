import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yıllık Hedef Liderboard | Sinezon',
  description: 'Bu yıl en çok film izleyen kullanıcılar.',
}

const YEAR = new Date().getFullYear()

export default async function YillikLiderboardPage() {
  const supabase = await createClient()

  // Hedefi olanları çek
  const { data: challenges } = await supabase
    .from('yearly_challenges')
    .select('user_id, film_goal, series_goal, profiles(username, avatar_url)')
    .eq('year', YEAR)
    .gt('film_goal', 0)

  if (!challenges || challenges.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-2xl font-bold text-white mb-2">{YEAR} Liderboard</h1>
        <p className="text-[--text-secondary]">Henüz kimse hedef belirlemedi.</p>
        <Link href="/yillik-hedef" className="inline-block mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 14px rgba(225,29,72,0.3)' }}>
          Hedef Belirle
        </Link>
      </div>
    )
  }

  // Watchlist sayılarını çek
  const userIds = challenges.map(c => c.user_id)
  const { data: watchCounts } = await supabase
    .from('watchlist')
    .select('user_id, media_type')
    .in('user_id', userIds)
    .eq('status', 'izledim')

  const countMap: Record<string, { film: number; dizi: number }> = {}
  for (const w of watchCounts ?? []) {
    if (!countMap[w.user_id]) countMap[w.user_id] = { film: 0, dizi: 0 }
    if (w.media_type === 'film') countMap[w.user_id].film++
    else countMap[w.user_id].dizi++
  }

  // Tamamlanma yüzdesine göre sırala
  const ranked = challenges
    .map(c => {
      const watched = countMap[c.user_id] ?? { film: 0, dizi: 0 }
      const filmPct  = c.film_goal   > 0 ? Math.min(100, (watched.film  / c.film_goal)   * 100) : 0
      const seriesPct= c.series_goal > 0 ? Math.min(100, (watched.dizi  / c.series_goal) * 100) : 0
      const pct = c.film_goal > 0 && c.series_goal > 0
        ? (filmPct + seriesPct) / 2
        : c.film_goal > 0 ? filmPct : seriesPct
      const profile = (c.profiles as unknown) as { username: string; avatar_url: string | null } | null
      return { ...c, watched, filmPct, seriesPct, pct: Math.round(pct), profile }
    })
    .sort((a, b) => b.pct - a.pct || (b.watched.film + b.watched.dizi) - (a.watched.film + a.watched.dizi))

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{YEAR} Yıllık Hedef Liderboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Hedefine en yakın olanlar — {ranked.length} kullanıcı
          </p>
        </div>
        <Link href="/yillik-hedef" className="text-sm font-medium transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          Hedefim →
        </Link>
      </div>

      <div className="space-y-3">
        {ranked.map((u, i) => {
          const medal = medals[i] ?? null
          const isTop3 = i < 3
          return (
            <div
              key={u.user_id}
              className="rounded-2xl p-4"
              style={{
                background: isTop3
                  ? 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))'
                  : 'rgba(255,255,255,0.025)',
                border: isTop3 ? '1px solid rgba(212,168,67,0.15)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Sıra / Madalya */}
                <div className="w-8 text-center shrink-0">
                  {medal
                    ? <span className="text-xl">{medal}</span>
                    : <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>#{i + 1}</span>
                  }
                </div>

                {/* Avatar */}
                <Link href={`/profil/${u.profile?.username}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-white shrink-0"
                    style={{ background: 'var(--accent)' }}>
                    {u.profile?.avatar_url
                      ? <img src={u.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (u.profile?.username?.[0] ?? '?').toUpperCase()
                    }
                  </div>
                </Link>

                {/* Kullanıcı bilgisi */}
                <div className="flex-1 min-w-0">
                  <Link href={`/profil/${u.profile?.username}`}
                    className="font-semibold text-white hover:text-[--accent] transition-colors text-sm">
                    {u.profile?.username}
                  </Link>
                  <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {u.film_goal > 0 && (
                      <span>🎬 {u.watched.film}/{u.film_goal}</span>
                    )}
                    {u.series_goal > 0 && (
                      <span>📺 {u.watched.dizi}/{u.series_goal}</span>
                    )}
                  </div>
                </div>

                {/* Yüzde */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-black" style={{ color: u.pct >= 100 ? '#4ade80' : 'var(--gold)' }}>
                    %{u.pct}
                  </p>
                  {u.pct >= 100 && <p className="text-[10px] text-green-400 font-bold">Tamamlandı ✓</p>}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, u.pct)}%`,
                    background: u.pct >= 100
                      ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                      : 'linear-gradient(90deg, #D4A843, #F0C060)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Tamamlanma yüzdesine göre sıralanır. Her gün güncellenir.
      </p>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link href="/yillik-hedef"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 14px rgba(225,29,72,0.25)' }}>
          🏆 Hedefini Güncelle
        </Link>
      </div>
    </div>
  )
}
