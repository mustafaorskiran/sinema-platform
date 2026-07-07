import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { IconStarFilled, IconTrendingUp, IconGlobe, IconMapPin, IconMedal } from '@/components/icons'
import { getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
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
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
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

const MEDAL_COLORS = ['#D4A803', '#C0C0C0', '#B87333']

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function GisePage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab === 'dunya' ? 'dunya' : 'turkiye'
  const { t } = await getTranslations()

  const [turkiyeMovies, dunyaMovies] = await Promise.all([
    fetchGise('/movie/now_playing?region=TR'),
    fetchGise('/movie/popular'),
  ])

  const movies = tab === 'dunya' ? dunyaMovies.slice(0, 20) : turkiyeMovies.slice(0, 20)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero başlık */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(225,29,72,0.7)' }}>
          {t('boxOffice.liveUpdate')}
        </p>
        <div className="flex items-center gap-2.5 mb-2">
          <IconTrendingUp className="h-7 w-7" style={{ color: 'var(--accent)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('boxOffice.title')}
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('boxOffice.subtitle')}
        </p>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 mb-8">
        <Link
          href="/gise?tab=turkiye"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
          style={
            tab === 'turkiye'
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 4px 16px rgba(225,29,72,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
          }
        >
          <IconMapPin className="h-4 w-4" />
          {t('boxOffice.turkey')}
        </Link>
        <Link
          href="/gise?tab=dunya"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
          style={
            tab === 'dunya'
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 4px 16px rgba(225,29,72,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
          }
        >
          <IconGlobe className="h-4 w-4" />
          {t('boxOffice.world')}
        </Link>
      </div>

      {/* Liste */}
      {movies.length > 0 ? (
        <div className="space-y-2">
          {movies.map((movie, index) => {
            const poster = getPosterUrl(movie.poster_path, 'w342')
            const title = getMediaTitle(movie)
            const year = getMediaYear(movie)
            const isTop3 = index < 3

            return (
              <Link
                key={movie.id}
                href={`/film/${movie.id}`}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))',
                  border: `1px solid ${isTop3 ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {/* Sıra */}
                <div className="w-8 text-center shrink-0">
                  {isTop3
                    ? <IconMedal size={20} className="inline-block" style={{ color: MEDAL_COLORS[index] }} />
                    : <span className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>{index + 1}</span>
                  }
                </div>

                {/* Poster */}
                <div
                  className="relative shrink-0 rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105"
                  style={{ width: 40, height: 60, background: 'rgba(255,255,255,0.04)' }}
                >
                  {poster ? (
                    <Image src={poster} alt={title} fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px]"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>—</div>
                  )}
                </div>

                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold leading-tight truncate group-hover:text-white transition-colors"
                    style={{ color: isTop3 ? 'white' : 'rgba(255,255,255,0.85)' }}>
                    {title}
                  </p>
                  {year && (
                    <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{year}</p>
                  )}
                </div>

                {/* Puan */}
                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <div className="flex items-center gap-1">
                    <IconStarFilled className="h-3.5 w-3.5" style={{ color: '#D4A843' }} />
                    <span className="text-[13px] font-bold" style={{ color: '#D4A843' }}>
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {movie.vote_count >= 1000
                      ? t('boxOffice.voteCountK', { count: (movie.vote_count / 1000).toFixed(1) })
                      : t('boxOffice.voteCount', { count: movie.vote_count })}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <IconTrendingUp className="h-12 w-12 mb-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {t('boxOffice.loadError')}
          </p>
        </div>
      )}
    </div>
  )
}
