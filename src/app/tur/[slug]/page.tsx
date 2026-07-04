import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import {
  IconStar, IconZap, IconMap, IconPalette, IconLaugh, IconFingerprint, IconCamera,
  IconMasks, IconFamily, IconWand, IconScroll, IconGhost, IconMusic, IconSearch,
  IconHeartFilled, IconRocket, IconTv, IconAlertTriangle, IconSwords, IconHat, IconFilm,
} from '@/components/icons'
import { discoverMovies, discoverSeries, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { GENRE_MAP } from '@/lib/genres'
import MovieCard from '@/components/MovieCard'
import Pagination from '@/components/Pagination'
import TurSidebar from '@/components/TurSidebar'
import { getTranslations } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    tab?: string; sayfa?: string
    sirala?: string; yil?: string; min_puan?: string
  }>
}

const GENRE_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  aksiyon: IconZap, macera: IconMap, animasyon: IconPalette, komedi: IconLaugh,
  suc: IconFingerprint, belgesel: IconCamera, drama: IconMasks, aile: IconFamily,
  fantezi: IconWand, tarih: IconScroll, korku: IconGhost, muzik: IconMusic,
  gizem: IconSearch, romantik: IconHeartFilled, 'bilim-kurgu': IconRocket, 'tv-film': IconTv,
  gerilim: IconAlertTriangle, savas: IconSwords, western: IconHat,
}

const GENRE_DESC: Record<string, string> = {
  aksiyon: 'Nefes kesen sahneler ve yüksek tempolu hikayeler',
  korku: 'Karanlık atmosfer, gerilim ve korkutucu anlar',
  komedi: 'Güldürü ustası filmler ve diziler',
  drama: 'Derin duygular ve güçlü karakterler',
  'bilim-kurgu': 'Geleceğin dünyaları ve teknoloji',
  fantezi: 'Büyülü dünyalar ve efsanevi hikayeler',
  romantik: 'Aşk hikayeleri ve duygusal bağlar',
  gerilim: 'Sizi koltuğunuza çivilecek gerilim',
  animasyon: 'Her yaşa hitap eden animasyon yapımlar',
  belgesel: 'Gerçek hikayelerin büyüsü',
  suc: 'Suç, adalet ve karanlık dünyalar',
  macera: 'Keşif, risk ve heyecan dolu yolculuklar',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const genre = GENRE_MAP[slug]
  if (!genre) return { title: 'Tür Bulunamadı' }
  const desc = GENRE_DESC[slug]
    ? `${GENRE_DESC[slug]} — Sinezon'da en iyi ${genre.name.toLowerCase()} filmleri ve dizileri.`
    : `En iyi ${genre.name.toLowerCase()} filmleri ve dizileri Sinezon'da.`
  return {
    title: `${genre.name} Filmleri ve Dizileri`,
    description: desc,
    alternates: { canonical: `/tur/${slug}` },
    openGraph: { title: `${genre.name} Filmleri ve Dizileri | Sinezon`, description: desc },
  }
}

export default async function TurPage({ params, searchParams }: Props) {
  const { t } = await getTranslations()
  const { slug } = await params
  const { tab, sayfa, sirala = 'popularity.desc', yil, min_puan } = await searchParams

  const genre = GENRE_MAP[slug]
  if (!genre) notFound()

  const page = Math.max(1, Number(sayfa) || 1)
  const hasMovies = genre.movieGenreId !== null
  const hasSeries = genre.tvGenreId !== null
  const activeTab = tab === 'dizi' && hasSeries ? 'dizi'
    : tab === 'film' && hasMovies ? 'film'
    : hasMovies ? 'film' : 'dizi'

  const discoverParams = {
    sortBy: sirala,
    page,
    minRating: min_puan,
    ...(yil ? { year: yil } : {}),
  }

  const [mainData, topPicksData] = await Promise.all([
    activeTab === 'film'
      ? discoverMovies({ genre: String(genre.movieGenreId), ...discoverParams }).catch(() => ({ results: [], total_pages: 1 }))
      : discoverSeries({ genre: String(genre.tvGenreId), ...discoverParams }).catch(() => ({ results: [], total_pages: 1 })),
    page === 1 && sirala === 'popularity.desc'
      ? (activeTab === 'film'
          ? discoverMovies({ genre: String(genre.movieGenreId), sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] }))
          : discoverSeries({ genre: String(genre.tvGenreId), sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })))
      : Promise.resolve(null),
  ])

  const results    = mainData.results
  const totalPages = mainData.total_pages
  const topPicks   = topPicksData?.results.slice(0, 6) ?? []

  const GenreIcon = GENRE_ICONS[slug] ?? IconFilm
  const desc  = GENRE_DESC[slug]

  const paginationBase = `/tur/${slug}?tab=${activeTab}&sirala=${sirala}${yil ? `&yil=${yil}` : ''}${min_puan ? `&min_puan=${min_puan}` : ''}`

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BreadcrumbJsonLd items={[
        { name: 'Ana Sayfa', path: '/' },
        { name: `${genre.name} Filmleri ve Dizileri`, path: `/tur/${slug}` },
      ]} />

      {/* Breadcrumb */}
      <div className="flex gap-2 text-xs text-[--text-secondary] mb-6">
        <Link href="/" className="hover:text-white transition-colors">{t('genre.breadcrumbHome')}</Link>
        <span>/</span>
        <Link href="/tur" className="hover:text-white transition-colors">{t('genre.breadcrumbGenres')}</Link>
        <span>/</span>
        <span className="text-white">{genre.name}</span>
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Sidebar ── */}
        <TurSidebar
          slug={slug}
          hasMovies={hasMovies}
          hasSeries={hasSeries}
          initialTab={activeTab}
          initialSirala={sirala}
          initialYil={yil}
          initialMinPuan={min_puan}
        />

        {/* ── Ana içerik ── */}
        <main className="flex-1 min-w-0">

          {/* Başlık */}
          <div className="flex items-center gap-3 mb-6">
            <GenreIcon size={32} className="text-[--accent]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{genre.name}</h1>
              {desc && <p className="text-[--text-secondary] text-sm mt-0.5">{desc}</p>}
            </div>
          </div>

          {/* Top Picks */}
          {topPicks.length > 0 && (
            <section className="mb-8">
              <h2 className="flex items-center gap-2 text-base font-bold text-white mb-4">
                <IconStar className="h-4 w-4 text-[--gold]" />
                {t('genre.topPicksTitle', { genre: genre.name })}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {topPicks.map(item => (
                  <Link key={item.id} href={`/${activeTab}/${item.id}`} className="group">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {getPosterUrl(item.poster_path, 'w342') ? (
                        <img src={getPosterUrl(item.poster_path, 'w342')!} alt={getMediaTitle(item)}
                             className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-xs text-[--text-secondary] text-center">
                          {getMediaTitle(item)}
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex items-center gap-1">
                          <IconStar className="h-3 w-3 text-[--gold]" />
                          <span className="text-xs text-[--gold] font-semibold">{item.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-[--text-secondary] line-clamp-1 group-hover:text-white transition-colors">
                      {getMediaTitle(item)}
                    </p>
                    <p className="text-[10px] text-[--text-secondary]/60">{getMediaYear(item)}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Sonuçlar */}
          {results.length === 0 ? (
            <div className="text-center py-20 text-[--text-secondary]">{t('common.noResults')}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(item => (
                <MovieCard key={item.id} media={item} type={activeTab === 'film' ? 'film' : 'dizi'} />
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} baseUrl={paginationBase} />
        </main>
      </div>
    </div>
  )
}
