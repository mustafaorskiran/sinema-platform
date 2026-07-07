import { IconPlay } from '@/components/icons'
import { getTranslations } from '@/lib/i18n'
import {
  getTrendingMovies,
  getTrendingTV,
  getUpcomingMovies,
  getNowPlayingMovies,
  getOnAirTV,
  getTrailersForMovies,
  getTrailersForTV,
} from '@/lib/tmdb'
import FragmanlarClient from './FragmanlarClient'
import type { Metadata } from 'next'
import type { TrailerItem, TMDbMovie } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Fragmanlar — Sinezon',
  description: 'Film ve dizi fragmanları, ön izlemeler ve yakında çıkacak yapıtlar',
}

function mergeUnique(...lists: TMDbMovie[][]): TMDbMovie[] {
  const seen = new Set<number>()
  return lists.flat().filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export default async function FragmanlarPage() {
  const { t } = await getTranslations()
  // Tüm kaynaklardan paralel veri çek
  const [
    trending,
    nowPlaying1,
    nowPlaying2,
    upcoming1,
    upcoming2,
    upcoming3,
    upcoming4,
    upcoming5,
    trendingTV,
    onAir1,
    onAir2,
    onAir3,
  ] = await Promise.all([
    getTrendingMovies(),
    getNowPlayingMovies(1),
    getNowPlayingMovies(2),
    getUpcomingMovies(1),
    getUpcomingMovies(2),
    getUpcomingMovies(3),
    getUpcomingMovies(4),
    getUpcomingMovies(5),
    getTrendingTV(),
    getOnAirTV(1),
    getOnAirTV(2),
    getOnAirTV(3),
  ])

  const today = new Date().toISOString().split('T')[0]

  const upcomingSet = new Set([
    ...upcoming1.results,
    ...upcoming2.results,
    ...upcoming3.results,
    ...upcoming4.results,
    ...upcoming5.results,
  ].filter(m => (m.release_date ?? '') > today).map(m => m.id))

  const allMovies = mergeUnique(
    trending.results,
    nowPlaying1.results,
    nowPlaying2.results,
    upcoming1.results,
    upcoming2.results,
    upcoming3.results,
    upcoming4.results,
    upcoming5.results,
  )

  const allTV = mergeUnique(
    trendingTV.results,
    onAir1.results,
    onAir2.results,
    onAir3.results,
  )

  const releasedMovies = allMovies.filter(m => !upcomingSet.has(m.id))
  const yakindaMovies  = allMovies.filter(m => upcomingSet.has(m.id))

  const [filmTrailers, yakindaTrailers, diziTrailers] = await Promise.all([
    getTrailersForMovies(releasedMovies, 'film'),
    getTrailersForMovies(yakindaMovies, 'yakinda'),
    getTrailersForTV(allTV),
  ])

  const seenKeys = new Set<string>()
  const trailers: TrailerItem[] = [
    ...filmTrailers,
    ...yakindaTrailers,
    ...diziTrailers,
  ].filter(t => {
    const key = `${t.type}-${t.id}`
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[--accent]/15">
            <IconPlay className="h-5 w-5 text-[--accent]" />
          </div>
          <h1 className="text-3xl font-bold text-white">{t('trailer.title')}</h1>
        </div>
        <p className="text-[--text-secondary] ml-14">
          {trailers.length} {t('trailer.count')} · {t('trailer.description')}
        </p>
      </div>

      <FragmanlarClient trailers={trailers} />
    </div>
  )
}
