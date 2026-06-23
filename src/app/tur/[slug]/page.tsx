import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IconFilm, IconTv, IconStar } from '@/components/icons'
import { discoverMovies, discoverSeries, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { GENRE_MAP } from '@/lib/genres'
import MovieCard from '@/components/MovieCard'
import Pagination from '@/components/Pagination'
import CustomSelect from '@/components/CustomSelect'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string; sayfa?: string; sirala?: string; yil?: string }>
}

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'En Popüler' },
  { value: 'vote_average.desc', label: 'En Yüksek Puan' },
  { value: 'release_date.desc', label: 'En Yeni' },
  { value: 'release_date.asc', label: 'En Eski' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i)

const GENRE_EMOJIS: Record<string, string> = {
  aksiyon: '💥', macera: '🗺️', animasyon: '🎨', komedi: '😂',
  suc: '🔫', belgesel: '📷', drama: '🎭', aile: '👨‍👩‍👧',
  fantezi: '🧙', tarih: '📜', korku: '👻', muzik: '🎵',
  gizem: '🔍', romantik: '❤️', 'bilim-kurgu': '🚀', 'tv-film': '📺',
  gerilim: '😱', savas: '⚔️', western: '🤠',
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
    openGraph: {
      title: `${genre.name} Filmleri ve Dizileri | Sinezon`,
      description: desc,
      url: `/tur/${slug}`,
      type: 'website',
    },
  }
}

export default async function TurPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tab, sayfa, sirala = 'popularity.desc', yil } = await searchParams

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
    ...(yil ? (activeTab === 'film' ? { year: yil } : { year: yil }) : {}),
  }

  const [mainData, topPicksData] = await Promise.all([
    activeTab === 'film'
      ? discoverMovies({ genre: String(genre.movieGenreId), ...discoverParams }).catch(() => ({ results: [], total_pages: 1 }))
      : discoverSeries({ genre: String(genre.tvGenreId), ...discoverParams }).catch(() => ({ results: [], total_pages: 1 })),
    // Top picks sadece ilk sayfada ve sıralama popularity ise
    page === 1 && sirala === 'popularity.desc'
      ? (activeTab === 'film'
          ? discoverMovies({ genre: String(genre.movieGenreId), sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] }))
          : discoverSeries({ genre: String(genre.tvGenreId), sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })))
      : Promise.resolve(null),
  ])

  const results = mainData.results
  const totalPages = mainData.total_pages
  const topPicks = topPicksData?.results.slice(0, 6) ?? []

  const emoji = GENRE_EMOJIS[slug] ?? '🎬'
  const desc = GENRE_DESC[slug]
  const tabBase = (t: string) => `/tur/${slug}?tab=${t}&sirala=${sirala}${yil ? `&yil=${yil}` : ''}`
  const filterBase = `/tur/${slug}?tab=${activeTab}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{emoji}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{genre.name}</h1>
        </div>
        {desc && <p className="text-[--text-secondary] text-sm">{desc}</p>}
        <div className="flex gap-2 mt-3 text-xs text-[--text-secondary]">
          <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/tur" className="hover:text-white transition-colors">Türler</Link>
          <span>/</span>
          <span className="text-white">{genre.name}</span>
        </div>
      </div>

      {/* Top Picks */}
      {topPicks.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <IconStar className="h-4 w-4 text-[--gold]" />
            {genre.name} Türünün En İyileri
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {topPicks.map(item => (
              <Link key={item.id} href={`/${activeTab}/${item.id}`} className="group">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/50 transition-colors relative">
                  {getPosterUrl(item.poster_path, 'w342') ? (
                    <img src={getPosterUrl(item.poster_path, 'w342')!} alt={getMediaTitle(item)} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 text-xs text-[--text-secondary] text-center">{getMediaTitle(item)}</div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center gap-1">
                      <IconStar className="h-3 w-3 text-[--gold]" />
                      <span className="text-xs text-[--gold] font-semibold">{item.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-[--text-secondary] line-clamp-1 group-hover:text-white transition-colors">{getMediaTitle(item)}</p>
                <p className="text-[10px] text-[--text-secondary]/60">{getMediaYear(item)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Film/Dizi sekmeleri */}
      {hasMovies && hasSeries && (
        <div className="flex gap-1 mb-6 bg-[--bg-card] border border-[--border] rounded-xl p-1 w-fit">
          <Link href={tabBase('film')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'film' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
            <IconFilm className="h-4 w-4" /> Filmler
          </Link>
          <Link href={tabBase('dizi')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dizi' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
            <IconTv className="h-4 w-4" /> Diziler
          </Link>
        </div>
      )}

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <span className="text-sm text-[--text-secondary]">Sırala:</span>
        {SORT_OPTIONS.map(opt => (
          <Link
            key={opt.value}
            href={`${filterBase}&sirala=${opt.value}${yil ? `&yil=${yil}` : ''}`}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${sirala === opt.value ? 'border-[--accent] text-white bg-[--accent]/10' : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30'}`}
          >
            {opt.label}
          </Link>
        ))}
        <span className="text-sm text-[--text-secondary] ml-2">Yıl:</span>
        <div className="flex flex-wrap gap-1">
          <Link href={`${filterBase}&sirala=${sirala}`}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${!yil ? 'border-[--accent] text-white bg-[--accent]/10' : 'border-[--border] text-[--text-secondary] hover:text-white'}`}>
            Tümü
          </Link>
          {[2024, 2023, 2022, 2021, 2020, 2010, 2000, 1990].map(y => (
            <Link key={y} href={`${filterBase}&sirala=${sirala}&yil=${y}`}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${yil === String(y) ? 'border-[--accent] text-white bg-[--accent]/10' : 'border-[--border] text-[--text-secondary] hover:text-white'}`}>
              {y}
            </Link>
          ))}
        </div>
      </div>

      {/* Sonuçlar */}
      {results.length === 0 ? (
        <div className="text-center py-20 text-[--text-secondary]">İçerik bulunamadı.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map(item => (
            <MovieCard key={item.id} media={item} type={activeTab === 'film' ? 'film' : 'dizi'} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} baseUrl={`${filterBase}&sirala=${sirala}${yil ? `&yil=${yil}` : ''}`} />
    </div>
  )
}
