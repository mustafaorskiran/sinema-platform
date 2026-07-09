import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { discoverMovieRaw, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'

const TAB_PARAMS: Record<string, Record<string, string>> = {
  'tumü': { with_release_type: '6', sort_by: 'popularity.desc', 'vote_count.gte': '50' },
  turkiye: { with_release_type: '6', with_origin_country: 'TR', sort_by: 'popularity.desc', 'vote_count.gte': '10' },
  uluslararasi: { with_release_type: '6', without_original_language: 'tr', sort_by: 'popularity.desc', 'vote_count.gte': '100' },
}

/// Mobil için /tv-filmleri sayfasının aynısı.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-tv-filmleri:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const tab = req.nextUrl.searchParams.get('tab') ?? 'tumü'
  const siralama = req.nextUrl.searchParams.get('siralama') ?? undefined
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('sayfa')) || 1)

  const baseParams = TAB_PARAMS[tab] ?? TAB_PARAMS['tumü']
  const params = { ...baseParams, ...(siralama ? { sort_by: siralama } : {}) }

  try {
    const data = await discoverMovieRaw(params, page).catch(() => ({ results: [], total_pages: 1 }))
    const items = (data.results ?? []).map((m, idx) => ({
      id: m.id, mediaType: 'film' as const,
      title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'),
      year: getMediaYear(m), rating: m.vote_average ?? null,
      rank: (page - 1) * 20 + idx + 1,
    }))

    return NextResponse.json({ items, totalPages: Math.min(data.total_pages ?? 1, 10) })
  } catch {
    return NextResponse.json({ items: [], totalPages: 1 }, { status: 500 })
  }
}
