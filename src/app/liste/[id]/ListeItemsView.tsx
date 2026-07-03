'use client'

import { useState, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { IconStarFilled, IconList, IconGrid, IconFilm, IconTv, IconMessageSquare } from '@/components/icons'

interface MediaItem {
  id: string
  rank: number
  media_id: number
  media_type: 'film' | 'dizi'
  note?: string | null
  media: {
    title?: string
    name?: string
    original_title?: string
    original_name?: string
    poster_path?: string | null
    backdrop_path?: string | null
    overview?: string
    release_date?: string
    first_air_date?: string
    vote_average?: number
    vote_count?: number
    runtime?: number
    genres?: { id: number; name: string }[]
    number_of_seasons?: number
  } | null
}

interface Props {
  items: MediaItem[]
}

type SortKey = 'rank' | 'rating' | 'year' | 'title'
type ViewMode = 'list' | 'grid'

function getPoster(path: string | null | undefined, size: 'w92' | 'w185' | 'w342' = 'w185') {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

function getTitle(media: MediaItem['media']) {
  if (!media) return 'Bilinmiyor'
  return media.title ?? media.name ?? media.original_title ?? media.original_name ?? 'Bilinmiyor'
}

function getYear(media: MediaItem['media']) {
  if (!media) return null
  const date = media.release_date ?? media.first_air_date
  return date?.split('-')[0] ?? null
}

function fmtRuntime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}sa ${m}dk` : `${m}dk`
}

function RatingBadge({ score }: { score: number }) {
  const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      <IconStarFilled size={11} />{score.toFixed(1)}
    </span>
  )
}

export default function ListeItemsView({ items }: Props) {
  const [view, setView] = useState<ViewMode>('list')
  const [sort, setSort] = useState<SortKey>('rank')

  const sorted = useMemo(() => {
    const arr = [...items]
    switch (sort) {
      case 'rating':
        return arr.sort((a, b) => (b.media?.vote_average ?? 0) - (a.media?.vote_average ?? 0))
      case 'year':
        return arr.sort((a, b) => {
          const ya = getYear(a.media) ?? '0'
          const yb = getYear(b.media) ?? '0'
          return yb.localeCompare(ya)
        })
      case 'title':
        return arr.sort((a, b) => getTitle(a.media).localeCompare(getTitle(b.media), 'tr'))
      default:
        return arr.sort((a, b) => a.rank - b.rank)
    }
  }, [items, sort])

  // Stats
  const films = items.filter(i => i.media_type === 'film')
  const diziler = items.filter(i => i.media_type === 'dizi')
  const avgRating = items.filter(i => (i.media?.vote_average ?? 0) > 0).reduce((sum, i) => sum + (i.media?.vote_average ?? 0), 0) / (items.filter(i => (i.media?.vote_average ?? 0) > 0).length || 1)
  const totalRuntime = films.reduce((sum, i) => sum + (i.media?.runtime ?? 0), 0)
  const genreMap: Record<string, number> = {}
  for (const item of items) {
    for (const g of item.media?.genres ?? []) {
      genreMap[g.name] = (genreMap[g.name] ?? 0) + 1
    }
  }
  const topGenres = Object.entries(genreMap).sort(([, a], [, b]) => b - a).slice(0, 4)

  if (items.length === 0) {
    return (
      <div className="rounded-2xl py-16 text-center"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-center mb-3"><IconList size={40} /></div>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Bu liste henüz boş.</p>
      </div>
    )
  }

  return (
    <div>
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Toplam', value: items.length.toString() as ReactNode, sub: `${films.length} film · ${diziler.length} dizi` },
          { label: 'Ort. Puan', value: (avgRating > 0 ? <span className="inline-flex items-center gap-1"><IconStarFilled size={14} />{avgRating.toFixed(1)}</span> : '—') as ReactNode, sub: 'TMDb ortalaması' },
          { label: 'Toplam Süre', value: (totalRuntime > 0 ? fmtRuntime(totalRuntime) : '—') as ReactNode, sub: 'yalnızca filmler' },
          { label: 'En Çok Tür', value: (topGenres[0]?.[0] ?? '—') as ReactNode, sub: topGenres.slice(1, 3).map(([g]) => g).join(' · ') || '' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
            <p className="text-base font-bold text-white">{s.value}</p>
            {s.sub && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Sort */}
        <div className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {([
            { key: 'rank', label: 'Sıra' as ReactNode },
            { key: 'rating', label: <span className="inline-flex items-center gap-1"><IconStarFilled size={12} />Puan</span> as ReactNode },
            { key: 'year', label: 'Yıl' as ReactNode },
            { key: 'title', label: 'A-Z' as ReactNode },
          ] as { key: SortKey; label: ReactNode }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setSort(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: sort === key ? 'rgba(225,29,72,0.8)' : 'transparent',
                color: sort === key ? 'white' : 'rgba(255,255,255,0.4)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {([
            { key: 'list', Icon: IconList },
            { key: 'grid', Icon: IconGrid },
          ] as { key: ViewMode; Icon: typeof IconList }[]).map(({ key, Icon }) => (
            <button key={key} onClick={() => setView(key)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: view === key ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: view === key ? 'white' : 'rgba(255,255,255,0.3)',
              }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid View ── */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
          {sorted.map((item) => {
            const poster = getPoster(item.media?.poster_path, 'w185')
            const title = getTitle(item.media)
            const year = getYear(item.media)
            const href = `/${item.media_type}/${item.media_id}`
            return (
              <div key={item.id} className="group relative">
                <Link href={href}>
                  <div className="aspect-[2/3] rounded-xl overflow-hidden relative transition-all duration-200 group-hover:-translate-y-1.5"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {poster
                      ? <img src={poster} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      : <div className="w-full h-full flex items-center justify-center opacity-20">{item.media_type === 'film' ? <IconFilm size={24} /> : <IconTv size={24} />}</div>
                    }
                    <div className="absolute top-1.5 left-1.5 h-5 min-w-[20px] px-1.5 rounded-md text-[10px] font-bold flex items-center justify-center"
                      style={{ background: 'rgba(11,15,25,0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {item.rank}
                    </div>
                    {(item.media?.vote_average ?? 0) > 0 && (
                      <div className="absolute bottom-1.5 right-1.5">
                        <RatingBadge score={item.media!.vote_average!} />
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] font-medium leading-tight line-clamp-2 group-hover:text-white transition-colors"
                    style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</p>
                  {year && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{year}</p>}
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* ── List View (IMDb style) ── */}
      {view === 'list' && (
        <div className="space-y-3">
          {sorted.map((item, displayIdx) => {
            const poster = getPoster(item.media?.poster_path, 'w92')
            const title = getTitle(item.media)
            const year = getYear(item.media)
            const href = `/${item.media_type}/${item.media_id}`
            const genres = (item.media?.genres ?? []).slice(0, 3)
            const overview = item.media?.overview
            const rating = item.media?.vote_average
            const runtime = item.media?.runtime
            const seasons = item.media?.number_of_seasons

            return (
              <div key={item.id} className="flex gap-4 rounded-xl p-3 sm:p-4 transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Rank */}
                <div className="shrink-0 w-8 flex flex-col items-center justify-start pt-1">
                  <span className="text-lg font-black leading-none"
                    style={{ color: displayIdx < 3 ? ['#D4A843', '#9CA3AF', '#CD7F32'][displayIdx] : 'rgba(255,255,255,0.2)' }}>
                    {sort === 'rank' ? item.rank : displayIdx + 1}
                  </span>
                </div>

                {/* Poster */}
                <Link href={href} className="shrink-0">
                  <div className="w-12 sm:w-16 rounded-lg overflow-hidden shadow-lg"
                    style={{ aspectRatio: '2/3', background: 'rgba(255,255,255,0.06)' }}>
                    {poster
                      ? <img src={poster} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center opacity-20">{item.media_type === 'film' ? <IconFilm size={18} /> : <IconTv size={18} />}</div>
                    }
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Link href={href}
                        className="text-sm sm:text-base font-bold text-white hover:text-[#E11D48] transition-colors leading-tight">
                        {title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {year && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{year}</span>}
                        {item.media_type === 'dizi' && seasons && (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{seasons} sezon</span>
                        )}
                        {item.media_type === 'film' && runtime && runtime > 0 && (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmtRuntime(runtime)}</span>
                        )}
                        {genres.map(g => (
                          <span key={g.id} className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {(rating ?? 0) > 0 && <RatingBadge score={rating!} />}
                  </div>

                  {overview && (
                    <p className="text-xs mt-2 line-clamp-2 leading-relaxed hidden sm:block"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{overview}</p>
                  )}
                  {item.note && (
                    <p className="text-xs mt-1.5 italic line-clamp-1 inline-flex items-center gap-1"
                      style={{ color: '#D4A843', opacity: 0.85 }}>
                      <IconMessageSquare size={12} />"{item.note}"
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
