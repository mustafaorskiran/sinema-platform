import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import KarnePaylas from './KarnePaylas'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

interface Props {
  params: Promise<{ yil: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { yil } = await params
  return {
    title: `${yil} Yıl Özeti | Sinezon`,
    description: `${yil} yılında izlediklerinizin özeti`,
  }
}

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

function gradientCard(children: React.ReactNode, accent?: string) {
  return (
    <div className="rounded-2xl p-5" style={{
      background: accent
        ? `linear-gradient(160deg, ${accent}15, rgba(14,20,32,0.95))`
        : 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
      border: `1px solid ${accent ? accent + '25' : 'rgba(255,255,255,0.06)'}`,
    }}>
      {children}
    </div>
  )
}

export default async function YilOzetiPage({ params }: Props) {
  const { yil } = await params
  const year = parseInt(yil)
  if (isNaN(year) || year < 2000 || year > 2030) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')
  const { t } = await getTranslations()

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: entries } = await supabase
    .from('diary_entries')
    .select('media_id, media_type, watched_at, rating, is_rewatch, tags')
    .eq('user_id', user.id)
    .gte('watched_at', startDate)
    .lte('watched_at', endDate)
    .order('watched_at', { ascending: true })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, content, media_id, media_type, created_at')
    .eq('user_id', user.id)
    .gte('created_at', `${year}-01-01T00:00:00`)
    .lte('created_at', `${year}-12-31T23:59:59`)

  const allEntries = entries ?? []
  const allReviews = reviews ?? []

  const totalFilm = allEntries.filter(e => e.media_type === 'film').length
  const totalDizi = allEntries.filter(e => e.media_type === 'dizi').length
  const totalRewatch = allEntries.filter(e => e.is_rewatch).length
  const totalReviews = allReviews.length

  const ratedEntries = allEntries.filter(e => e.rating != null)
  const avgRating = ratedEntries.length > 0
    ? (ratedEntries.reduce((s, e) => s + (e.rating ?? 0), 0) / ratedEntries.length).toFixed(1)
    : null

  const topRatedRaw = allEntries
    .filter(e => e.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5)

  // Fetch TMDB titles for top rated
  const tmdbKey = process.env.TMDB_API_KEY ?? ''
  const topRated = await Promise.all(topRatedRaw.map(async e => {
    try {
      const type = e.media_type === 'film' ? 'movie' : 'tv'
      const r = await fetch(
        `https://api.themoviedb.org/3/${type}/${e.media_id}?language=tr-TR`,
        { headers: { Authorization: `Bearer ${tmdbKey}` }, next: { revalidate: 86400 } }
      )
      const d = r.ok ? await r.json() : {}
      return { ...e, title: d.title ?? d.name ?? `#${e.media_id}`, poster: d.poster_path ?? null }
    } catch {
      return { ...e, title: `#${e.media_id}`, poster: null }
    }
  }))

  // Monthly count
  const byMonth: number[] = Array(12).fill(0)
  for (const e of allEntries) {
    const m = new Date(e.watched_at).getMonth()
    byMonth[m]++
  }
  const maxMonth = Math.max(...byMonth, 1)
  const bestMonthIdx = byMonth.indexOf(Math.max(...byMonth))

