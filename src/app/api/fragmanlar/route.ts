import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import {
  getTrendingMovies, getTrendingTV, getUpcomingMovies, getNowPlayingMovies, getOnAirTV,
  getTrailersForMovies, getTrailersForTV,
} from '@/lib/tmdb'
import type { TrailerItem, TMDbMovie } from '@/lib/types'

function mergeUnique(...lists: TMDbMovie[][]): TMDbMovie[] {
  const seen = new Set<number>()
  return lists.flat().filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

/// Mobil için /fragmanlar sayfasının aynısı — daha az kaynak sayfası ile
/// sadeleştirilmiş (bkz. /api/yayin-takvimi'ndeki aynı yaklaşım).
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-fragmanlar:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  try {
    const [trending, nowPlaying1, upcoming1, upcoming2, trendingTV, onAir1, onAir2] = await Promise.all([
      getTrendingMovies(),
      getNowPlayingMovies(1),
      getUpcomingMovies(1),
      getUpcomingMovies(2),
      getTrendingTV(),
      getOnAirTV(1),
      getOnAirTV(2),
    ])

    const today = new Date().toISOString().split('T')[0]
    const upcomingSet = new Set(
      [...upcoming1.results, ...upcoming2.results].filter(m => (m.release_date ?? '') > today).map(m => m.id)
    )

    const allMovies = mergeUnique(trending.results, nowPlaying1.results, upcoming1.results, upcoming2.results)
    const allTV = mergeUnique(trendingTV.results, onAir1.results, onAir2.results)

    const releasedMovies = allMovies.filter(m => !upcomingSet.has(m.id))
    const yakindaMovies = allMovies.filter(m => upcomingSet.has(m.id))

    const [filmTrailers, yakindaTrailers, diziTrailers] = await Promise.all([
      getTrailersForMovies(releasedMovies, 'film'),
      getTrailersForMovies(yakindaMovies, 'yakinda'),
      getTrailersForTV(allTV),
    ])

    const seenKeys = new Set<string>()
    const trailers: TrailerItem[] = [...filmTrailers, ...yakindaTrailers, ...diziTrailers].filter(t => {
      const key = `${t.type}-${t.id}`
      if (seenKeys.has(key)) return false
      seenKeys.add(key)
      return true
    })

    return NextResponse.json({ items: trailers })
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
