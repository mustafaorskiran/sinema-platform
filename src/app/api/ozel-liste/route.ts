import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { CURATED_LISTS } from '@/lib/curated-lists'
import {
  discoverMovieRaw, discoverTVRaw, getTopRatedMoviesRaw, getTopRatedTVRaw,
  getPosterUrl, getMediaTitle, getMediaYear,
} from '@/lib/tmdb'

function fetchListItems(list: (typeof CURATED_LISTS)[number], page: number) {
  switch (list.endpoint) {
    case 'discover_movie': return discoverMovieRaw(list.params, page)
    case 'discover_tv': return discoverTVRaw(list.params, page)
    case 'top_rated_movie': return getTopRatedMoviesRaw(list.params, page)
    case 'top_rated_tv': return getTopRatedTVRaw(list.params, page)
  }
}

/// Mobil için /ozel-listeler/[slug] sayfasının aynısı — sabit CURATED_LISTS.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-ozel-liste:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  const list = CURATED_LISTS.find(l => l.slug === slug)
  if (!list) return NextResponse.json({ error: 'Liste bulunamadı' }, { status: 404 })

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('sayfa')) || 1)

  try {
    const data = await fetchListItems(list, page).catch(() => ({ results: [], total_pages: 1 }))
    const items = (data.results ?? []).map((m, idx) => ({
      id: m.id, mediaType: list.mediaType,
      title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'),
      year: getMediaYear(m), rating: m.vote_average ?? null,
      rank: (page - 1) * 20 + idx + 1,
    }))

    return NextResponse.json({
      title: list.title,
      description: list.description,
      mediaType: list.mediaType,
      items,
      totalPages: Math.min(data.total_pages ?? 1, 10),
    })
  } catch {
    return NextResponse.json({ items: [], totalPages: 1 }, { status: 500 })
  }
}
