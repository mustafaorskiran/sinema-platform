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
  const yil      = searchParams.get('yil')      ?? undefined

  try {
    let results: any[] = []
    let total_pages = 1

    // Platform filtresi → TMDb (streaming verisi bizde yok)
    if (platform) {
      const data = await discoverSeries({
        page, genre, year: yil, minYear: tarihten, maxYear: tarihe,
        minRating: puan, minVoteCount: min_oy,
        sortBy: sirala, provider: platform, language: dil,
      }).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results
      total_pages = data.total_pages
      return NextResponse.json({ results, total_pages })
    }

    // Supabase catalog — büyük katalog için tüm filtreler desteklenir
    const supabase = await createClient()
    const { count: catalogCount } = await supabase
      .from('series').select('*', { count: 'exact', head: true }).limit(1)

    if ((catalogCount ?? 0) > 1000) {
      let query = supabase.from('series').select('*', { count: 'exact' })

      // Başlık arama (trigram index)
      if (q?.trim()) {
        query = query.or(`name.ilike.%${q.trim()}%,original_name.ilike.%${q.trim()}%`)
      }

      // Tür filtresi
      if (genre) {
        const genreIds = genre.split(',').map(Number).filter(Boolean)
        if (genreIds.length === 1) {
          query = query.contains('genre_ids', genreIds)
        } else if (genreIds.length > 1) {
          query = query.overlaps('genre_ids', genreIds)
        }
      }

      // Yıl filtresi
      if (yil)      query = query.eq('first_air_year', parseInt(yil))
      if (tarihten) query = query.gte('first_air_year', parseInt(tarihten))
      if (tarihe)   query = query.lte('first_air_year', parseInt(tarihe))

      // Puan filtreleri
      if (puan)   query = query.gte('vote_average', parseFloat(puan))
      if (min_oy) query = query.gte('vote_count', parseInt(min_oy))

      // Dil filtresi
      if (dil) query = query.eq('original_language', dil)

      // Sıralama
      let orderCol = 'popularity', ascending = false
      if (sirala === 'vote_average.desc')        { orderCol = 'vote_average';   ascending = false }
      else if (sirala === 'vote_average.asc')    { orderCol = 'vote_average';   ascending = true  }
      else if (sirala === 'first_air_date.desc') { orderCol = 'first_air_year'; ascending = false }
      else if (sirala === 'first_air_date.asc')  { orderCol = 'first_air_year'; ascending = true  }
      else if (sirala === 'name.asc')            { orderCol = 'name';           ascending = true  }

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
      total_pages = Math.ceil((count ?? 0) / PAGE_SIZE)

      return NextResponse.json({ results, total_pages })
    }

    // Fallback: küçük katalog → TMDb discover
    const data = await discoverSeries({
      page, genre, year: yil, minYear: tarihten, maxYear: tarihe,
      minRating: puan, minVoteCount: min_oy, sortBy: sirala, language: dil,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages

    return NextResponse.json({ results, total_pages })
  } catch {
    return NextResponse.json({ results: [], total_pages: 1 }, { status: 500 })
  }
}
