import Link from 'next/link'
import { IconPlay, IconChevronRight } from '@/components/icons'
import { getTrendingMovies, getTrendingTV, getTrailersForMovies, getTrailersForTV } from '@/lib/tmdb'
import HomeTrailerCards from './HomeTrailerCards'
import type { TrailerItem } from '@/lib/types'

export default async function HomeTrailerSection() {
  try {
    const [moviesData, tvData] = await Promise.all([
      getTrendingMovies(),
      getTrendingTV(),
    ])

    const [movieTrailers, tvTrailers] = await Promise.all([
      getTrailersForMovies(moviesData.results.slice(0, 8), 'film'),
      getTrailersForTV(tvData.results.slice(0, 8)),
    ])

    // Interleave film + dizi, max 8
    const trailers: TrailerItem[] = []
    const maxLen = Math.max(movieTrailers.length, tvTrailers.length)
    for (let i = 0; i < maxLen && trailers.length < 8; i++) {
      if (movieTrailers[i] && trailers.length < 8) trailers.push(movieTrailers[i])
      if (tvTrailers[i] && trailers.length < 8) trailers.push(tvTrailers[i])
    }

    if (trailers.length === 0) return null

    return (
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <IconPlay className="h-5 w-5 text-[--accent]" />
            <h2 className="text-xl font-bold text-white">Fragmanlar</h2>
          </div>
          <Link
            href="/fragmanlar"
            className="flex items-center gap-1 text-sm text-[--text-secondary] hover:text-[--accent] transition-colors"
          >
            Tümünü Gör <IconChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <HomeTrailerCards trailers={trailers} />
      </section>
    )
  } catch {
    return null
  }
}
