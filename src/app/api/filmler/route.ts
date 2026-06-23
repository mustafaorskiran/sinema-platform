import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { discoverMovies } from '@/lib/tmdb'

const PAGE_SIZE = 40

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get('sayfa')) || 1)
  const genre    = searchParams.get('genre')    ?? undefined
  const yil      = searchParams.get('yil')      ?? undefined
  const puan     = searchParams.get('puan')     ?? undefined
  const sirala   = searchParams.get('sirala')   ?? undefined
  const dil      = searchParams.get('dil')      ?? undefined
  const platform = searchParams.get('platform') ?? undefined
  const q        = searchParams.get('q')        ?? undefined

  try {
    const supabase = await createClient()

    let results: any[] = []
    let total_pages = 1

    if (platform) {
      const data = await discoverMovies({
        page, genre, year: yil, minRating: puan, sortBy: sirala, provider: platform,
      }).catch(() => ({ results: [], total_pages: 1 }))
      results = data.results
      total_pages = data.total_pages
    } else {
      const { count: catalogCount } = await supabase
        .from('movies').select('*', { count: 'exact', head: true }).limit(1)

      if ((catalogCount ?? 0) > 5000) {
        let query = supabase.from('movies').select('*', { count: 'exact' })
        if (q?.trim()) {
          query = query.or(`title.ilike.%${q.trim()}%,original_title.ilike.%${q.trim()}%`)
        }
        if (genre) {
          const id = parseInt(genre)
          if (!isNaN(id)) query = query.contains('genre_ids', [id])
        }
        if (yil)  query = query.eq('release_year', parseInt(yil))
        if (puan) query = query.gte('vote_average', parseFloat(puan))
        if (dil)  query = query.eq('original_language', dil)

        let orderCol = 'popularity'
        let ascending = false
        if (sirala === 'vote_average.desc')      { orderCol = 'vote_average'; ascending = false }
        else if (sirala === 'vote_average.asc')  { orderCol = 'vote_average'; ascending = true  }
        else if (sirala === 'release_date.desc') { orderCol = 'release_year'; ascending = false }
        else if (sirala === 'release_date.asc')  { orderCol = 'release_year'; ascending = true  }

        const from = (page - 1) * PAGE_SIZE
        const { data, count } = await query
          .order(orderCol, { ascending })
          .order('vote_count', { ascending: false })
          .range(from, from + PAGE_SIZE - 1)

        results = (data ?? []).map((m: any) => ({
          id:             m.tmdb_id,
          title:          m.title,
          original_title: m.original_title,
          overview:       m.overview,
          poster_path:    m.poster_path,
          release_date:   m.release_date,
          vote_average:   m.vote_average,
          vote_count:     m.vote_count,
          popularity:     m.popularity,
          genre_ids:      m.genre_ids,
        }))
        total_pages = Math.min(500, Math.ceil((count ?? 0) / PAGE_SIZE))
      } else {
        const data = await discoverMovies({
          page, genre, year: yil, minRating: puan, sortBy: sirala,
        }).catch(() => ({ results: [], total_pages: 1 }))
        results = data.results
        total_pages = data.total_pages
      }
    }

    return NextResponse.json({ results, total_pages })
  } catch (err) {
    return NextResponse.json({ results: [], total_pages: 1 }, { status: 500 })
  }
}
