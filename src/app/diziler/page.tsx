import InfiniteGrid from '@/components/InfiniteGrid'
import Pagination from '@/components/Pagination'
import DizilerSidebar from '@/components/DizilerSidebar'
import { DIZI_GENRES } from '@/lib/dizi-genres'
import { OZEL_KATEGORILER } from '@/lib/ozel-kategoriler'
import { createClient } from '@/lib/supabase/server'
import { discoverSeries, getTVProviderList } from '@/lib/tmdb'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diziler',
  description: 'Türkçe dizi arşivi — türe, yıla ve platforma göre filtrele, puan ver ve yorum yaz.',
  alternates: { canonical: '/diziler' },
}

const GENRE_ID_TO_NAME: Record<number, string> = Object.fromEntries(
  DIZI_GENRES.map(g => [g.id, g.name])
)

const PAGE_SIZE = 40

interface Props {
  searchParams: Promise<{
    sayfa?: string; genre?: string; sirala?: string; platform?: string; ozel?: string
    tarihten?: string; tarihe?: string; puan?: string; min_oy?: string
    dil?: string; goruntum?: string; q?: string; ulke?: string
    // legacy
    yil?: string
  }>
}

export default async function DizilerPage({ searchParams }: Props) {
  const {
    sayfa, genre, sirala, platform, ozel,
    tarihten, tarihe, puan, min_oy, dil,
    goruntum = 'grid', q, yil, ulke,
  } = await searchParams

  const ozelKat  = ozel ? OZEL_KATEGORILER.find(k => k.slug === ozel) : undefined
  const viewMode = goruntum === 'liste' ? 'liste' : 'grid'
  const page     = Math.max(1, Number(sayfa) || 1)

  const supabase = await createClient()

  const [tvProviders, { count: catalogCount }] = await Promise.all([
    getTVProviderList('TR').catch(() => []),
    supabase.from('series').select('*', { count: 'exact', head: true }).limit(1),
  ])

  let results: any[] = []
  let total_pages = 1
  let totalCount = 0

  const hasCustomFilters = !!(genre || tarihten || tarihe || puan || min_oy || platform || sirala || dil)

  if (ozelKat) {
    const data = await discoverSeries({
      page,
      genre: ozelKat.genre || genre,
      year: yil,
      sortBy: sirala,
      minRating: ozelKat.minRating || puan,
      provider: platform,
      keywords: ozelKat.keywords,
      maxYear: ozelKat.maxYear,
      language: ozelKat.language,
      excludeLanguage: ozelKat.excludeLanguage,
      seriesType: ozelKat.seriesType,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  } else if (hasCustomFilters || (catalogCount ?? 0) <= 1000) {
    const data = await discoverSeries({
      page, genre,
      year: yil,
      minYear: tarihten,
      maxYear: tarihe,
      minRating: puan,
      minVoteCount: min_oy,
      sortBy: sirala,
      provider: platform,
      watchRegion: ulke || 'TR',
      language: dil,
    }).catch(() => ({ results: [], total_pages: 1 }))
    results     = data.results
    total_pages = data.total_pages
  } else {
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
    if (sirala === 'vote_average.desc')      { orderCol = 'vote_average';   ascending = false }
    else if (sirala === 'vote_average.asc')  { orderCol = 'vote_average';   ascending = true  }
    else if (sirala === 'first_air_date.desc') { orderCol = 'first_air_year'; ascending = false }
    else if (sirala === 'first_air_date.asc')  { orderCol = 'first_air_year'; ascending = true  }

    const from = (page - 1) * PAGE_SIZE
    const { data, count, error } = await query
      .order(orderCol, { ascending })
      .order('vote_count', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!error && data) {
      results = data.map((s: any) => ({
        id: s.tmdb_id, name: s.name, original_name: s.original_name,
        overview: s.overview, poster_path: s.poster_path,
        first_air_date: s.first_air_date, vote_average: s.vote_average,
        vote_count: s.vote_count, popularity: s.popularity, genre_ids: s.genre_ids,
      }))
      totalCount  = count ?? 0
      total_pages = Math.min(500, Math.ceil(totalCount / PAGE_SIZE))
    }
  }

  // Sinezon puanları
  let sinemaPuanMap: Record<number, { avg: number; count: number }> = {}
  if (results.length > 0) {
    const mediaIds = results.map((s: any) => s.id)
    const { data: ratingRows } = await supabase
      .from('reviews').select('media_id, rating')
      .in('media_id', mediaIds).eq('media_type', 'dizi').gt('rating', 0)
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

  const gridParams: Record<string, string> = {}
  if (genre)    gridParams.genre    = genre
  if (sirala)   gridParams.sirala   = sirala
  if (platform) gridParams.platform = platform
  if (tarihten) gridParams.tarihten = tarihten
  if (tarihe)   gridParams.tarihe   = tarihe
  if (puan)     gridParams.puan     = puan
  if (min_oy)   gridParams.min_oy   = min_oy
  if (dil)      gridParams.dil      = dil
  if (q)        gridParams.q        = q
  if (ulke && ulke !== 'TR') gridParams.ulke = ulke

  const activeGenreName = genre
    ? (genre.includes(',') ? 'Seçili Türler' : DIZI_GENRES.find(g => String(g.id) === genre)?.name ?? null)
    : null
  const pageTitle = ozelKat?.label ?? (activeGenreName ? `${activeGenreName} Dizileri` : 'Popüler Diziler')

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6 items-start">

        {/* ── Sidebar ── */}
        <DizilerSidebar
          providers={tvProviders}
          initialGenre={genre}
          initialPlatform={platform}
          initialSirala={sirala}
          initialTarihten={tarihten}
          initialTarihe={tarihe}
          initialMinPuan={puan}
          initialMinOy={min_oy}
          initialDil={dil}
          initialGoruntum={goruntum}
          initialUlke={ulke}
        />

        {/* ── Ana içerik ── */}
        <main className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white mb-5">
            {pageTitle}
            {totalCount > 0 && (
              <span className="ml-3 text-sm font-normal text-[--text-secondary]">
                {totalCount.toLocaleString('tr-TR')} sonuç
              </span>
            )}
          </h1>

          {results.length === 0 ? (
            <div className="text-center py-24 text-[--text-secondary]">
              <p className="text-4xl mb-4">📺</p>
              <p>Bu filtrelerle eşleşen dizi bulunamadı.</p>
            </div>
          ) : viewMode === 'liste' ? (
            <>
              <div className="space-y-2">
                {results.map((s: any) => (
                  <div key={s.id} className="flex gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <a href={`/dizi/${s.id}`}>
                      <img
                        src={s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : '/placeholder.png'}
                        alt={s.name}
                        className="w-12 h-16 rounded-lg object-cover shrink-0"
                      />
                    </a>
                    <div className="min-w-0">
                      <a href={`/dizi/${s.id}`} className="font-semibold text-white hover:text-[--accent] transition-colors line-clamp-1">
                        {s.name}
                      </a>
                      <p className="text-[12px] text-[--text-secondary] mt-0.5">
                        {s.first_air_date?.slice(0, 4)}
                        {s.genre_ids?.slice(0, 2).map((id: number) => GENRE_ID_TO_NAME[id]).filter(Boolean).map((n: string) => (
                          <span key={n} className="ml-2">· {n}</span>
                        ))}
                      </p>
                      {s.vote_average > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[12px] font-bold text-[--gold]">
                          ★ {s.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination currentPage={page} totalPages={total_pages} baseUrl={`/diziler?${new URLSearchParams(gridParams)}`} />
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
