import Link from 'next/link'
import { IconFilm, IconList, IconGrid, IconChevronDown, IconChevronUp } from '@/components/icons'
import MovieCard from '@/components/MovieCard'
import MovieListItem from '@/components/MovieListItem'
import PlatformFilter from '@/components/PlatformFilter'
import Pagination from '@/components/Pagination'
import MobileFilterDrawer from '@/components/MobileFilterDrawer'
import InfiniteGrid from '@/components/InfiniteGrid'
import FilterPanel from '@/components/FilterPanel'
import { OZEL_KATEGORILER } from '@/lib/ozel-kategoriler'
import { createClient } from '@/lib/supabase/server'
import { discoverMovies, getMovieProviderList, getMoviesByIds } from '@/lib/tmdb'
import { OSCAR_WINNER_IDS } from '@/lib/oscar-winners'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Filmler',
  description: 'Türkçe film arşivi — türe, yıla ve platforma göre filtrele, puan ver ve yorum yaz.',
  alternates: { canonical: '/filmler' },
  openGraph: {
    title: 'Filmler | Sinezon',
    description: 'Türkçe film arşivi — türe, yıla ve platforma göre filtrele, puan ver ve yorum yaz.',
    url: '/filmler',
    type: 'website',
  },
}

const FILM_GENRES = [
  { id: 28,    name: 'Aksiyon',     count: '15.2K' },
  { id: 12,    name: 'Macera',      count: '8.4K'  },
  { id: 16,    name: 'Animasyon',   count: '6.1K'  },
  { id: 35,    name: 'Komedi',      count: '22.8K' },
  { id: 80,    name: 'Suç',         count: '9.3K'  },
  { id: 99,    name: 'Belgesel',    count: '18.6K' },
  { id: 18,    name: 'Drama',       count: '35.4K' },
  { id: 10751, name: 'Aile',        count: '7.2K'  },
  { id: 14,    name: 'Fantezi',     count: '5.8K'  },
  { id: 36,    name: 'Tarih',       count: '4.9K'  },
  { id: 27,    name: 'Korku',       count: '12.7K' },
  { id: 10402, name: 'Müzik',       count: '3.8K'  },
  { id: 9648,  name: 'Gizem',       count: '5.1K'  },
  { id: 10749, name: 'Romantik',    count: '9.4K'  },
  { id: 878,   name: 'Bilim Kurgu', count: '10.2K' },
  { id: 53,    name: 'Gerilim',     count: '14.8K' },
  { id: 10752, name: 'Savaş',       count: '3.6K'  },
  { id: 37,    name: 'Western',     count: '2.9K'  },
]

const GENRE_ID_TO_NAME: Record<number, string> = Object.fromEntries(
  FILM_GENRES.map(g => [g.id, g.name])
)

const COUNTRIES = [
  { code: 'tr', label: 'Türkiye' },
  { code: 'en', label: 'Amerika / İngiltere' },
  { code: 'ko', label: 'Güney Kore' },
  { code: 'ja', label: 'Japonya' },
  { code: 'fr', label: 'Fransa' },
  { code: 'it', label: 'İtalya' },
  { code: 'de', label: 'Almanya' },
  { code: 'es', label: 'İspanya' },
  { code: 'pt', label: 'Portekiz / Brezilya' },
  { code: 'zh', label: 'Çin' },
  { code: 'hi', label: 'Hindistan' },
  { code: 'ru', label: 'Rusya' },
  { code: 'ar', label: 'Arap Ülkeleri' },
  { code: 'sv', label: 'İsveç' },
  { code: 'da', label: 'Danimarka' },
  { code: 'nl', label: 'Hollanda' },
  { code: 'pl', label: 'Polonya' },
  { code: 'no', label: 'Norveç' },
]

const PAGE_SIZE = 40
const currentYear = new Date().getFullYear()
const YEAR_LIST = Array.from({ length: currentYear - 1939 }, (_, i) => currentYear - i)

interface Props {
  searchParams: Promise<{
    sayfa?: string; genre?: string; yil?: string; puan?: string
    sirala?: string; q?: string; dil?: string; goruntum?: string; platform?: string; ozel?: string
  }>
}

