import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import {
  getPosterUrl, getMediaTitle, getMediaYear, getActiveTMDbLanguage,
  getPopularMovies, getPopularSeries, getTrendingMovies, getTrendingTV,
  getUpcomingMovies, getUpcomingTV, getNowPlayingMovies,
} from '@/lib/tmdb'
import type { TMDbMovie } from '@/lib/types'

/// Mobil için tek çatı altında toplanmış TMDb kategori listeleri —
/// web'deki top10/haftalik/gise/en-beklenen sayfalarının ortak veri
/// kaynağı. Aynı desende: /api/filmler, /api/kisiler.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-kesif-listeleri:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const tip = req.nextUrl.searchParams.get('tip') ?? 'top10-film'
  const donem = req.nextUrl.searchParams.get('donem') ?? 'hafta'
  const lang = await getActiveTMDbLanguage()

  function mapList(results: TMDbMovie[], mediaType: 'film' | 'dizi') {
    return results.slice(0, 20).map(m => ({
      id: m.id,
      mediaType,
      title: getMediaTitle(m),
      poster: getPosterUrl(m.poster_path, 'w342'),
      year: getMediaYear(m),
      rating: m.vote_average ?? null,
    }))
  }

  try {
    if (tip === 'gise-tr' || tip === 'gise-dunya') {
      const results = tip === 'gise-tr' ? await getPopularMovies(1) : await getTrendingMovies()
      return NextResponse.json({ items: mapList(results.results ?? [], 'film') })
    }

    if (tip === 'yakinda-film') {
      const results = await getUpcomingMovies(1)
      return NextResponse.json({ items: mapList(results.results ?? [], 'film') })
    }

    if (tip === 'vizyonda') {
      const results = await getNowPlayingMovies(1, 'TR')
      return NextResponse.json({ items: mapList(results.results ?? [], 'film') })
    }

    if (tip === 'yakinda-dizi') {
      const results = await getUpcomingTV(1)
      return NextResponse.json({ items: mapList(results.results ?? [], 'dizi') })
    }

    if (tip === 'haftalik-trend') {
      const [filmR, diziR] = await Promise.all([getTrendingMovies(), getTrendingTV()])
      return NextResponse.json({
        filmler: mapList(filmR.results ?? [], 'film').slice(0, 5),
        diziler: mapList(diziR.results ?? [], 'dizi').slice(0, 5),
      })
    }

    // top10-film / top10-dizi — Supabase agregasyonu, yetersizse trend'e düş
    const mediaType = tip === 'top10-dizi' ? 'dizi' : 'film'
    const supabase = await createClient()
    const days = donem === 'ay' ? 30 : donem === 'tum' ? 0 : 7
    const cutoff = days > 0 ? new Date(Date.now() - days * 24 * 3600 * 1000).toISOString() : null

    let reviewQuery = supabase.from('reviews').select('media_id').eq('media_type', mediaType)
    let watchlistQuery = supabase.from('watchlist').select('media_id').eq('media_type', mediaType)
    if (cutoff) {
      reviewQuery = reviewQuery.gte('created_at', cutoff)
      watchlistQuery = watchlistQuery.gte('added_at', cutoff)
    }
    const [{ data: reviews }, { data: watchlist }] = await Promise.all([reviewQuery, watchlistQuery])

    const countMap = new Map<number, number>()
    for (const row of [...(reviews ?? []), ...(watchlist ?? [])]) {
      countMap.set(row.media_id, (countMap.get(row.media_id) ?? 0) + 1)
    }
    const sortedIds = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)

    if (sortedIds.length < 5) {
      const results = mediaType === 'film' ? await getTrendingMovies() : await getTrendingTV()
      return NextResponse.json({ items: mapList(results.results ?? [], mediaType) })
    }

    const TMDB_BASE = 'https://api.themoviedb.org/3'
    const apiKey = process.env.TMDB_BEARER_TOKEN ?? ''
    const type = mediaType === 'film' ? 'movie' : 'tv'
    const enriched = await Promise.all(sortedIds.map(async ([id, count]) => {
      try {
        const r = await fetch(`${TMDB_BASE}/${type}/${id}?language=${lang}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          next: { revalidate: 3600 },
        })
        if (!r.ok) return null
        const d = await r.json()
        return {
          id, mediaType, count,
          title: getMediaTitle(d), poster: getPosterUrl(d.poster_path, 'w342'),
          year: getMediaYear(d), rating: d.vote_average ?? null,
        }
      } catch { return null }
    }))

    return NextResponse.json({ items: enriched.filter(Boolean) })
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
