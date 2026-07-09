import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { discoverMovies, discoverSeries, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { GENRE_MAP } from '@/lib/genres'
import type { TMDbMovie } from '@/lib/types'

/// Mobil için /tur/[slug] sayfasının aynısı — genre discover + top picks.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-tur-kesif:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const slug = req.nextUrl.searchParams.get('tur') ?? ''
  const genre = GENRE_MAP[slug]
  if (!genre) return NextResponse.json({ error: 'Tür bulunamadı' }, { status: 404 })

  const hasMovies = genre.movieGenreId !== null
  const hasSeries = genre.tvGenreId !== null
  const tabParam = req.nextUrl.searchParams.get('tab')
  const activeTab = tabParam === 'dizi' && hasSeries ? 'dizi'
    : tabParam === 'film' && hasMovies ? 'film'
    : hasMovies ? 'film' : 'dizi'

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('sayfa')) || 1)
  const sirala = req.nextUrl.searchParams.get('sirala') ?? 'popularity.desc'
  const yil = req.nextUrl.searchParams.get('yil') ?? undefined
  const minPuan = req.nextUrl.searchParams.get('min_puan') ?? undefined

  function mapList(results: TMDbMovie[], mediaType: 'film' | 'dizi') {
    return results.map(m => ({
      id: m.id, mediaType,
      title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'),
      year: getMediaYear(m), rating: m.vote_average ?? null,
    }))
  }

  try {
    const discoverParams = { sortBy: sirala, page, minRating: minPuan, ...(yil ? { year: yil } : {}) }

    const [mainData, topPicksData] = await Promise.all([
      activeTab === 'film'
        ? discoverMovies({ genre: String(genre.movieGenreId), ...discoverParams }).catch(() => ({ results: [], total_pages: 1 }))
        : discoverSeries({ genre: String(genre.tvGenreId), ...discoverParams }).catch(() => ({ results: [], total_pages: 1 })),
      page === 1 && sirala === 'popularity.desc'
        ? (activeTab === 'film'
            ? discoverMovies({ genre: String(genre.movieGenreId), sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] }))
            : discoverSeries({ genre: String(genre.tvGenreId), sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })))
        : Promise.resolve(null),
    ])

    return NextResponse.json({
      name: genre.name,
      hasMovies, hasSeries, activeTab,
      items: mapList(mainData.results ?? [], activeTab),
      totalPages: mainData.total_pages ?? 1,
      topPicks: mapList((topPicksData?.results ?? []).slice(0, 6), activeTab),
    })
  } catch {
    return NextResponse.json({ items: [], totalPages: 1, topPicks: [] }, { status: 500 })
  }
}