  // Tag analysis
  const tagCount: Record<string, number> = {}
  for (const e of allEntries) {
    for (const t of (e.tags ?? [])) {
      tagCount[t] = (tagCount[t] ?? 0) + 1
    }
  }
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Rating distribution
  const ratingDist: number[] = Array(10).fill(0)
  for (const e of ratedEntries) {
    if (e.rating && e.rating >= 1 && e.rating <= 10) {
      ratingDist[Math.round(e.rating) - 1]++
    }
  }
  const maxDist = Math.max(...ratingDist, 1)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => currentYear - i)

  if (allEntries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">📽️</p>
        <h1 className="text-2xl font-bold text-white mb-2">{t('profile.yearSummaryTitle', { year })}</h1>
        <p className="text-white/50 mb-8">{t('profile.yearSummaryEmpty', { year })}</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {years.map(y => (
            <Link key={y} href={`/ozet/${y}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${y === year ? 'text-white' : 'text-white/40 hover:text-white'}`}
              style={y === year
                ? { background: 'linear-gradient(135deg, #E11D48, #be123c)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {y}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero Başlık */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', color: '#E11D48' }}>
          {t('profile.yearSummaryBadge')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">{year}</h1>
        <p className="text-white/50 text-sm mb-4">
          {t('profile.yearSummaryOwnerLine', { name: profile?.full_name || profile?.username || t('profile.you') })}
        </p>
        <KarnePaylas year={year} totalFilm={totalFilm} totalDizi={totalDizi} totalReviews={totalReviews} username={profile?.username ?? ''} />
      </div>

      {/* Yıl Seçici */}
      <div className="flex justify-center gap-2 flex-wrap mb-10">
        {years.map(y => (
          <Link key={y} href={`/ozet/${y}`}
            className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
            style={y === year
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: 'white' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
            {y}
          </Link>
        ))}
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('profile.films'), value: totalFilm, emoji: '🎬', color: '#E11D48' },
          { label: t('profile.series'), value: totalDizi, emoji: '📺', color: '#a78bfa' },
          { label: t('profile.rewatch'), value: totalRewatch, emoji: '🔁', color: '#34d399' },
          { label: t('social.reviewsLabel'), value: totalReviews, emoji: '✍️', color: '#D4A843' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: `1px solid ${stat.color}20` }}>
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Ortalama Puan */}
      {avgRating && (
        <div className="mb-6">
          {gradientCard(
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('profile.yourAvgRating')}</p>
                <p className="text-4xl font-black" style={{ color: '#D4A843' }}>★ {avgRating}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('profile.basedOnRatings', { count: ratedEntries.length })}</p>
              </div>
              <div className="text-6xl opacity-20">⭐</div>
            </div>,
            '#D4A843'
          )}
        </div>
      )}

      {/* Aylık Aktivite */}
      <div className="mb-6">
        {gradientCard(
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('profile.monthlyActivity', { month: MONTH_LABELS[bestMonthIdx], count: byMonth[bestMonthIdx] })}
            </p>
            <div className="flex items-end gap-1 h-20">
              {byMonth.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max((count / maxMonth) * 72, count > 0 ? 4 : 0)}px`,
                      background: i === bestMonthIdx
                        ? 'linear-gradient(180deg, #E11D48, #be123c)'
                        : 'rgba(225,29,72,0.3)',
                    }}
                  />
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{MONTH_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Puan Dağılımı */}
      {ratedEntries.length > 0 && (
        <div className="mb-6">
          {gradientCard(
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('profile.ratingDistribution')}</p>
              <div className="flex items-end gap-1.5 h-16">
                {ratingDist.map((count, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${Math.max((count / maxDist) * 56, count > 0 ? 3 : 0)}px`,
                        background: i >= 7 ? '#4ade80' : i >= 5 ? '#D4A843' : '#f87171',
                      }}
                    />
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* En Yüksek Puanlılar */}
      {topRated.length > 0 && (
        <div className="mb-6">
          {gradientCard(
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('profile.topRatedByYou')}</p>
              <div className="space-y-2">
                {topRated.map((e, i) => (
                  <Link key={`${e.media_id}-${i}`}
                    href={`/${e.media_type}/${e.media_id}`}
                    className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors group">
                    <span className="text-sm font-bold w-5 text-center shrink-0" style={{ color: ['#FFD700','#C0C0C0','#CD7F32','rgba(255,255,255,0.4)','rgba(255,255,255,0.4)'][i] }}>
                      {['🥇','🥈','🥉','4.','5.'][i]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate group-hover:text-[--accent] transition-colors">
                        {e.media_type === 'film' ? '🎬' : '📺'} {e.title}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {new Date(e.watched_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: '#D4A843' }}>★ {e.rating}</span>
                  </Link>
                ))}
              </div>
            </div>,
            '#D4A843'
          )}
        </div>
      )}

      {/* Etiketler */}
      {topTags.length > 0 && (
        <div className="mb-6">
          {gradientCard(
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('profile.topTagsUsed')}</p>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1.5"
                    style={{ background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.25)' }}>
                    #{tag}
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="text-center mt-10">
        <Link href="/gunluk"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 20px rgba(225,29,72,0.3)' }}>
          📖 {t('profile.backToDiary')}
        </Link>
      </div>
    </div>
  )
}
