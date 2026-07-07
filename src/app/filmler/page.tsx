import Link from 'next/link'
import InfiniteGrid from '@/components/InfiniteGrid'
import FilmlerSidebar from '@/components/FilmlerSidebar'
import AdBanner from '@/components/AdBanner'
import { FILM_GENRES } from '@/lib/film-genres'
import { sanitizeSearchInput } from '@/lib/sanitizeSearch'
import { OZEL_KATEGORILER } from '@/lib/ozel-kategoriler'
import { createClient } from '@/lib/supabase/server'
import {
  discoverMovies, getMovieProviderList, getMoviesByIds,
  getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies,
} from '@/lib/tmdb'
import { OSCAR_WINNER_IDS } from '@/lib/oscar-winners'
import { KULT_FILM_IDS } from '@/lib/kult-filmler'
import { getTranslations } from '@/lib/i18n'
import { IconFilm } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Film Listesi ve Yorumları',
  description: 'En iyi filmler listesi — türe, yıla ve platforma göre filtrele, puan ver, film yorumu yaz.',
  alternates: { canonical: '/filmler' },
}

const KATEGORI_TABS = [
  { key: 'populer',        labelKey: 'browse.tabs.populer'  },
  { key: 'vizyonda',       labelKey: 'browse.tabs.vizyonda' },
  { key: 'yakinda',        labelKey: 'browse.tabs.yakinda'  },
  { key: 'en-iyi',         labelKey: 'browse.tabs.enIyi'    },
]

const KATEGORI_TITLE_KEYS: Record<string, string> = {
  populer:  'browse.titles.populerFilmler',
  vizyonda: 'browse.tabs.vizyonda',
  yakinda:  'browse.titles.yakindaCikacakFilmler',
  'en-iyi': 'browse.titles.enFazlaOyAlanFilmler',
}

const PAGE_SIZE = 40

interface Props {
  searchParams: Promise<{
    sayfa?: string; genre?: string; sirala?: string; platform?: string; ozel?: string
    kategori?: string; tarihten?: string; tarihe?: string; min_puan?: string; min_oy?: string
    dil?: string; min_sure?: string; max_sure?: string; keyword?: string; ulke?: string
    goster?: string; sertifikasyon?: string
    // legacy params kept for compat
    yil?: string; puan?: string
  }>
}

