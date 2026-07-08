import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import { getActiveTMDbLanguage } from '@/lib/tmdb'
import type { Metadata } from 'next'
import { IconFire, IconFilm, IconTv, IconStarFilled } from '@/components/icons'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return {
    title: t('top10Page.metaTitle'),
    description: t('top10Page.metaDesc'),
  }
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function getTmdbDetail(mediaId: number, mediaType: string, apiKey: string, lang: string) {
  try {
    const type = mediaType === 'film' ? 'movie' : 'tv'
    const r = await fetch(`${TMDB_BASE}/${type}/${mediaId}?language=${lang}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

interface TopItem {
  media_id: number
  media_type: string
  count: number
  title?: string
  poster?: string | null
  rating?: number
  year?: string
}

const PERIODS = [
  { id: 'hafta', labelKey: 'top10Page.thisWeek', days: 7 },
  { id: 'ay',    labelKey: 'top10Page.thisMonth', days: 30 },
  { id: 'tum',   labelKey: 'top10Page.allTime', days: 0 },
]

interface PageProps {
  searchParams: Promise<{ donem?: string }>
}

export default async function Top10Page({ searchParams }: PageProps) {
  const { t } = await getTranslations()
  const tmdbLang = await getActiveTMDbLanguage()
  const params = await searchParams
  const donem = params.donem ?? 'hafta'
  const period = PERIODS.find(p => p.id === donem) ?? PERIODS[0]

  const supabase = await createClient()
  const apiKey = process.env.TMDB_BEARER_TOKEN ?? ''

  const cutoff = period.days > 0
    ? new Date(Date.now() - period.days * 24 * 3600 * 1000).toISOString()
    : null

  const reviewQuery = supabase.from('reviews').select('media_id, media_type')
  const watchlistQuery = supabase.from('watchlist').select('media_id, media_type')

  if (cutoff) {
    reviewQuery.gte('created_at', cutoff)
    watchlistQuery.gte('added_at', cutoff)
  }

  const [{ data: reviewCounts }, { data: watchlistCounts }] = await Promise.all([
    reviewQuery,
    watchlistQuery,
  ])

  // Aggregate counts
  const countMap = new Map<string, { media_id: number; media_type: string; count: number }>()
  for (const row of [...(reviewCounts ?? []), ...(watchlistCounts ?? [])]) {
    const key = `${row.media_type}-${row.media_id}`
    const existing = countMap.get(key)
    if (existing) {
      existing.count += 1
    } else {
      countMap.set(key, { media_id: row.media_id, media_type: row.media_type, count: 1 })
    }
  }

  const sorted = Array.from(countMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  let filmTop: TopItem[] = []
  let diziTop: TopItem[] = []

  if (sorted.length < 5) {
    const trendType = period.id === 'hafta' ? 'week' : 'day'
    const [trendFilm, trendDizi] = await Promise.all([
      fetch(`${TMDB_BASE}/trending/movie/${trendType}?language=${tmdbLang}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }).then(r => r.ok ? r.json() : { results: [] }),
      fetch(`${TMDB_BASE}/trending/tv/${trendType}?language=${tmdbLang}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }).then(r => r.ok ? r.json() : { results: [] }),
    ])
    filmTop = (trendFilm.results ?? []).slice(0, 10).map((m: any, i: number) => ({
      media_id: m.id, media_type: 'film', count: 10 - i,
      title: m.title ?? m.name, poster: m.poster_path,
      rating: m.vote_average, year: (m.release_date ?? '').slice(0, 4),
    }))
    diziTop = (trendDizi.results ?? []).slice(0, 10).map((m: any, i: number) => ({
      media_id: m.id, media_type: 'dizi', count: 10 - i,
      title: m.title ?? m.name, poster: m.poster_path,
      rating: m.vote_average, year: (m.first_air_date ?? '').slice(0, 4),
    }))
  } else {
    const enriched = await Promise.all(
      sorted.map(async item => {
        const d = await getTmdbDetail(item.media_id, item.media_type, apiKey, tmdbLang)
        return {
          ...item,
          title: d?.title ?? d?.name ?? `#${item.media_id}`,
          poster: d?.poster_path ?? null,
          rating: d?.vote_average ?? null,
          year: (d?.release_date ?? d?.first_air_date ?? '').slice(0, 4),
        }
      })
    )
    filmTop = enriched.filter(e => e.media_type === 'film').slice(0, 10)
    diziTop = enriched.filter(e => e.media_type === 'dizi').slice(0, 10)

    async function pad(type: 'film' | 'dizi', current: TopItem[]) {
      if (current.length >= 5) return current
      const tmdbType = type === 'film' ? 'movie' : 'tv'
      const r = await fetch(`${TMDB_BASE}/trending/${tmdbType}/week?language=tr-TR`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }).then(r => r.ok ? r.json() : { results: [] })
      const existing = new Set(current.map(f => f.media_id))
      const extra = (r.results ?? [])
        .filter((m: any) => !existing.has(m.id))
        .slice(0, 10 - current.length)
        .map((m: any) => ({
          media_id: m.id, media_type: type, count: 0,
          title: m.title ?? m.name, poster: m.poster_path,
          rating: m.vote_average, year: (m.release_date ?? m.first_air_date ?? '').slice(0, 4),
        }))
      return [...current, ...extra].slice(0, 10)
    }

    filmTop = await pad('film', filmTop)
    diziTop = await pad('dizi', diziTop)
  }

  const RANK_STYLES = [
    'text-[#FFD700]', 'text-[#C0C0C0]', 'text-[#CD7F32]',
    'text-white/40', 'text-white/40', 'text-white/35',
    'text-white/35', 'text-white/30', 'text-white/30', 'text-white/25',
  ]

  function TopList({ items, type }: { items: TopItem[]; type: 'film' | 'dizi' }) {
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <Link key={`${item.media_id}-${i}`}
            href={`/${item.media_type}/${item.media_id}`}
            className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className={`text-2xl font-black w-8 text-center shrink-0 tabular-nums ${RANK_STYLES[i]}`}>
              {i + 1}
            </span>
            <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {item.poster && (
                <img src={`https://image.tmdb.org/t/p/w92${item.poster}`} alt={item.title ?? ''} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm leading-tight line-clamp-1 group-hover:text-[--accent] transition-colors">
                {item.title}
              </p>
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {item.year}{item.rating ? <> · <IconStarFilled size={11} className="text-[--gold]" /> {item.rating.toFixed(1)}</> : ''}
              </p>
            </div>
            {item.count > 0 && (
              <span className="text-[10px] px-2 py-1 rounded-full shrink-0 font-semibold"
                style={{ background: type === 'film' ? 'rgba(225,29,72,0.15)' : 'rgba(124,58,237,0.15)', color: type === 'film' ? '#f87171' : '#a78bfa' }}>
                {item.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    )
  }

  const periodLabel = (() => {
    if (period.id === 'hafta') {
      const now = new Date()
      const start = new Date(now)
      start.setDate(now.getDate() - 6)
      return `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} – ${now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`
    }
    if (period.id === 'ay') {
      const now = new Date()
      const start = new Date(now)
      start.setDate(now.getDate() - 29)
      return `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} – ${now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`
    }
    return t('top10Page.allTimeLower')
  })()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-xs font-semibold"
          style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', color: '#E11D48' }}>
          <IconFire size={14} /> Top 10
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Sinezon Top 10</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{periodLabel}</p>
      </div>

      {/* Dönem filtresi */}
      <div className="flex gap-2 mb-8">
        {PERIODS.map(p => {
          const isActive = p.id === donem
          return (
            <Link key={p.id} href={`/top10?donem=${p.id}`}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={isActive
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
              }>
              {t(p.labelKey)}
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconFilm size={24} />
            <h2 className="text-lg font-bold text-white">{t('top10Page.films')}</h2>
          </div>
          <TopList items={filmTop} type="film" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconTv size={24} />
            <h2 className="text-lg font-bold text-white">{t('top10Page.series')}</h2>
          </div>
          <TopList items={diziTop} type="dizi" />
        </div>
      </div>

      <p className="text-center text-xs mt-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
        {t('top10Page.updateNote')}
      </p>
    </div>
  )
}
