import Link from 'next/link'
import InfiniteGrid from '@/components/InfiniteGrid'
import FilmlerSidebar from '@/components/FilmlerSidebar'
import { FILM_GENRES } from '@/lib/film-genres'
import { OZEL_KATEGORILER } from '@/lib/ozel-kategoriler'
import { createClient } from '@/lib/supabase/server'
import {
  discoverMovies, getMovieProviderList, getMoviesByIds,
  getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies,
} from '@/lib/tmdb'
import { OSCAR_WINNER_IDS } from '@/lib/oscar-winners'
import { KULT_FILM_IDS } from '@/lib/kult-filmler'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Filmler',
  description: 'Türkçe film arşivi — türe, yıla ve platforma göre filtrele, puan ver ve yorum yaz.',
  alternates: { canonical: '/filmler' },
}

const KATEGORI_TABS = [
  { key: 'populer',  label: 'Popüler'             },
  { key: 'vizyonda', label: 'Şu Anda Vizyonda'     },
  { key: 'yakinda',  label: 'Yakında'              },
  { key: 'en-iyi',   label: 'En Fazla Oy Alan'     },
]

const KATEGORI_TITLES: Record<string, string> = {
  populer:  'Popüler Filmler',
  vizyonda: 'Şu Anda Vizyonda',
  yakinda:  'Yakında Çıkacak Filmler',
  'en-iyi': 'En Fazla Oy Alan Filmler',
}

const PAGE_SIZE = 40

interface Props {
  searchParams: Promise<{
    sayfa?: string; genre?: string; sirala?: string; platform?: string; ozel?: string
    kategori?: string; tarihten?: string; tarihe?: string; min_puan?: string; min_oy?: string
    // legacy params kept for compat
    yil?: string; puan?: string; dil?: string
  }>
}

