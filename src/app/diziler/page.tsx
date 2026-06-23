import Link from 'next/link'
import { IconTv, IconList, IconGrid, IconChevronDown, IconChevronUp } from '@/components/icons'
import MovieCard from '@/components/MovieCard'
import MovieListItem from '@/components/MovieListItem'
import PlatformFilter from '@/components/PlatformFilter'
import Pagination from '@/components/Pagination'
import MobileFilterDrawer from '@/components/MobileFilterDrawer'
import InfiniteGrid from '@/components/InfiniteGrid'
import FilterPanel from '@/components/FilterPanel'
import { OZEL_KATEGORILER } from '@/lib/ozel-kategoriler'
import { createClient } from '@/lib/supabase/server'
import { discoverSeries, getTVProviderList } from '@/lib/tmdb'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diziler',
  description: 'Türkçe dizi arşivi — türe, yıla ve platforma göre filtrele, puan ver ve yorum yaz.',
  alternates: { canonical: '/diziler' },
  openGraph: {
    title: 'Diziler | Sinezon',
    description: 'Türkçe dizi arşivi — türe, yıla ve platforma göre filtrele, puan ver ve yorum yaz.',
    url: '/diziler',
    type: 'website',
  },
}

const DIZI_GENRES = [
  { id: 10759, name: 'Aksiyon & Macera',    count: '8.5K'  },
  { id: 16,    name: 'Animasyon',            count: '4.2K'  },
  { id: 35,    name: 'Komedi',               count: '16.8K' },
  { id: 80,    name: 'Suç',                  count: '6.3K'  },
  { id: 99,    name: 'Belgesel',             count: '12.4K' },
  { id: 18,    name: 'Drama',                count: '28.9K' },
  { id: 10751, name: 'Aile',                 count: '5.1K'  },
  { id: 10762, name: 'Çocuk',               count: '3.6K'  },
  { id: 9648,  name: 'Gizem',               count: '4.8K'  },
  { id: 10764, name: 'Reality',              count: '7.2K'  },
  { id: 10765, name: 'Bilim Kurgu & Fantezi', count: '6.7K' },
  { id: 10768, name: 'Savaş & Politika',    count: '2.1K'  },
  { id: 37,    name: 'Western',              count: '1.8K'  },
]

