import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Sinezon Top 10 | Sinezon',
  description: "Bu hafta Sinezon'da en çok izlenen ve yorum alan 10 film ve dizi.",
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function getTmdbDetail(mediaId: number, mediaType: string, apiKey: string) {
  try {
    const type = mediaType === 'film' ? 'movie' : 'tv'
    const r = await fetch(`${TMDB_BASE}/${type}/${mediaId}?language=tr-TR`, {
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

export default async function Top10Page() {
  const supabase = await createClient()
  const apiKey = process.env.TMDB_API_KEY ?? ''

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

  // Count reviews per media in last 7 days
  const { data: reviewCounts } = await supabase
    .from('reviews')
    .select('media_id, media_type')
    .gte('created_at', weekAgo)

  const { data: watchlistCounts } = await supabase
    .from('watchlist')
    .select('media_id, media_type')
    .gte('added_at', weekAgo)

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
    .slice(0, 10)

  // Fallback: if insufficient data, use TMDb trending
  let filmTop: TopItem[] = []
  let diziTop: TopItem[] = []

  if (sorted.length < 5) {
    // Use TMDb trending
    const [trendFilm, trendDizi] = await Promise.all([
      fetch(`${TMDB_BASE}/trending/movie/week?language=tr-TR`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }).then(r => r.ok ? r.json() : { results: [] }),
      fetch(`${TMDB_BASE}/trending/tv/week?language=tr-TR`, {
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
    // Enrich with TMDB data
    const enriched = await Promise.all(
      sorted.map(async item => {
        const d = await getTmdbDetail(item.media_id, item.media_type, apiKey)
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

    // If film or series side too small, pad from TMDb trending
    if (filmTop.length < 5) {
      const r = await fetch(`${TMDB_BASE}/trending/movie/week?language=tr-TR`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }).then(r => r.ok ? r.json() : { results: [] })
      const existing = new Set(filmTop.map(f => f.media_id))
      const pad = (r.results ?? [])
        .filter((m: any) => !existing.has(m.id))
        .slice(0, 10 - filmTop.length)
        .map((m: any, i: number) => ({
          media_id: m.id, media_type: 'film', count: 0,
          title: m.title, poster: m.poster_path,
          rating: m.vote_average, year: (m.release_date ?? '').slice(0, 4),
        }))
      filmTop = [...filmTop, ...pad].slice(0, 10)
    }
    if (diziTop.length < 5) {
      const r = await fetch(`${TMDB_BASE}/trending/tv/week?language=tr-TR`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }).then(r => r.ok ? r.json() : { results: [] })
      const existing = new Set(diziTop.map(f => f.media_id))
      const pad = (r.results ?? [])
        .filter((m: any) => !existing.has(m.id))
        .slice(0, 10 - diziTop.length)
        .map((m: any, i: number) => ({
          media_id: m.id, media_type: 'dizi', count: 0,
          title: m.name ?? m.title, poster: m.poster_path,
          rating: m.vote_average, year: (m.first_air_date ?? '').slice(0, 4),
        }))
      diziTop = [...diziTop, ...pad].slice(0, 10)
    }
  }

  const RANK_STYLES = [
    'text-[#FFD700]',   // 1
    'text-[#C0C0C0]',   // 2
    'text-[#CD7F32]',   // 3
    'text-white/40',
    'text-white/40',
    'text-white/35',
    'text-white/35',
    'text-white/30',
    'text-white/30',
    'text-white/25',
  ]

  function TopList({ items, type }: { items: TopItem[]; type: 'film' | 'dizi' }) {
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <Link key={`${item.media_id}-${i}`}
            href={`/${item.media_type}/${item.media_id}`}
            className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Sıra */}
            <span className={`text-2xl font-black w-8 text-center shrink-0 tabular-nums ${RANK_STYLES[i]}`}>
              {i + 1}
            </span>
            {/* Poster */}
            <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {item.poster && (
                <img src={`https://image.tmdb.org/t/p/w92${item.poster}`} alt={item.title ?? ''} className="w-full h-full object-cover" />
              )}
            </div>
            {/* Bilgi */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm leading-tight line-clamp-1 group-hover:text-[--accent] transition-colors">
                {item.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {item.year}{item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ''}
              </p>
            </div>
            {/* Aktivite sayacı */}
            {item.count > 0 && (
              <span className="text-[10px] px-2 py-1 rounded-full shrink-0 font-semibold"
                style={{ background: type === 'film' ? 'rgba(225,29,72,0.15)' : 'rgba(124,58,237,0.15)', color: type === 'film' ? '#f87171' : '#a78bfa' }}>
                {item.count} {type === 'film' ? 'yorum' : 'takip'}
              </span>
            )}
          </Link>
        ))}
      </div>
    )
  }

  const weekStr = (() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} – ${now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`
  })()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-xs font-semibold"
          style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', color: '#E11D48' }}>
          🔥 Haftalık
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Sinezon Top 10</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{weekStr}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Filmler */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎬</span>
            <h2 className="text-lg font-bold text-white">Filmler</h2>
          </div>
          <TopList items={filmTop} type="film" />
        </div>

        {/* Diziler */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📺</span>
            <h2 className="text-lg font-bold text-white">Diziler</h2>
          </div>
          <TopList items={diziTop} type="dizi" />
        </div>
      </div>

      {/* Alt not */}
      <p className="text-center text-xs mt-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Son 7 günde Sinezon kullanıcılarının aktivitesine göre güncellenir · Saatlik yenileme
      </p>
    </div>
  )
}
