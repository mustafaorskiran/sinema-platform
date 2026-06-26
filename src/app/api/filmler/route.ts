import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  discoverMovies, getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies,
} from '@/lib/tmdb'

const PAGE_SIZE = 40

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get('sayfa')) || 1)
  const genre    = searchParams.get('genre')    ?? undefined
  const sirala   = searchParams.get('sirala')   ?? undefined
  const platform = searchParams.get('platform') ?? undefined
  const kategori = searchParams.get('kategori') ?? 'populer'
  const tarihten = searchParams.get('tarihten') ?? undefined
  const tarihe   = searchParams.get('tarihe')   ?? undefined
  const min_puan = searchParams.get('min_puan') ?? undefined
  const min_oy   = searchParams.get('min_oy')   ?? undefined
  const dil      = searchParams.get('dil')      ?? undefined
  const min_sure = searchParams.get('min_sure') ?? undefined
  const max_sure = searchParams.get('max_sure') ?? undefined
  const keyword  = searchParams.get('keyword')  ?? undefined
  // legacy
  const yil      = searchParams.get('yil')      ?? undefined
  const puan     = searchParams.get('puan')      ?? undefined

  const minRating = min_puan || puan
  const hasCustomFilters = !!(genre || tarihten || tarihe || min_puan || min_oy || platform || sirala || dil || min_sure || max_sure || keyword)

  try {
    let results: any[]  = []
    let total_pages = 1

    if (kategori === 'vizyonda' && !hasCustomFilters) {
      const data = await getNowPlayingMovies(page).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results ?? []
      total_pages = (data as any).total_pages ?? 1
    } else if (kategori === 'yakinda' && !hasCustomFilters) {
      const data = await getUpcomingMovies(page).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results ?? []
      total_pages = (data as any).total_pages ?? 1
    } else if (kategori === 'en-iyi' && !hasCustomFilters) {
      const data = await getTopRatedMovies(page).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results ?? []
      total_pages = (data as any).total_pages ?? 1
    } else if (hasCustomFilters || platform) {
      const effectiveSirala = sirala || (
        kategori === 'en-iyi'   ? 'vote_average.desc' :
        kategori === 'yakinda'  ? 'primary_release_date.asc' :
        kategori === 'vizyonda' ? 'primary_release_date.desc' : 'popularity.desc'
      )
      const data = await discoverMovies({
        page, genre, year: yil, minYear: tarihten, maxYear: tarihe,
        minRating, minVoteCount: min_oy, sortBy: effectiveSirala, provider: platform,
        language: dil,
        minRuntime: min_sure,
        maxRuntime: max_sure && Number(max_sure) < 400 ? max_sure : undefined,
      }).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results
      total_pages = data.total_pages
    } else {
      const supabase = await createClient()
      const { count: catalogCount } = await supabase
        .from('movies').select('*', { count: 'exact', head: true }).limit(1)

      if ((catalogCount ?? 0) > 5000) {
        let query = supabase.from('movies').select('*', { count: 'exact' })
        if (genre) {
          const id = parseInt(genre)
          if (!isNaN(id)) query = query.contains('genre_ids', [id])
        }
        if (yil)      query = query.eq('release_year', parseInt(yil))
        if (minRating) query = query.gte('vote_average', parseFloat(minRating))

        let orderCol = 'popularity', ascending = false
        if (sirala === 'vote_average.desc')              { orderCol = 'vote_average'; ascending = false }
        else if (sirala === 'vote_average.asc')          { orderCol = 'vote_average'; ascending = true  }
        else if (sirala === 'primary_release_date.desc') { orderCol = 'release_year'; ascending = false }
        else if (sirala === 'primary_release_date.asc')  { orderCol = 'release_year'; ascending = true  }

        const from = (page - 1) * PAGE_SIZE
        const { data, count } = await query
          .order(orderCol, { ascending })
          .order('vote_count', { ascending: false })
          .range(from, from + PAGE_SIZE - 1)

        results = (data ?? []).map((m: any) => ({
          id: m.tmdb_id, title: m.title, original_title: m.original_title,
          overview: m.overview, poster_path: m.poster_path,
          release_date: m.release_date, vote_average: m.vote_average,
          vote_count: m.vote_count, popularity: m.popularity, genre_ids: m.genre_ids,
        }))
        total_pages = Math.min(500, Math.ceil((count ?? 0) / PAGE_SIZE))
      } else {
        const data = await discoverMovies({
          page, genre, year: yil, minRating, sortBy: sirala,
        }).catch(() => ({ results: [], total_pages: 1 }))
        results     = data.results
        total_pages = data.total_pages
      }
    }

    return NextResponse.json({ results, total_pages })
  } catch {
    return NextResponse.json({ results: [], total_pages: 1 }, { status: 500 })
  }
}