export default async function FilmlerPage({ searchParams }: Props) {
  const { sayfa, genre, yil, puan, sirala, q, dil, goruntum, platform, ozel } = await searchParams
  const ozelKat = ozel ? OZEL_KATEGORILER.find(k => k.slug === ozel) : undefined
  const viewMode = goruntum === 'grid' ? 'grid' : 'liste'
  // Grid view uses infinite scroll starting from page 1; list view uses URL-based pagination
  const page = viewMode === 'liste' ? Math.max(1, Number(sayfa) || 1) : 1

  const supabase = await createClient()

  // Providers ve catalog count paralel çek
  const [movieProviders, { count: catalogCount }] = await Promise.all([
    getMovieProviderList('TR').catch(() => []),
    supabase.from('movies').select('*', { count: 'exact', head: true }).limit(1),
  ])

  let results: any[] = []
  let total_pages = 1
  let totalCount = 0

  if (ozelKat?.slug === 'oscar-kazananlar') {
    // Sabit Oscar BP listesi — TMDb keyword yerine hardcoded IDs
    const pageSize = PAGE_SIZE
    const allIds = OSCAR_WINNER_IDS
    total_pages = Math.ceil(allIds.length / pageSize)
    const pageIds = allIds.slice((page - 1) * pageSize, page * pageSize)
    results = await getMoviesByIds(pageIds)
  } else if (platform || ozelKat) {
    // Platform veya özel kategori seçiliyse TMDb Discover kullan
    const data = await discoverMovies({
      page,
      genre: ozelKat?.genre || genre,
      year: yil, sortBy: sirala,
      minRating: ozelKat?.minRating || puan,
      provider: platform,
      keywords: ozelKat?.keywords || undefined,
      maxYear: ozelKat?.maxYear,
      language: ozelKat?.language,
      excludeLanguage: ozelKat?.excludeLanguage,
      maxRuntime: ozelKat?.maxRuntime,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  } else if ((catalogCount ?? 0) > 5000) {
    // Supabase katalogu
    let query = supabase.from('movies').select('*', { count: 'exact' })

    if (q?.trim()) {
      query = query.or(`title.ilike.%${q.trim()}%,original_title.ilike.%${q.trim()}%`)
    }
    if (genre) {
      const genreId = parseInt(genre)
      if (!isNaN(genreId)) query = query.contains('genre_ids', [genreId])
    }
    if (yil)  query = query.eq('release_year', parseInt(yil))
    if (puan) query = query.gte('vote_average', parseFloat(puan))
    if (dil)  query = query.eq('original_language', dil)

    let orderCol = 'popularity'
    let ascending = false
    if (sirala === 'vote_average.desc')       { orderCol = 'vote_average';  ascending = false }
    else if (sirala === 'vote_average.asc')   { orderCol = 'vote_average';  ascending = true  }
    else if (sirala === 'release_date.desc')  { orderCol = 'release_year';  ascending = false }
    else if (sirala === 'release_date.asc')   { orderCol = 'release_year';  ascending = true  }

    const from = (page - 1) * PAGE_SIZE
    const { data, count, error } = await query
      .order(orderCol, { ascending })
      .order('vote_count', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!error && data) {
      results = data.map((m: any) => ({
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
      totalCount  = count ?? 0
      total_pages = Math.min(500, Math.ceil(totalCount / PAGE_SIZE))
    }
  } else {
    const data = await discoverMovies({
      page, genre, year: yil, minRating: puan, sortBy: sirala,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  }

  // Sinefil puanlarını toplu çek
  let sinemaPuanMap: Record<number, { avg: number; count: number }> = {}
  if (results.length > 0) {
    const mediaIds = results.map((m: any) => m.id)
    const { data: ratingRows } = await supabase
      .from('reviews')
      .select('media_id, rating')
      .in('media_id', mediaIds)
      .eq('media_type', 'film')
      .gt('rating', 0)

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

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged: Record<string, string | undefined> = {
      genre, yil, puan, sirala, dil, goruntum: viewMode, platform, ozel, ...overrides,
    }
    if (merged.genre)    params.set('genre',    merged.genre)
    if (merged.yil)      params.set('yil',      merged.yil)
    if (merged.puan)     params.set('puan',     merged.puan)
    if (merged.sirala)   params.set('sirala',   merged.sirala)
    if (merged.dil)      params.set('dil',      merged.dil)
    if (merged.platform) params.set('platform', merged.platform)
    if (merged.ozel)     params.set('ozel',     merged.ozel)
    if (merged.goruntum && merged.goruntum !== 'liste') params.set('goruntum', merged.goruntum)
    return `/filmler${params.toString() ? `?${params}` : ''}`
  }

  const paginationParams = new URLSearchParams()
  if (genre)    paginationParams.set('genre',    genre)
  if (yil)      paginationParams.set('yil',      yil)
  if (puan)     paginationParams.set('puan',     puan)
  if (sirala)   paginationParams.set('sirala',   sirala)
  if (dil)      paginationParams.set('dil',      dil)
  if (platform) paginationParams.set('platform', platform)
  if (goruntum) paginationParams.set('goruntum', goruntum)
  if (q)        paginationParams.set('q',        q)
  const paginationBase = `/filmler${paginationParams.toString() ? `?${paginationParams}` : ''}`

  const yearActive = sirala?.startsWith('release_date')
  const imdbActive = sirala?.startsWith('vote_average')
  const popActive  = !sirala || sirala === 'popularity.desc'

  const currentParams = { genre, yil, puan, sirala, dil, goruntum: viewMode, platform }

  // Params for InfiniteGrid API calls
  const gridParams: Record<string, string> = {}
  if (genre)    gridParams.genre    = genre
  if (yil)      gridParams.yil      = yil
  if (puan)     gridParams.puan     = puan
  if (sirala)   gridParams.sirala   = sirala
  if (dil)      gridParams.dil      = dil
  if (platform) gridParams.platform = platform
  if (q)        gridParams.q        = q

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <IconFilm className="h-7 w-7 text-[--accent]" />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Filmler</h1>
        {totalCount > 0 && (
          <span className="text-sm text-[--text-secondary] font-medium">
            • {totalCount.toLocaleString('tr-TR')} sonuç bulundu
          </span>
        )}
        <div className="ml-auto">
          <MobileFilterDrawer
            genres={FILM_GENRES.map(g => ({ href: buildUrl({ genre: genre === String(g.id) ? undefined : String(g.id) }), label: g.name, active: genre === String(g.id) }))}
            countries={COUNTRIES.map(c => ({ href: buildUrl({ dil: dil === c.code ? undefined : c.code }), label: c.label, active: dil === c.code }))}
            years={YEAR_LIST.slice(0, 50).map(y => ({ href: buildUrl({ yil: yil === String(y) ? undefined : String(y) }), label: String(y), active: yil === String(y) }))}
            activeLabel={genre ? FILM_GENRES.find(g => String(g.id) === genre)?.name : dil ? COUNTRIES.find(c => c.code === dil)?.label : undefined}
          />
        </div>
      </div>

      <div className="flex gap-8">

        <FilterPanel
          genres={FILM_GENRES.map(g => ({
            href: buildUrl({ genre: genre === String(g.id) ? undefined : String(g.id) }),
            label: g.name,
            active: genre === String(g.id),
            count: g.count,
          }))}
          countries={COUNTRIES.map(c => ({
            href: buildUrl({ dil: dil === c.code ? undefined : c.code }),
            label: c.label,
            active: dil === c.code,
          }))}
          years={YEAR_LIST.slice(0, 40).map(y => ({
            href: buildUrl({ yil: yil === String(y) ? undefined : String(y) }),
            label: String(y),
            active: yil === String(y),
          }))}
          specialCategories={OZEL_KATEGORILER
            .filter(k => !k.mediaType || k.mediaType === 'film')
            .map(k => ({
              href: buildUrl({ ozel: ozel === k.slug ? undefined : k.slug }),
              label: k.label,
              active: ozel === k.slug,
            }))}
        />

        {/* Ana içerik */}
        <main className="flex-1 min-w-0">

          {/* Platform filtresi */}
          <PlatformFilter
            providers={movieProviders}
            basePath="/filmler"
            currentPlatform={platform}
            currentParams={currentParams}
          />

          {/* Arama */}
          <form method="get" className="mb-4">
            {genre    && <input type="hidden" name="genre"    value={genre} />}
            {yil      && <input type="hidden" name="yil"      value={yil} />}
            {puan     && <input type="hidden" name="puan"     value={puan} />}
            {sirala   && <input type="hidden" name="sirala"   value={sirala} />}
            {dil      && <input type="hidden" name="dil"      value={dil} />}
            {platform && <input type="hidden" name="platform" value={platform} />}
            {viewMode !== 'liste' && <input type="hidden" name="goruntum" value={viewMode} />}
            <input
              type="search" name="q" defaultValue={q ?? ''}
              placeholder="Film veya orijinal isim ara..."
              className="w-full max-w-sm rounded-xl bg-[--bg-card] border border-[--border] px-4 py-2 text-sm text-white placeholder:text-[--text-secondary] outline-none focus:border-[--accent]"
            />
          </form>

          {/* Sıralama + görünüm toggle */}
          <div className="flex items-center justify-between gap-2 mb-5 py-2.5 border-b border-[--border]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={buildUrl({ sirala: sirala === 'release_date.asc' ? 'release_date.desc' : 'release_date.asc' })}
                className={`flex items-center gap-0.5 px-3 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                  yearActive ? 'bg-[--accent] border-[--accent] text-white'
                    : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/40 bg-[--bg-card]'
                }`}>
                YIL
                {sirala === 'release_date.asc' ? <IconChevronUp className="h-3 w-3 ml-0.5" /> : <IconChevronDown className="h-3 w-3 ml-0.5" />}
              </Link>

              <Link href={buildUrl({ sirala: sirala === 'vote_average.desc' ? 'vote_average.asc' : 'vote_average.desc' })}
                className={`flex items-center gap-0.5 px-3 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                  imdbActive ? 'bg-[--accent] border-[--accent] text-white'
                    : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/40 bg-[--bg-card]'
                }`}>
                İMDB P.
                {sirala === 'vote_average.asc' ? <IconChevronUp className="h-3 w-3 ml-0.5" /> : <IconChevronDown className="h-3 w-3 ml-0.5" />}
              </Link>

              <Link href={buildUrl({ sirala: undefined })}
                className={`px-3 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                  popActive ? 'bg-[--accent] border-[--accent] text-white'
                    : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/40 bg-[--bg-card]'
                }`}>
                POPÜLERLİK
              </Link>

              {[7, 8, 9].map(r => (
                <Link key={r}
                  href={buildUrl({ puan: puan === String(r) ? undefined : String(r) })}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                    puan === String(r)
                      ? 'bg-[--gold]/20 border-[--gold] text-[--gold]'
                      : 'border-[--border] text-[--text-secondary] hover:text-[--gold] hover:border-[--gold]/40 bg-[--bg-card]'
                  }`}>
                  {r}+ Puan
                </Link>
              ))}
            </div>

            <div className="flex items-center border border-[--border] rounded-lg overflow-hidden shrink-0">
              <Link href={buildUrl({ goruntum: 'liste' })}
                className={`p-2 transition-colors ${viewMode === 'liste' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white bg-[--bg-card]'}`}
                title="Liste görünümü">
                <IconList className="h-4 w-4" />
              </Link>
              <Link href={buildUrl({ goruntum: 'grid' })}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white bg-[--bg-card]'}`}
                title="Grid görünümü">
                <IconGrid className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-20 text-[--text-secondary]">
              Bu filtrelerle eşleşen film bulunamadı.
            </div>
          ) : viewMode === 'liste' ? (
            <>
              <div>
                {results.map((movie: any) => (
                  <MovieListItem
                    key={movie.id}
                    media={movie}
                    type="film"
                    genreIdToName={GENRE_ID_TO_NAME}
                    sinemaPuan={sinemaPuanMap[movie.id]?.avg ?? null}
                    sinemaVoteCount={sinemaPuanMap[movie.id]?.count ?? 0}
                  />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={total_pages} baseUrl={paginationBase} />
            </>
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

