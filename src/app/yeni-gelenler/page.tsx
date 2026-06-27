import Link from 'next/link'
import type { Metadata } from 'next'
import MovieCard from '@/components/MovieCard'
import { IconTv } from '@/components/icons'
import type { TMDbMovie, TMDbSearchResult } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Platformlara Bu Ay Gelenler | Sinezon',
  description: "Türkiye'deki streaming platformlarında son 30 günde neler çıktı?",
}

const BASE = 'https://api.themoviedb.org/3'

interface Platform {
  id: string
  label: string
  providerId: number
  color: string
}

const PLATFORMS: Platform[] = [
  { id: 'netflix',  label: 'Netflix',      providerId: 8,   color: '#E50914' },
  { id: 'disney',   label: 'Disney+',      providerId: 337, color: '#113CCF' },
  { id: 'prime',    label: 'Amazon Prime', providerId: 119, color: '#00A8E0' },
  { id: 'mubi',     label: 'MUBI',         providerId: 100, color: '#0047FF' },
]

async function fetchPlatformMovies(providerId: number): Promise<TMDbMovie[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString().split('T')[0]

  const url = new URL(`${BASE}/discover/movie`)
  url.searchParams.set('watch_region', 'TR')
  url.searchParams.set('with_watch_providers', String(providerId))
  url.searchParams.set('sort_by', 'release_date.desc')
  url.searchParams.set('primary_release_date.gte', dateStr)
  url.searchParams.set('page', '1')
  url.searchParams.set('language', 'tr-TR')

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        accept: 'application/json',
      },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data: TMDbSearchResult = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

interface PageProps {
  searchParams: Promise<{ platform?: string }>
}

export default async function YeniGelenlerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const activePlatformId = params.platform ?? 'netflix'

  const activePlatform = PLATFORMS.find(p => p.id === activePlatformId) ?? PLATFORMS[0]

  const movies = await fetchPlatformMovies(activePlatform.providerId)
  const displayMovies = movies.slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <IconTv className="h-6 w-6" style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Platformlara Bu Ay Gelenler
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Türkiye'deki streaming platformlarında son 30 günde neler çıktı?
        </p>
      </div>

      {/* Platform Sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PLATFORMS.map(platform => {
          const isActive = platform.id === activePlatformId
          return (
            <Link
              key={platform.id}
              href={`/yeni-gelenler?platform=${platform.id}`}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background: platform.color,
                      color: '#fff',
                      boxShadow: `0 0 16px ${platform.color}55`,
                    }
                  : {
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {platform.label}
            </Link>
          )
        })}
      </div>

      {/* Platform başlığı */}
      <div className="mb-6 flex items-center gap-3">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: activePlatform.color }}
        />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {activePlatform.label} — Son 30 Gün
        </h2>
      </div>

      {/* Film Kartları */}
      {displayMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {displayMovies.map(movie => (
            <MovieCard key={movie.id} media={movie} type="film" />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <IconTv className="h-12 w-12 mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            Bu platformda son 30 günde içerik bulunamadı.
          </p>
        </div>
      )}
    </div>
  )
}
