import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { discoverSeries } from '@/lib/tmdb'

const PAGE_SIZE = 40

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get('sayfa')) || 1)
  const genre    = searchParams.get('genre')    ?? undefined
  const sirala   = searchParams.get('sirala')   ?? undefined
  const platform = searchParams.get('platform') ?? undefined
  const tarihten = searchParams.get('tarihten') ?? undefined
  const tarihe   = searchParams.get('tarihe')   ?? undefined
  const puan     = searchParams.get('puan')     ?? undefined
  const min_oy   = searchParams.get('min_oy')   ?? undefined
  const dil      = searchParams.get('dil')      ?? undefined
  const q        = searchParams.get('q')        ?? undefined
  // legacy
  const yil      = searchParams.get('yil')      ?? undefined

  const hasCustomFilters = !!(genre || tarihten || tarihe || puan || min_oy || platform || sirala || dil)

  try {
    let results: any[] = []
    let total_pages = 1

    if (hasCustomFilters) {
      const data = await discoverSeries({
        page, genre, year: yil, minYear: tarihten, maxYear: tarihe,
        minRating: puan, minVoteCount: min_oy,
        sortBy: sirala, provider: platform, language: dil,
      }).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results
      total_pages = data.total_pages
    } else {
      const supabase = await createClient()
      const { count: catalogCount } = await supabase
        .from('series').select('*', { count: 'exact', head: true }).limit(1)

      if ((catalogCount ?? 0) > 1000) {
        let query = supabase.from('series').select('*', { count: 'exact' })
        if (q?.trim()) query = query.or(`name.ilike.%${q.trim()}%,original_name.ilike.%${q.trim()}%`)
        if (genre) {
          const ids = genre.split(',').map(Number).filter(Boolean)
          if (ids.length === 1) query = query.contains('genre_ids', ids)
        }
        if (yil)  query = query.eq('first_air_year', parseInt(yil))
        if (puan) query = query.gte('vote_average', parseFloat(puan))
        if (dil)  query = query.eq('original_language', dil)

        let orderCol = 'popularity', ascending = false
        if (sirala === 'vote_average.desc')        { orderCol = 'vote_average';   ascending = false }
        else if (sirala === 'vote_average.asc')    { orderCol = 'vote_average';   ascending = true  }
        else if (sirala === 'first_air_date.desc') { orderCol = 'first_air_year'; ascending = false }
        else if (sirala === 'first_air_date.asc')  { orderCol = 'first_air_year'; ascending = true  }

        const from = (page - 1) * PAGE_SIZE
        const { data, count } = await query
          .order(orderCol, { ascending })
          .order('vote_count', { ascending: false })
          .range(from, from + PAGE_SIZE - 1)

        results = (data ?? []).map((s: any) => ({
          id: s.tmdb_id, name: s.name, original_name: s.original_name,
          overview: s.overview, poster_path: s.poster_path,
          first_air_date: s.first_air_date, vote_average: s.vote_average,
          vote_count: s.vote_count, popularity: s.popularity, genre_ids: s.genre_ids,
        }))
        total_pages = Math.min(500, Math.ceil((count ?? 0) / PAGE_SIZE))
      } else {
        const data = await discoverSeries({
          page, genre, year: yil, minRating: puan, sortBy: sirala,
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