export default async function FilmlerPage({ searchParams }: Props) {
  const { t } = await getTranslations()
  const {
    sayfa, genre, sirala, platform, ozel,
    kategori = 'populer', tarihten, tarihe, min_puan, min_oy,
    dil, min_sure, max_sure, keyword, ulke,
    goster, sertifikasyon,
    yil, puan,
  } = await searchParams

  const ozelKat  = ozel ? OZEL_KATEGORILER.find(k => k.slug === ozel) : undefined
  const page     = Math.max(1, Number(sayfa) || 1)
  const minRating = min_puan || puan  // new param takes priority

  const isEnCokPuan = sirala === 'en-cok-puan'
  const hasCustomFilters = !isEnCokPuan && !!(genre || tarihten || tarihe || min_puan || min_oy || platform || sirala || dil || min_sure || max_sure || keyword || sertifikasyon)

  const supabase = await createClient()

  // Kullanıcı oturumu ve izleme listesi
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  let userWatchedIds: number[] = []
  if (isLoggedIn && (goster === 'gormediklerim' || goster === 'gorduklerim')) {
    const { data: watched } = await supabase
      .from('reviews')
      .select('media_id')
      .eq('user_id', user!.id)
      .eq('media_type', 'film')
    userWatchedIds = (watched ?? []).map((r: any) => Number(r.media_id))
  }

  const [movieProviders, { count: catalogCount }] = await Promise.all([
    getMovieProviderList('TR').catch(() => []),
    supabase.from('movies').select('*', { count: 'exact', head: true }).limit(1),
  ])

  let results: any[] = []
  let total_pages = 1
  let totalCount = 0

  // Special categories bypass normal flow
  if (goster === 'gorduklerim' && isLoggedIn && userWatchedIds.length > 0) {
    // Sadece kullanıcının izlediği filmler
    total_pages = Math.max(1, Math.ceil(userWatchedIds.length / PAGE_SIZE))
    const pageIds = userWatchedIds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    results = await getMoviesByIds(pageIds).catch(() => [])
    const orderMap = new Map(pageIds.map((id, i) => [id, i]))
    results.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
  } else if (goster === 'gorduklerim' && isLoggedIn && userWatchedIds.length === 0) {
    results = []
    total_pages = 1
  } else if (isEnCokPuan) {
    // Sinezon kullanıcı yorumlarına göre en çok puanlanan filmler
    const { data: topMedia } = await supabase.rpc('get_top_rated_media', {
      p_media_type: 'film',
      p_limit: PAGE_SIZE,
      p_offset: (page - 1) * PAGE_SIZE,
    })
    const { count: totalReviewed } = await supabase
      .from('reviews')
      .select('media_id', { count: 'exact', head: true })
      .eq('media_type', 'film')
      .gt('rating', 0)
    const ids = (topMedia as any[] ?? []).map((r: any) => Number(r.media_id))
    if (ids.length > 0) {
      results = await getMoviesByIds(ids).catch(() => [])
      // Preserve Supabase ordering
      const orderMap = new Map(ids.map((id, i) => [id, i]))
      results.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
    }
    total_pages = Math.max(1, Math.ceil((totalReviewed ?? 0) / PAGE_SIZE))
  } else if (ozelKat?.slug === 'oscar-kazananlar') {
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
  } else if (platform) {
    // Platform filtresi → TMDb (streaming verisi bizde yok)
    const effectiveSirala = sirala || 'popularity.desc'
    const data = await discoverMovies({
      page, genre,
      year: yil, minYear: tarihten, maxYear: tarihe,
      minRating, minVoteCount: min_oy,
      sortBy: effectiveSirala, provider: platform,
      watchRegion: ulke || 'TR',
      language: dil,
      minRuntime: min_sure,
      maxRuntime: max_sure && Number(max_sure) < 400 ? max_sure : undefined,
      certification: sertifikasyon,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  } else if ((catalogCount ?? 0) > 10000) {
    // Büyük Supabase kataloğu — tüm filtreler desteklenir
    let query = supabase.from('movies').select('*', { count: 'exact' })

    // Tür filtresi
    if (genre) {
      const genreIds = genre.split(',').map(Number).filter(Boolean)
      if (genreIds.length === 1) query = query.contains('genre_ids', genreIds)
      else if (genreIds.length > 1) query = query.overlaps('genre_ids', genreIds)
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
      total_pages = Math.ceil(totalCount / PAGE_SIZE)
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
  if (dil)        gridParams.dil        = dil
  if (min_sure)   gridParams.min_sure   = min_sure
  if (max_sure)   gridParams.max_sure   = max_sure
  if (keyword)    gridParams.keyword    = keyword
  if (ulke && ulke !== 'TR') gridParams.ulke = ulke
  if (kategori && kategori !== 'populer') gridParams.kategori = kategori
  if (sertifikasyon)        gridParams.sertifikasyon = sertifikasyon

  // Active genre/kategori label for page title
  const activeGenreName = genre
    ? (genre.includes(',')
      ? t('browse.selectedGenres')
      : FILM_GENRES.find(g => String(g.id) === genre)?.name ?? null)
    : null
  const pageTitle = goster === 'gorduklerim'
    ? t('browse.titles.izlediklerim')
    : goster === 'gormediklerim'
    ? t('browse.titles.izlemedigimPopuler')
    : isEnCokPuan
    ? t('browse.titles.enCokPuanlanan')
    : ozelKat?.label
      ?? (activeGenreName ? t('browse.titles.genreFilmleri', { genre: activeGenreName }) : t(KATEGORI_TITLE_KEYS[kategori] ?? 'browse.titles.populerFilmler'))

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
          initialDil={dil}
          initialMinSure={min_sure}
          initialMaxSure={max_sure}
          initialKeyword={keyword}
          initialUlke={ulke}
          initialGoster={goster}
          initialSertifikasyon={sertifikasyon}
          isLoggedIn={isLoggedIn}
        />

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">

          {/* Page title */}
          <h1 className="text-2xl font-bold text-white mb-5">
            {pageTitle}
            {totalCount > 0 && (
              <span className="ml-3 text-sm font-normal text-[--text-secondary]">
                {t('browse.resultCount', { count: totalCount.toLocaleString('tr-TR') })}
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
                  {t(tab.labelKey)}
                </Link>
              ))}
            </div>
          )}

          <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_1 ?? ''} format="horizontal" className="mb-5 rounded-xl overflow-hidden" />

          {results.length === 0 ? (
            <div className="text-center py-24 text-[--text-secondary]">
              <p className="mb-4 flex justify-center"><IconFilm size={40} /></p>
              <p>{t('browse.noResultsFilm')}</p>
            </div>
          ) : (
            <InfiniteGrid
              key={JSON.stringify(gridParams)}
              initialItems={results}
              initialTotalPages={total_pages}
              apiPath="/api/filmler"
              searchParams={gridParams}
              type="film"
              watchedIds={goster === 'gormediklerim' && isLoggedIn ? userWatchedIds : undefined}
              filterMode={goster === 'gormediklerim' && isLoggedIn ? 'gormediklerim' : undefined}
            />
          )}
        </main>

      </div>
    </div>
  )
}
