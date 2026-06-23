import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { IconStarFilled, IconTrendingUp, IconGlobe, IconMapPin } from '@/components/icons'
import { getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import type { TMDbMovie, TMDbSearchResult } from '@/lib/types'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Gişe Sıralaması | Sinezon',
  description: "Türkiye ve dünya gişe sıralamalarını keşfet.",
}

async function fetchGise(endpoint: string): Promise<TMDbMovie[]> {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`)
  url.searchParams.set('language', 'tr-TR')
  url.searchParams.set('page', '1')
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        accept: 'application/json',
      },
      next: { revalidate: 21600 },
    })
    if (!res.ok) return []
    const data: TMDbSearchResult = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function GisePage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab === 'dunya' ? 'dunya' : 'turkiye'

  const [turkiyeMovies, dunyaMovies] = await Promise.all([
    fetchGise('/movie/now_playing?region=TR'),
    fetchGise('/movie/popular'),
  ])

  const movies = tab === 'dunya' ? dunyaMovies.slice(0, 20) : turkiyeMovies.slice(0, 20)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <IconTrendingUp className="h-6 w-6" style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Gişe Sıralaması
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Şu an vizyonda olan ve en çok izlenen filmler
        </p>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 mb-8">
        <Link
          href="/gise?tab=turkiye"
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
          style={
            tab === 'turkiye'
              ? { background: 'var(--accent)', color: '#fff' }
              : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
          }
        >
          <IconMapPin className="h-4 w-4" />
          Türkiye
        </Link>
        <Link
          href="/gise?tab=dunya"
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
          style={
            tab === 'dunya'
              ? { background: 'var(--accent)', color: '#fff' }
              : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
          }
        >
          <IconGlobe className="h-4 w-4" />
          Dünya
        </Link>
      </div>

      {/* Tablo */}
      {movies.length > 0 ? (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {movies.map((movie, index) => {
            const poster = getPosterUrl(movie.poster_path, 'w342')
            const title = getMediaTitle(movie)
            const year = getMediaYear(movie)
            const isEven = index % 2 === 0

            return (
              <Link
                key={movie.id}
                href={`/film/${movie.id}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-[--bg-secondary]"
                style={{
                  background: isEven ? 'var(--bg-card)' : 'var(--bg-secondary)',
                  borderBottom: index < movies.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                {/* Sıra */}
                <div
                  className="w-8 text-center font-bold text-lg shrink-0"
                  style={{
                    color: index < 3 ? 'var(--gold-bright)' : 'var(--text-secondary)',
                    opacity: index < 3 ? 1 : 0.6,
                  }}
                >
                  {index + 1}
                </div>

                {/* Poster */}
                <div
                  className="relative shrink-0 rounded-lg overflow-hidden"
                  style={{ width: 40, height: 60, background: 'var(--bg-secondary)' }}
                >
                  {poster ? (
                    <Image
                      src={poster}
                      alt={title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-[10px] text-center p-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      —
                    </div>
                  )}
                </div>

                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-semibold leading-tight truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </p>
                  {year && (
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {year}
                    </p>
                  )}
                </div>

                {/* Puan + Oy Sayısı */}
                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <div className="flex items-center gap-1">
                    <IconStarFilled className="h-3.5 w-3.5" style={{ color: 'var(--gold)' }} />
                    <span className="text-[13px] font-bold" style={{ color: 'var(--gold-bright)' }}>
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {movie.vote_count >= 1000
                      ? `${(movie.vote_count / 1000).toFixed(1)}k oy`
                      : `${movie.vote_count} oy`}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <IconTrendingUp
            className="h-12 w-12 mb-4"
            style={{ color: 'var(--text-secondary)', opacity: 0.4 }}
          />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            Gişe verisi yüklenemedi.
          </p>
        </div>
      )}
    </div>
  )
}