const GENRE_ID_TO_NAME: Record<number, string> = Object.fromEntries(
  DIZI_GENRES.map(g => [g.id, g.name])
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
  { code: 'zh', label: 'Çin' },
  { code: 'hi', label: 'Hindistan' },
  { code: 'ru', label: 'Rusya' },
  { code: 'ar', label: 'Arap Ülkeleri' },
  { code: 'sv', label: 'İsveç' },
  { code: 'da', label: 'Danimarka' },
  { code: 'nl', label: 'Hollanda' },
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

export default async function DizilerPage({ searchParams }: Props) {
  const { sayfa, genre, yil, puan, sirala, q, dil, goruntum, platform, ozel } = await searchParams
  const ozelKat = ozel ? OZEL_KATEGORILER.find(k => k.slug === ozel) : undefined
  const viewMode = goruntum === 'grid' ? 'grid' : 'liste'
  const page = viewMode === 'liste' ? Math.max(1, Number(sayfa) || 1) : 1

  const supabase = await createClient()

  const [tvProviders, { count: catalogCount }] = await Promise.all([
    getTVProviderList('TR').catch(() => []),
    supabase.from('series').select('*', { count: 'exact', head: true }).limit(1),
  ])

  let results: any[] = []
  let total_pages = 1
  let totalCount = 0

  if (platform || ozelKat) {
    // Platform veya özel kategori seçiliyse TMDb Discover kullan
    const data = await discoverSeries({
      page,
      genre: ozelKat?.genre || genre,
      year: yil, sortBy: sirala,
      minRating: ozelKat?.minRating || puan,
      provider: platform,
      keywords: ozelKat?.keywords || undefined,
      maxYear: ozelKat?.maxYear,
      language: ozelKat?.language,
      excludeLanguage: ozelKat?.excludeLanguage,
      seriesType: ozelKat?.seriesType,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  } else if ((catalogCount ?? 0) > 1000) {
    let query = supabase.from('series').select('*', { count: 'exact' })

    if (q?.trim()) {
      query = query.or(`name.ilike.%${q.trim()}%,original_name.ilike.%${q.trim()}%`)
    }
    if (genre) {
      const genreId = parseInt(genre)
      if (!isNaN(genreId)) query = query.contains('genre_ids', [genreId])
    }
    if (yil)  query = query.eq('first_air_year', parseInt(yil))
    if (puan) query = query.gte('vote_average', parseFloat(puan))
    if (dil)  query = query.eq('original_language', dil)

    let orderCol = 'popularity'
    let ascending = false
    if (sirala === 'vote_average.desc')       { orderCol = 'vote_average';    ascending = false }
    else if (sirala === 'vote_average.asc')   { orderCol = 'vote_average';    ascending = true  }
    else if (sirala === 'release_date.desc')  { orderCol = 'first_air_year';  ascending = false }
    else if (sirala === 'release_date.asc')   { orderCol = 'first_air_year';  ascending = true  }

    const from = (page - 1) * PAGE_SIZE
    const { data, count, error } = await query
      .order(orderCol, { ascending })
      .order('vote_count', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!error && data) {
      results = data.map((s: any) => ({
        id:             s.tmdb_id,
        name:           s.name,
        original_name:  s.original_name,
        overview:       s.overview,
        poster_path:    s.poster_path,
        first_air_date: s.first_air_date,
        vote_average:   s.vote_average,
        vote_count:     s.vote_count,
        popularity:     s.popularity,
        genre_ids:      s.genre_ids,
      }))
      totalCount  = count ?? 0
      total_pages = Math.min(500, Math.ceil(totalCount / PAGE_SIZE))
    }
  } else {
    const data = await discoverSeries({
      page, genre, year: yil, minRating: puan, sortBy: sirala,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  }

  // Sinefil puanlarını toplu çek
  let sinemaPuanMap: Record<number, { avg: number; count: number }> = {}
  if (results.length > 0) {
    const mediaIds = results.map((s: any) => s.id)
    const { data: ratingRows } = await supabase
      .from('reviews')
      .select('media_id, rating')
      .in('media_id', mediaIds)
      .eq('media_type', 'dizi')
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
    return `/diziler${params.toString() ? `?${params}` : ''}`
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
  const paginationBase = `/diziler${paginationParams.toString() ? `?${paginationParams}` : ''}`

  const yearActive = sirala?.startsWith('release_date')
  const imdbActive = sirala?.startsWith('vote_average')
  const popActive  = !sirala || sirala === 'popularity.desc'

  const currentParams = { genre, yil, puan, sirala, dil, goruntum: viewMode, platform }

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

      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <IconTv className="h-7 w-7 text-[--accent]" />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Diziler</h1>
        {totalCount > 0 && (
          <span className="text-sm text-[--text-secondary] font-medium">
            • {totalCount.toLocaleString('tr-TR')} sonuç bulundu
          </span>
        )}
        <div className="ml-auto">
          <MobileFilterDrawer
            genres={DIZI_GENRES.map(g => ({ href: buildUrl({ genre: genre === String(g.id) ? undefined : String(g.id) }), label: g.name, active: genre === String(g.id) }))}
            countries={COUNTRIES.map(c => ({ href: buildUrl({ dil: dil === c.code ? undefined : c.code }), label: c.label, active: dil === c.code }))}
            years={YEAR_LIST.slice(0, 50).map(y => ({ href: buildUrl({ yil: yil === String(y) ? undefined : String(y) }), label: String(y), active: yil === String(y) }))}
            activeLabel={genre ? DIZI_GENRES.find(g => String(g.id) === genre)?.name : dil ? COUNTRIES.find(c => c.code === dil)?.label : undefined}
          />
        </div>
      </div>

      <div className="flex gap-8">

        <FilterPanel
          genres={DIZI_GENRES.map(g => ({
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
            .filter(k => !k.mediaType || k.mediaType === 'dizi')
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
            providers={tvProviders}
            basePath="/diziler"
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
              placeholder="Dizi veya orijinal isim ara..."
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
              Bu filtrelerle eşleşen dizi bulunamadı.
            </div>
          ) : viewMode === 'liste' ? (
            <>
              <div>
                {results.map((s: any) => (
                  <MovieListItem
                    key={s.id}
                    media={s}
                    type="dizi"
                    genreIdToName={GENRE_ID_TO_NAME}
                    sinemaPuan={sinemaPuanMap[s.id]?.avg ?? null}
                    sinemaVoteCount={sinemaPuanMap[s.id]?.count ?? 0}
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
              apiPath="/api/diziler"
              searchParams={gridParams}
              type="dizi"
            />
          )}
        </main>
      </div>
    </div>
  )
}
