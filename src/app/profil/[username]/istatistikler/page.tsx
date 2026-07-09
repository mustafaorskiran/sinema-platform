import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovieMini, getSeriesMini } from '@/lib/tmdb'
import { computeBadges, ALL_BADGE_COUNT } from '@/lib/badges'
import BadgeMedal from '@/components/BadgeMedal'
import ActivityHeatmap from '@/components/ActivityHeatmap'
import WatchCalendar from '@/components/WatchCalendar'
import ZevkDNA from '@/components/ZevkDNA'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconCheck, IconLock, IconArrowLeft, IconBarChart, IconTrendingUp, IconFilm, IconTv } from '@/components/icons'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} — İstatistikler` }
}

// Türkçe tür isimleri (TMDb genre ID → isim)
const GENRE_NAMES: Record<number, string> = {
  28: 'Aksiyon', 12: 'Macera', 16: 'Animasyon', 35: 'Komedi', 80: 'Suç',
  99: 'Belgesel', 18: 'Drama', 10751: 'Aile', 14: 'Fantastik', 36: 'Tarih',
  27: 'Korku', 10402: 'Müzik', 9648: 'Gizem', 10749: 'Romantik', 878: 'Bilim Kurgu',
  10770: 'TV Filmi', 53: 'Gerilim', 10752: 'Savaş', 37: 'Kovboy',
  10759: 'Aksiyon & Macera', 10762: 'Çocuk', 10763: 'Haber', 10764: 'Reality',
  10765: 'Bilim Kurgu & Fantastik', 10766: 'Pembe Dizi', 10767: 'Talk Show',
  10768: 'Savaş & Politika',
}

export default async function IstatistiklerPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()
  const { t } = await getTranslations()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, created_at')
    .eq('username', username)
    .single()


  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  // Tüm yorumlar + günlük kayıtları + rozet için ek veriler
  const [{ data: reviews }, { data: diary }, { count: followerCount }, { count: listCount }, { count: threadCount }, { count: topicVoteCount }] = await Promise.all([
    supabase.from('reviews').select('media_id, media_type, rating, created_at').eq('user_id', profile.id),
    supabase.from('diary_entries').select('media_id, media_type, watched_at, rating').eq('user_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('lists').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('topic_votes').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
  ])

  const allReviews = reviews ?? []
  const allDiary = diary ?? []

  // ─── Temel istatistikler ───────────────────────────────────────
  const filmReviews = allReviews.filter(r => r.media_type === 'film')
  const diziReviews = allReviews.filter(r => r.media_type === 'dizi')
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length)
    : 0

  // ─── Puan dağılımı ────────────────────────────────────────────
  const ratingDist: Record<number, number> = {}
  for (let i = 1; i <= 10; i++) ratingDist[i] = 0
  for (const r of allReviews) ratingDist[r.rating] = (ratingDist[r.rating] ?? 0) + 1
  const maxRatingCount = Math.max(...Object.values(ratingDist), 1)

  // ─── Aylık aktivite (son 12 ay) ───────────────────────────────
  const months: { key: string; label: string; count: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('tr-TR', { month: 'short' })
    const count = allDiary.filter(e => e.watched_at.startsWith(key)).length
      + allReviews.filter(e => e.created_at.startsWith(key)).length
    months.push({ key, label, count })
  }
  const maxMonthCount = Math.max(...months.map(m => m.count), 1)

  // ─── İzleme hızı: son 3 ayın ortalaması vs önceki 3 ay ────────
  const last3 = months.slice(-3).reduce((s, m) => s + m.count, 0)
  const prev3 = months.slice(-6, -3).reduce((s, m) => s + m.count, 0)
  const monthlyAvg = Math.round(last3 / 3)
  const speedChange = prev3 > 0 ? Math.round(((last3 - prev3) / prev3) * 100) : 0

  // ─── Yıla göre aktivite ───────────────────────────────────────
  const yearMap: Record<string, number> = {}
  for (const e of allDiary) {
    const y = e.watched_at.slice(0, 4)
    yearMap[y] = (yearMap[y] ?? 0) + 1
  }
  for (const r of allReviews) {
    const y = r.created_at.slice(0, 4)
    yearMap[y] = (yearMap[y] ?? 0) + 1
  }
  const years = Object.entries(yearMap).sort(([a], [b]) => a.localeCompare(b))
  const maxYearCount = Math.max(...years.map(([, c]) => c), 1)

  // ─── Tür dağılımı (TMDb'den, son 60 film) ────────────────────
  const uniqueFilmIds = [...new Set(filmReviews.map(r => r.media_id))].slice(0, 60)
  const uniqueDiziIds = [...new Set(diziReviews.map(r => r.media_id))].slice(0, 30)

  // Rozetler
  const badges = computeBadges({
    reviewCount: allReviews.length,
    filmCount: filmReviews.length,
    diziCount: diziReviews.length,
    avgRating,
    followerCount: followerCount ?? 0,
    listCount: listCount ?? 0,
    diaryCount: allDiary.length,
    threadCount: threadCount ?? 0,
    topicVoteCount: topicVoteCount ?? 0,
    joinedAt: profile.created_at,
  }, t)
  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)

  const genreCount: Record<number, number> = {}
  const genreRatingAccum: Record<number, { total: number; count: number }> = {}
  let totalRuntime = 0

  const filmRatingByMediaId: Record<number, number> = {}
  for (const r of filmReviews) if (r.rating > 0) filmRatingByMediaId[r.media_id] = r.rating
  const diziRatingByMediaId: Record<number, number> = {}
  for (const r of diziReviews) if (r.rating > 0) diziRatingByMediaId[r.media_id] = r.rating

  await Promise.all([
    ...uniqueFilmIds.map(async (id) => {
      try {
        const m = await getMovieMini(id)
        const rating = filmRatingByMediaId[id]
        for (const g of m.genres ?? []) {
          genreCount[g.id] = (genreCount[g.id] ?? 0) + 1
          if (rating) {
            if (!genreRatingAccum[g.id]) genreRatingAccum[g.id] = { total: 0, count: 0 }
            genreRatingAccum[g.id].total += rating
            genreRatingAccum[g.id].count += 1
          }
        }
        if (m.runtime) totalRuntime += m.runtime
      } catch {}
    }),
    ...uniqueDiziIds.map(async (id) => {
      try {
        const s = await getSeriesMini(id)
        const rating = diziRatingByMediaId[id]
        for (const g of s.genres ?? []) {
          genreCount[g.id] = (genreCount[g.id] ?? 0) + 1
          if (rating) {
            if (!genreRatingAccum[g.id]) genreRatingAccum[g.id] = { total: 0, count: 0 }
            genreRatingAccum[g.id].total += rating
            genreRatingAccum[g.id].count += 1
          }
        }
      } catch {}
    }),
  ])

  const topGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id, count]) => ({ id: Number(id), name: GENRE_NAMES[Number(id)] ?? `Tür #${id}`, count }))

  const maxGenreCount = Math.max(...topGenres.map(g => g.count), 1)

  const genreData = topGenres.map(g => ({
    genre: g.name,
    count: g.count,
    avgRating: genreRatingAccum[g.id]
      ? genreRatingAccum[g.id].total / genreRatingAccum[g.id].count
      : 0,
  }))
  const totalHours = Math.round(totalRuntime / 60)
  const totalDays = Math.round(totalHours / 24)

  // İzleme serisi hesapla
  const allDates = [
    ...allDiary.map(e => e.watched_at.slice(0, 10)),
    ...allReviews.map(r => r.created_at.slice(0, 10)),
  ]
  const uniqueDates = [...new Set(allDates)].sort().reverse()
  let currentStreak = 0
  let maxStreak = 0
  let streak = 0
  let prevDate: string | null = null
  for (const d of uniqueDates) {
    if (prevDate === null) {
      streak = 1
    } else {
      const diff = (new Date(prevDate).getTime() - new Date(d).getTime()) / 86400000
      if (diff === 1) streak++
      else streak = 1
    }
    if (streak > maxStreak) maxStreak = streak
    prevDate = d
  }
  // Bugün veya dün aktif mi? (mevcut seri)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const diff = (new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i + 1]).getTime()) / 86400000
      if (diff === 1) currentStreak++
      else break
    }
  }

  // Heatmap için tüm aktivite tarihleri
  const heatmapEntries = [
    ...allDiary.map(e => ({ date: e.watched_at })),
    ...allReviews.map(r => ({ date: r.created_at })),
  ]

  // Takvim için günlük girişler
  const calendarEntries = allDiary.map(e => ({
    date: e.watched_at,
    mediaId: e.media_id,
    mediaType: e.media_type,
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[--text-secondary] mb-6">
        <Link href={`/profil/${username}`} className="hover:text-white transition-colors inline-flex items-center gap-1"><IconArrowLeft size={14} /> {username}</Link>
        <span>/</span>
        <span className="text-white">{t('profile.statsTab.title')}</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-full bg-[--accent] flex items-center justify-center text-xl font-bold text-white overflow-hidden shrink-0">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
            : username[0].toUpperCase()
          }
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{username}</h1>
          <p className="text-sm text-[--text-secondary]">{t('profile.statsTab.subtitle')}</p>
        </div>
      </div>

      {allReviews.length === 0 && allDiary.length === 0 ? (
        <div className="rounded-2xl py-16 text-center px-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="flex justify-center mb-3"><IconBarChart size={40} /></p>
          <p className="text-[--text-secondary] text-sm">{t('profile.statsTab.empty')}</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Özet kartlar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard value={allReviews.length} label={t('profile.statsTab.reviews')} />
            <StatCard value={allDiary.length} label={t('profile.statsTab.diaryRecords')} />
            <StatCard value={avgRating > 0 ? avgRating.toFixed(1) : '—'} label={t('profile.statsTab.avgRating')} gold />
            <StatCard value={totalHours > 0 ? `${totalHours}s` : '—'} label={totalDays > 0 ? t('profile.statsTab.approxDays', { days: totalDays }) : t('profile.statsTab.watchTime')} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard value={filmReviews.length} label={t('profile.statsTab.filmReviews')} />
            <StatCard value={diziReviews.length} label={t('profile.statsTab.seriesReviews')} />
            <StatCard value={currentStreak > 0 ? t('profile.statsTab.dayCount', { count: currentStreak }) : '—'} label={t('profile.statsTab.currentStreak')} />
            <StatCard value={maxStreak > 0 ? t('profile.statsTab.dayCount', { count: maxStreak }) : '—'} label={t('profile.statsTab.longestStreak')} />
          </div>

          {/* İzleme hızı */}
          {monthlyAvg > 0 && (
            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white">{t('profile.statsTab.watchSpeed')}</p>
                <span className="text-xs text-[--text-secondary]">{t('profile.statsTab.last12Months')}</span>
              </div>
              <div className="flex items-end gap-1 h-20 mb-3">
                {months.map(m => (
                  <div key={m.key} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                    <div
                      className="w-full rounded-t bg-[--accent]/40 group-hover:bg-[--accent] transition-colors"
                      style={{ height: `${Math.round((m.count / maxMonthCount) * 100)}%`, minHeight: m.count > 0 ? '4px' : '0' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-[--text-secondary]">
                {months.map(m => (
                  <span key={m.key} className="flex-1 text-center">{m.label}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 pt-4 border-t border-[--border]/50">
                <div>
                  <p className="text-2xl font-bold text-white">{monthlyAvg}</p>
                  <p className="text-xs text-[--text-secondary]">{t('profile.statsTab.monthlyAvg')}</p>
                </div>
                {speedChange !== 0 && (
                  <div className={`ml-auto text-sm font-semibold ${speedChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="inline-flex items-center gap-1"><IconTrendingUp size={14} className={speedChange > 0 ? '' : 'rotate-180'} /> %{Math.abs(speedChange)}</span>
                    <p className="text-xs font-normal text-[--text-secondary]">{t('profile.statsTab.vsPrev3Months')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aktivite ısı haritası */}
          {heatmapEntries.length > 0 && (
            <ActivityHeatmap entries={heatmapEntries} />
          )}

          {/* İzleme takvimi */}
          {calendarEntries.length > 0 && (
            <WatchCalendar entries={calendarEntries} />
          )}

          {/* Film / Dizi oranı */}
          {allReviews.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white mb-3">{t('profile.statsTab.filmSeriesRatio')}</p>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${(filmReviews.length / allReviews.length) * 100}%` }}
                />
                <div
                  className="bg-purple-500 transition-all flex-1"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[--text-secondary]">
                <span className="text-blue-400 inline-flex items-center gap-1"><IconFilm size={12} /> {t('film.badge')} %{Math.round((filmReviews.length / allReviews.length) * 100)}</span>
                <span className="text-purple-400 inline-flex items-center gap-1"><IconTv size={12} /> {t('series.badge')} %{Math.round((diziReviews.length / allReviews.length) * 100)}</span>
              </div>
            </div>
          )}

          {/* Puan dağılımı */}
          {allReviews.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white mb-4">{t('profile.statsTab.ratingDistribution')}</p>
              <div className="flex items-end gap-1.5 h-28">
                {[1,2,3,4,5,6,7,8,9,10].map(n => {
                  const count = ratingDist[n] ?? 0
                  const pct = (count / maxRatingCount) * 100
                  return (
                    <div key={n} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-[--text-secondary]">{count > 0 ? count : ''}</span>
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(pct, count > 0 ? 4 : 1)}%`,
                          backgroundColor: count > 0
                            ? `hsl(${(n - 1) * 12 + 10}, 80%, 55%)`
                            : 'var(--bg-secondary)',
                        }}
                      />
                      <span className="text-[10px] text-[--text-secondary]">{n}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Aylık aktivite */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white mb-4">{t('profile.statsTab.monthlyActivity')}</p>
            <div className="flex items-end gap-1 h-24">
              {months.map(m => {
                const pct = (m.count / maxMonthCount) * 100
                return (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-1" title={`${m.label}: ${m.count}`}>
                    <div
                      className="w-full rounded-t bg-[--accent]/70 hover:bg-[--accent] transition-colors"
                      style={{ height: `${Math.max(pct, m.count > 0 ? 6 : 1)}%` }}
                    />
                    <span className="text-[9px] text-[--text-secondary] rotate-0">{m.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Yıla göre */}
          {years.length > 1 && (
            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white mb-4">{t('profile.statsTab.byYear')}</p>
              <div className="space-y-2">
                {years.map(([year, count]) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-xs text-[--text-secondary] w-10 shrink-0">{year}</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-full bg-[--accent]/60 rounded-full transition-all"
                        style={{ width: `${(count / maxYearCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[--text-secondary] w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tür dağılımı */}
          {topGenres.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white mb-1">{t('profile.statsTab.topGenres')}</p>
              <p className="text-xs text-[--text-secondary] mb-4">{t('profile.statsTab.basedOnLast', { count: uniqueFilmIds.length + uniqueDiziIds.length })}</p>
              <div className="space-y-2.5">
                {topGenres.map(g => (
                  <div key={g.id} className="flex items-center gap-3">
                    <span className="text-xs text-white w-28 shrink-0">{g.name}</span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-full bg-[--accent] rounded-full transition-all"
                        style={{ width: `${(g.count / maxGenreCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[--text-secondary] w-6 text-right">{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rozetler */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white mb-1">
              {t('profile.statsTab.badges')}
              <span className="ml-2 text-xs font-normal text-[--text-secondary]">{t('profile.statsTab.badgesEarned', { earned: earnedBadges.length, total: ALL_BADGE_COUNT })}</span>
            </p>

            {earnedBadges.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-green-400 mb-2 inline-flex items-center gap-1"><IconCheck size={12} /> {t('profile.statsTab.earned')}</p>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.map(badge => (
                    <div
                      key={badge.id}
                      title={badge.desc}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-default"
                      style={{ background: `${badge.color}12`, border: `1px solid ${badge.color}35` }}
                    >
                      <BadgeMedal icon={badge.icon} color={badge.color} colorDark={badge.colorDark} earned size={34} />
                      <div>
                        <p className="text-xs font-semibold text-white leading-none">{badge.name}</p>
                        <p className="text-[10px] text-[--text-secondary] mt-0.5">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lockedBadges.length > 0 && (
              <div>
                <p className="text-xs text-[--text-secondary] mb-2 inline-flex items-center gap-1"><IconLock size={12} /> {t('profile.statsTab.notEarnedYet')}</p>
                <div className="flex flex-wrap gap-2">
                  {lockedBadges.map(badge => (
                    <div
                      key={badge.id}
                      title={badge.desc}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-default"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <BadgeMedal icon={badge.icon} color={badge.color} colorDark={badge.colorDark} earned={false} size={34} />
                      <div>
                        <p className="text-xs font-semibold text-white leading-none">{badge.name}</p>
                        <p className="text-[10px] text-[--text-secondary] mt-0.5">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Zevk DNA'sı */}
          {genreData.length > 0 && (
            <ZevkDNA genreData={genreData} />
          )}

        </div>
      )}
    </div>
  )
}

function StatCard({ value, label, gold }: { value: string | number; label: string; gold?: boolean }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className={`text-2xl font-bold ${gold ? 'text-[--gold]' : 'text-white'}`}>{value}</p>
      <p className="text-xs text-[--text-secondary] mt-0.5">{label}</p>
    </div>
  )
}
