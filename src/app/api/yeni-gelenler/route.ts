import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getActiveTMDbLanguage, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import type { TMDbMovie, TMDbSearchResult } from '@/lib/types'

const BASE = 'https://api.themoviedb.org/3'

const PLATFORMS: Record<string, number> = {
  netflix: 8, disney: 337, prime: 9, mubi: 100, blu: 341, gain: 1770, paramount: 531, apple: 350,
}

async function fetchPlatformContent(providerId: number, mediaType: 'movie' | 'tv', lang: string): Promise<TMDbMovie[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString().split('T')[0]

  const dateField = mediaType === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte'
  const sortBy = mediaType === 'movie' ? 'release_date.desc' : 'first_air_date.desc'

  const url = new URL(`${BASE}/discover/${mediaType}`)
  url.searchParams.set('watch_region', 'TR')
  url.searchParams.set('with_watch_providers', String(providerId))
  url.searchParams.set('sort_by', sortBy)
  url.searchParams.set(dateField, dateStr)
  url.searchParams.set('page', '1')
  url.searchParams.set('language', lang)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`, accept: 'application/json' },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const data: TMDbSearchResult = await res.json()
  return (data.results ?? []).slice(0, 12)
}

/// Mobil için /yeni-gelenler sayfasının aynısı.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-yeni-gelenler:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const platform = req.nextUrl.searchParams.get('platform') ?? 'netflix'
  const tip = req.nextUrl.searchParams.get('tip') === 'dizi' ? 'dizi' : 'film'
  const providerId = PLATFORMS[platform] ?? PLATFORMS.netflix
  const lang = await getActiveTMDbLanguage()

  function mapList(results: TMDbMovie[], mediaType: 'film' | 'dizi') {
    return results.map(m => ({
      id: m.id, mediaType,
      title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'),
      year: getMediaYear(m), rating: m.vote_average ?? null,
    }))
  }

  try {
    const results = await fetchPlatformContent(providerId, tip === 'dizi' ? 'tv' : 'movie', lang)
    return NextResponse.json({ items: mapList(results, tip) })
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
