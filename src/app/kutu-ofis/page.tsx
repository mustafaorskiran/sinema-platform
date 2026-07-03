import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPosterUrl } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import { IconStarFilled, IconClapperboard, IconMasks, IconFilm } from '@/components/icons'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Türkiye Gişe | Sinezon',
  description: 'Türkiye\'de şu an vizyondaki filmler ve gişe sıralaması.',
}

interface TMDbMovie {
  id: number
  title: string
  original_title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  overview: string
}

async function fetchNowPlaying(): Promise<TMDbMovie[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(
      'https://api.themoviedb.org/3/movie/now_playing?language=tr-TR&region=TR&page=1',
      {
        headers: { Authorization: `Bearer ${apiKey}`, accept: 'application/json' },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []) as TMDbMovie[]
  } catch {
    return []
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function RatingBadge({ score }: { score: number }) {
  const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      <span className="inline-flex items-center gap-1"><IconStarFilled size={12} />{score.toFixed(1)}</span>
    </span>
  )
}

export default async function KutuOfisPage() {
  const { t } = await getTranslations()
  const movies = await fetchNowPlaying()

  // Sort by popularity descending (closest proxy for box office rank)
  const sorted = [...movies].sort((a, b) => b.popularity - a.popularity)

  const now = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IconClapperboard size={24} />
          <h1 className="text-2xl font-black text-white">{t('cinemaListings.title')}</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('cinemaListings.subtitle', { date: now })}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <div className="flex justify-center mb-4"><IconMasks size={40} /></div>
          <p style={{ color: 'var(--text-secondary)' }}>{t('cinemaListings.loadError')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((movie, idx) => {
            const poster = getPosterUrl(movie.poster_path, 'w342')
            return (
              <Link
                key={movie.id}
                href={`/film/${movie.id}`}
                className="flex items-center gap-4 rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Rank */}
                <div
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                  style={{
                    background: idx < 3
                      ? `linear-gradient(135deg, ${['#D4A843','#9CA3AF','#CD7F32'][idx]}33, ${['#D4A843','#9CA3AF','#CD7F32'][idx]}11)`
                      : 'rgba(255,255,255,0.05)',
                    color: idx < 3 ? ['#D4A843','#9CA3AF','#CD7F32'][idx] : 'var(--text-secondary)',
                    border: `1px solid ${idx < 3 ? ['#D4A843','#9CA3AF','#CD7F32'][idx] + '44' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {idx + 1}
                </div>

                {/* Poster */}
                {poster ? (
                  <Image
                    src={poster}
                    alt={movie.title}
                    width={44}
                    height={66}
                    className="rounded-lg shrink-0 object-cover"
                    style={{ width: 44, height: 66 }}
                  />
                ) : (
                  <div className="shrink-0 rounded-lg bg-white/5 flex items-center justify-center" style={{ width: 44, height: 66 }}>
                    <IconFilm size={18} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{movie.title}</p>
                  {movie.original_title !== movie.title && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{movie.original_title}</p>
                  )}
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(movie.release_date)}
                  </p>
                </div>

                {/* Score + count */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {movie.vote_average > 0 && <RatingBadge score={movie.vote_average} />}
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {t('boxOffice.voteCount', { count: movie.vote_count.toLocaleString('tr-TR') })}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Note */}
      <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {t('boxOffice.footnote')}
      </p>
    </div>
  )
}
