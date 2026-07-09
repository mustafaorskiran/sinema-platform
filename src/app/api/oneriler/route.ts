import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { discoverMovies, discoverSeries, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { GENRE_MAP } from '@/lib/genres'
import type { TMDbMovie } from '@/lib/types'

const PLATFORM_NAMES: Record<number, string> = {
  8: 'Netflix', 9: 'Amazon Prime', 337: 'Disney+', 350: 'Apple TV+',
  1899: 'Max', 341: 'Blu TV', 11: 'MUBI', 531: 'Paramount+', 1770: 'Gain', 188: 'YouTube Premium',
}

const MOVIE_ID_TO_GENRE: Record<number, { name: string; tvId: number | null; slug: string }> = {}
for (const [slug, info] of Object.entries(GENRE_MAP)) {
  if (info.movieGenreId) MOVIE_ID_TO_GENRE[info.movieGenreId] = { name: info.name, tvId: info.tvGenreId, slug }
}

function mapList(results: TMDbMovie[], mediaType: 'film' | 'dizi', excludeIds: Set<number>) {
  return results.filter(m => !excludeIds.has(m.id)).slice(0, 12).map(m => ({
    id: m.id, mediaType,
    title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'),
    year: getMediaYear(m), rating: m.vote_average ?? null,
  }))
}

/// Mobil için /oneriler sayfasının aynısı — onboarding tür/platform tercihine
/// göre kişisel akış. Kullanıcıya özel veriler (izlenenler, tercihler) mobil
/// tarafta doğrudan Supabase'den okunur; bu route sadece TMDb tarafını sarar.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-oneriler:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const genreIds = (req.nextUrl.searchParams.get('genreIds') ?? '').split(',').map(Number).filter(Boolean).slice(0, 3)
  const platformIds = (req.nextUrl.searchParams.get('platformIds') ?? '').split(',').map(Number).filter(Boolean).slice(0, 2)
  const excludeIds = new Set((req.nextUrl.searchParams.get('exclude') ?? '').split(',').map(Number).filter(Boolean))

  try {
    const [genreSections, platformSections, [popularMovies, topRatedMovies, popularSeries, topRatedSeries]] = await Promise.all([
      Promise.all(genreIds.map(async id => {
        const g = MOVIE_ID_TO_GENRE[id]
        if (!g) return null
        const [movieRes, seriesRes] = await Promise.all([
          discoverMovies({ sortBy: 'popularity.desc', genre: String(id), minRating: '6' }).catch(() => ({ results: [] })),
          g.tvId ? discoverSeries({ sortBy: 'popularity.desc', genre: String(g.tvId), minRating: '6' }).catch(() => ({ results: [] })) : Promise.resolve({ results: [] }),
        ])
        const items = [...mapList(movieRes.results ?? [], 'film', excludeIds).slice(0, 6), ...mapList(seriesRes.results ?? [], 'dizi', excludeIds).slice(0, 6)]
        return { name: g.name, slug: g.slug, items }
      })),
      Promise.all(platformIds.map(async pid => {
        const res = await discoverMovies({ sortBy: 'popularity.desc', provider: String(pid), minRating: '7' }).catch(() => ({ results: [] }))
        return { name: PLATFORM_NAMES[pid] ?? `Platform ${pid}`, items: mapList(res.results ?? [], 'film', excludeIds) }
      })),
      Promise.all([
        discoverMovies({ sortBy: 'popularity.desc', minRating: '7' }).catch(() => ({ results: [] })),
        discoverMovies({ sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })),
        discoverSeries({ sortBy: 'popularity.desc', minRating: '7' }).catch(() => ({ results: [] })),
        discoverSeries({ sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })),
      ]),
    ])

    return NextResponse.json({
      genreSections: genreSections.filter(Boolean),
      platformSections: platformSections.filter(s => s.items.length > 0),
      popularMovies: mapList(popularMovies.results ?? [], 'film', excludeIds),
      topRatedMovies: mapList(topRatedMovies.results ?? [], 'film', excludeIds),
      popularSeries: mapList(popularSeries.results ?? [], 'dizi', excludeIds),
      topRatedSeries: mapList(topRatedSeries.results ?? [], 'dizi', excludeIds),
    })
  } catch {
    return NextResponse.json({ genreSections: [], platformSections: [], popularMovies: [], topRatedMovies: [], popularSeries: [], topRatedSeries: [] }, { status: 500 })
  }
}
