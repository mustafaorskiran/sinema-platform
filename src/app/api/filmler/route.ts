import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  discoverMovies, getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies,
} from '@/lib/tmdb'
import { sanitizeSearchInput } from '@/lib/sanitizeSearch'
import { getCachedCatalogCount } from '@/lib/catalogSize'

/// Aynı filtre kombinasyonuyla gelen tekrar istekler (infinite-scroll,
/// farklı kullanıcılar) 60sn boyunca CDN/proxy seviyesinde önbellekten
/// karşılanır — TMDb/Supabase'e her seferinde gitmeyi önler.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

const PAGE_SIZE = 40

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page      = Math.max(1, Number(searchParams.get('sayfa')) || 1)
  const genre     = searchParams.get('genre')    ?? undefined
  const sirala    = searchParams.get('sirala')   ?? undefined
  const platform  = searchParams.get('platform') ?? undefined
  const kategori  = searchParams.get('kategori') ?? 'populer'
  const tarihten  = searchParams.get('tarihten') ?? undefined
  const tarihe    = searchParams.get('tarihe')   ?? undefined
  const min_puan  = searchParams.get('min_puan') ?? undefined
  const min_oy    = searchParams.get('min_oy')   ?? undefined
  const dil       = searchParams.get('dil')      ?? undefined
  const min_sure  = searchParams.get('min_sure') ?? undefined
  const max_sure  = searchParams.get('max_sure') ?? undefined
  const keyword   = searchParams.get('keyword')  ?? undefined
  const yil       = searchParams.get('yil')      ?? undefined
  const puan      = searchParams.get('puan')      ?? undefined

  const minRating = min_puan || puan

  try {
    let results: any[] = []
    let total_pages = 1

    // Vizyonda / Yakında / En-iyi tabs → her zaman TMDb (gerçek zamanlı veri)
    const isRealtime = !genre && !tarihten && !tarihe && !minRating && !min_oy && !dil && !keyword && !sirala && !platform && !yil
    if (kategori === 'vizyonda' && isRealtime) {
      const data = await getNowPlayingMovies(page).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results ?? []
      total_pages = (data as any).total_pages ?? 1
      return NextResponse.json({ results, total_pages }, { headers: CACHE_HEADERS })
    }
    if (kategori === 'yakinda' && isRealtime) {
      const data = await getUpcomingMovies(page).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results ?? []
      total_pages = (data as any).total_pages ?? 1
      return NextResponse.json({ results, total_pages }, { headers: CACHE_HEADERS })
    }

    // Platform filtresi → TMDb (streaming verisi bizde yok)
    if (platform) {
      const effectiveSirala = sirala ?? 'popularity.desc'
      const data = await discoverMovies({
        page, genre, year: yil, minYear: tarihten, maxYear: tarihe,
        minRating, minVoteCount: min_oy, sortBy: effectiveSirala, provider: platform,
        language: dil, minRuntime: min_sure,
        maxRuntime: max_sure && Number(max_sure) < 400 ? max_sure : undefined,
      }).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results
      total_pages = data.total_pages
      return NextResponse.json({ results, total_pages }, { headers: CACHE_HEADERS })
    }

    // Supabase catalog — büyük katalog için tüm filtreler desteklenir
    const supabase = await createClient()
    const catalogCount = await getCachedCatalogCount('movies')

    if (catalogCount > 10000) {
      let query = supabase.from('movies').select('*', { count: 'exact' })

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
      if (yil)      query = query.eq('release_year', parseInt(yil))
      if (tarihten) query = query.gte('release_year', parseInt(tarihten))
      if (tarihe)   query = query.lte('release_year', parseInt(tarihe))

      // Puan filtreleri
      if (minRating) query = query.gte('vote_average', parseFloat(minRating))
      if (min_oy)    query = query.gte('vote_count', parseInt(min_oy))

      // Dil filtresi
      if (dil) query = query.eq('original_language', dil)

      // Başlık arama (trigram index)
      if (keyword?.trim()) {
        const kw = sanitizeSearchInput(keyword.trim())
        query = query.or(`title.ilike.%${kw}%,original_title.ilike.%${kw}%`)
      }

      // Sıralama
      let orderCol = 'popularity'
      let ascending = false
      if (kategori === 'en-iyi' && !sirala)              { orderCol = 'vote_average'; ascending = false }
      if (sirala === 'vote_average.desc')                 { orderCol = 'vote_average'; ascending = false }
      else if (sirala === 'vote_average.asc')             { orderCol = 'vote_average'; ascending = true  }
      else if (sirala === 'primary_release_date.desc')    { orderCol = 'release_year'; ascending = false }
      else if (sirala === 'primary_release_date.asc')     { orderCol = 'release_year'; ascending = true  }
      else if (sirala === 'title.asc')                    { orderCol = 'title';        ascending = true  }
      else if (sirala === 'revenue.desc')                 { orderCol = 'popularity';   ascending = false }

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
      total_pages = Math.ceil((count ?? 0) / PAGE_SIZE)

      return NextResponse.json({ results, total_pages }, { headers: CACHE_HEADERS })
    }

    // Fallback: küçük katalog veya en-iyi sekmesi → TMDb discover
    if (kategori === 'en-iyi' && isRealtime) {
      const data = await getTopRatedMovies(page).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results ?? []
      total_pages = (data as any).total_pages ?? 1
    } else {
      const effectiveSirala = sirala || (
        kategori === 'en-iyi'   ? 'vote_average.desc' :
        kategori === 'yakinda'  ? 'primary_release_date.asc' :
        kategori === 'vizyonda' ? 'primary_release_date.desc' : 'popularity.desc'
      )
      const data = await discoverMovies({
        page, genre, year: yil, minYear: tarihten, maxYear: tarihe,
        minRating, minVoteCount: min_oy, sortBy: effectiveSirala,
        language: dil, minRuntime: min_sure,
        maxRuntime: max_sure && Number(max_sure) < 400 ? max_sure : undefined,
      }).catch(() => ({ results: [], total_pages: 1 }))
      results     = data.results
      total_pages = data.total_pages
    }

    return NextResponse.json({ results, total_pages }, { headers: CACHE_HEADERS })
  } catch {
    return NextResponse.json({ results: [], total_pages: 1 }, { status: 500 })
  }
}