export default async function FilmlerPage({ searchParams }: Props) {
  const {
    sayfa, genre, sirala, platform, ozel,
    kategori = 'populer', tarihten, tarihe, min_puan, min_oy,
    yil, puan,
  } = await searchParams

  const ozelKat  = ozel ? OZEL_KATEGORILER.find(k => k.slug === ozel) : undefined
  const page     = Math.max(1, Number(sayfa) || 1)
  const minRating = min_puan || puan  // new param takes priority

  const hasCustomFilters = !!(genre || tarihten || tarihe || min_puan || min_oy || platform || sirala)

  const supabase = await createClient()

  const [movieProviders, { count: catalogCount }] = await Promise.all([
    getMovieProviderList('TR').catch(() => []),
    supabase.from('movies').select('*', { count: 'exact', head: true }).limit(1),
  ])

  let results: any[] = []
  let total_pages = 1
  let totalCount = 0

  // Special categories bypass normal flow
  if (ozelKat?.slug === 'oscar-kazananlar') {
    const allIds = OSCAR_WINNER_IDS
    total_pages = Math.ceil(allIds.length / PAGE_SIZE)
    results = await getMoviesByIds(allIds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
  } else if (ozelKat?.slug === 'kult-filmler') {
    const allIds = KULT_FILM_IDS
    total_pages = Math.ceil(allIds.length / PAGE_SIZE)
    results = await getMoviesByIds(allIds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
  } else if (ozelKat) {
    const data = await discoverMovies({
      page,
      genre: ozelKat.genre || genre,
      year: yil, sortBy: sirala,
      minRating: ozelKat.minRating || minRating,
      provider: platform,
      keywords: ozelKat.keywords,
      maxYear: ozelKat.maxYear,
      language: ozelKat.language,
      excludeLanguage: ozelKat.excludeLanguage,
      maxRuntime: ozelKat.maxRuntime,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  } else if (kategori === 'vizyonda' && !hasCustomFilters) {
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
    // Any filter applied → use discover
    const effectiveSirala = sirala || (
      kategori === 'en-iyi'   ? 'vote_average.desc' :
      kategori === 'yakinda'  ? 'primary_release_date.asc' :
      kategori === 'vizyonda' ? 'primary_release_date.desc' : 'popularity.desc'
    )
    const data = await discoverMovies({
      page, genre,
      year: yil, minYear: tarihten, maxYear: tarihe,
      minRating, minVoteCount: min_oy,
      sortBy: effectiveSirala, provider: platform,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  } else if ((catalogCount ?? 0) > 5000) {
    // Supabase catalog
    let query = supabase.from('movies').select('*', { count: 'exact' })
    if (genre) {
      const genreId = parseInt(genre)
      if (!isNaN(genreId)) query = query.contains('genre_ids', [genreId])
    }
    if (yil)  query = query.eq('release_year', parseInt(yil))
    if (minRating) query = query.gte('vote_average', parseFloat(minRating))

    let orderCol = 'popularity', ascending = false
    if (sirala === 'vote_average.desc')              { orderCol = 'vote_average'; ascending = false }
    else if (sirala === 'vote_average.asc')          { orderCol = 'vote_average'; ascending = true  }
    else if (sirala === 'primary_release_date.desc') { orderCol = 'release_year'; ascending = false }
    else if (sirala === 'primary_release_date.asc')  { orderCol = 'release_year'; ascending = true  }

    const from = (page - 1) * PAGE_SIZE
    const { data, count, error } = await query
      .order(orderCol, { ascending })
      .order('vote_count', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!error && data) {
      results = data.map((m: any) => ({
        id: m.tmdb_id, title: m.title, original_title: m.original_title,
        overview: m.overview, poster_path: m.poster_path,
        release_date: m.release_date, vote_average: m.vote_average,
        vote_count: m.vote_count, popularity: m.popularity, genre_ids: m.genre_ids,
      }))
      totalCount  = count ?? 0
      total_pages = Math.min(500, Math.ceil(totalCount / PAGE_SIZE))
    }
  } else {
    const data = await discoverMovies({
      page, genre, year: yil, minRating, sortBy: sirala,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  }

  // Sinezon puanları
  let sinemaPuanMap: Record<number, { avg: number; count: number }> = {}
  if (results.length > 0) {
    const mediaIds = results.map((m: any) => m.id)
    const { data: ratingRows } = await supabase
      .from('reviews').select('media_id, rating')
      .in('media_id', mediaIds).eq('media_type', 'film').gt('rating', 0)
    const sums: Record<number, { sum: number; count: number }> = {}
    for (const r of ratingRows ?? []) {
      if (!sums[r.media_id]) sums[r.media_id] = { sum: 0, count: 0 }
      sums[r.media_id].sum   += r.rating
      sums[r.media_id].count += 1
    }
    for (const [id, { sum, count }] of Object.entries(sums)) {
      sinemaPuanMap[Number(id)] = { avg: sum / count, count }
    }
  }

  // Grid API params
  const gridParams: Record<string, string> = {}
  if (genre)      gridParams.genre      = genre
  if (sirala)     gridParams.sirala     = sirala
  if (platform)   gridParams.platform   = platform
  if (tarihten)   gridParams.tarihten   = tarihten
  if (tarihe)     gridParams.tarihe     = tarihe
  if (min_puan)   gridParams.min_puan   = min_puan
  if (min_oy)     gridParams.min_oy     = min_oy
  if (kategori && kategori !== 'populer') gridParams.kategori = kategori

  // Active genre/kategori label for page title
  const activeGenreName = genre ? FILM_GENRES.find(g => String(g.id) === genre)?.name : null
  const pageTitle = ozelKat?.label
    ?? (activeGenreName ? `${activeGenreName} Filmleri` : KATEGORI_TITLES[kategori] ?? 'Popüler Filmler')

  // Build tab href (preserves genre/platform/filters, changes kategori)
  function tabHref(kat: string) {
    const p = new URLSearchParams()
    if (kat !== 'populer') p.set('kategori', kat)
    if (genre)    p.set('genre',    genre)
    if (platform) p.set('platform', platform)
    if (sirala)   p.set('sirala',   sirala)
    if (tarihten) p.set('tarihten', tarihten)
    if (tarihe)   p.set('tarihe',   tarihe)
    if (min_puan) p.set('min_puan', min_puan)
    if (min_oy)   p.set('min_oy',   min_oy)
    return `/filmler${p.toString() ? `?${p}` : ''}`
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex gap-6 items-start">

        {/* ── Left Sidebar ── */}
        <FilmlerSidebar
          providers={movieProviders}
          initialGenre={genre}
          initialPlatform={platform}
          initialSirala={sirala}
          initialTarihten={tarihten}
          initialTarihe={tarihe}
          initialMinPuan={min_puan}
          initialMinOy={min_oy}
        />

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">

          {/* Page title */}
          <h1 className="text-2xl font-bold text-white mb-5">
            {pageTitle}
            {totalCount > 0 && (
              <span className="ml-3 text-sm font-normal text-[--text-secondary]">
                {totalCount.toLocaleString('tr-TR')} sonuç
              </span>
            )}
          </h1>

          {/* Kategori tabs */}
          {!ozelKat && (
            <div className="flex border-b border-[--border] mb-6 -mx-1 px-1 overflow-x-auto">
              {KATEGORI_TABS.map(tab => (
                <Link
                  key={tab.key}
                  href={tabHref(tab.key)}
                  className={`shrink-0 px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                    kategori === tab.key || (!kategori && tab.key === 'populer')
                      ? 'border-[--accent] text-white'
                      : 'border-transparent text-[--text-secondary] hover:text-white'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className="text-center py-24 text-[--text-secondary]">
              <p className="text-4xl mb-4">🎬</p>
              <p>Bu filtrelerle eşleşen film bulunamadı.</p>
            </div>
          ) : (
            <InfiniteGrid
              key={JSON.stringify(gridParams)}
              initialItems={results}
              initialTotalPages={total_pages}
              apiPath="/api/filmler"
              searchParams={gridParams}
              type="film"
            />
          )}
        </main>

      </div>
    </div>
  )
}
