import Link from 'next/link'
import { Suspense } from 'react'
import {
  IconChevronRight, IconFilm, IconStar, IconTrendingUp, IconTv, IconFire,
} from '@/components/icons'
import {
  getTrendingAll, getBackdropUrl, getPosterUrl, getMediaTitle, getMediaYear,
  getMovieDetail, getSeriesDetail, discoverMovies,
  getTopRatedMovies, getTopRatedSeries,
} from '@/lib/tmdb'
import { GENRE_MAP } from '@/lib/genres'
import HomeCarousel from '@/components/HomeCarousel'
import HomeTrailerSection from '@/components/HomeTrailerSection'
import { createClient } from '@/lib/supabase/server'
import type { TMDbMovie } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  // ── Paralel veri çekme ──────────────────────────────────────────
  const [
    trendingRes,
    popularRes,
    topMoviesRes,
    topSeriesRes,
    newReleasesRes,
    editorPicksRes,
    { count: filmCount },
    { count: diziCount },
    { data: featuredQuoteRaw },
    { data: featuredPick },
    { data: { user } },
  ] = await Promise.all([
    getTrendingAll().catch(() => ({ results: [] as TMDbMovie[] })),
    discoverMovies({ sortBy: 'popularity.desc' }).catch(() => ({ results: [] })),
    getTopRatedMovies().catch(() => ({ results: [] as TMDbMovie[] })),
    getTopRatedSeries().catch(() => ({ results: [] as TMDbMovie[] })),
    discoverMovies({ sortBy: 'release_date.desc', minRating: '6' }).catch(() => ({ results: [] })),
    discoverMovies({ minRating: '8', sortBy: 'vote_count.desc' }).catch(() => ({ results: [] })),
    supabase.from('movies').select('*', { count: 'exact', head: true }),
    supabase.from('series').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('id,content,character_name,media_id,media_type')
      .eq('approved', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('featured_picks').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.auth.getUser(),
  ])

  // Hero
  const hero         = trendingRes.results[0]
  const heroBackdrop = getBackdropUrl(hero?.backdrop_path)
  const heroType     = (hero?.media_type === 'tv' ? 'dizi' : 'film') as 'film' | 'dizi'

  // Katalog varlığı
  const hasLocalCatalog = (filmCount ?? 0) > 5000

  // Özel seçim
  let featuredMedia: {
    id: number; type: string; title: string; poster: string | null
    overview: string; rating: number; label: string; note: string | null
  } | null = null
  if (featuredPick) {
    try {
      const m = featuredPick.media_type === 'dizi'
        ? await getSeriesDetail(featuredPick.media_id)
        : await getMovieDetail(featuredPick.media_id)
      featuredMedia = {
        id: featuredPick.media_id, type: featuredPick.media_type,
        title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w500'),
        overview: (m as any).overview ?? '', rating: (m as any).vote_average ?? 0,
        label: featuredPick.label, note: featuredPick.note,
      }
    } catch {}
  }

  // Haftanın alıntısı
  const featuredQuote = featuredQuoteRaw ?? null
  let quoteMediaTitle: string | null = null
  if (featuredQuote) {
    if (featuredQuote.media_type === 'film') {
      const { data: mv } = await supabase.from('movies').select('title').eq('tmdb_id', featuredQuote.media_id).maybeSingle()
      quoteMediaTitle = mv?.title ?? null
    } else {
      const { data: sv } = await supabase.from('series').select('name').eq('tmdb_id', featuredQuote.media_id).maybeSingle()
      quoteMediaTitle = sv?.name ?? null
    }
  }

  // Kişiselleştirme
  let userOnboarded = false
  let personalizedGenres: { items: TMDbMovie[]; name: string; slug: string }[] = []

  if (user) {
    const { data: prof } = await supabase
      .from('profiles').select('onboarding_completed,genre_preferences')
      .eq('id', user.id).maybeSingle()

    userOnboarded = prof?.onboarding_completed ?? false
    const genrePrefs: number[] = prof?.genre_preferences ?? []

    if (userOnboarded && genrePrefs.length > 0) {
      const topGenreEntries = genrePrefs.slice(0, 3)
        .map(id => {
          const found = Object.entries(GENRE_MAP).find(([, info]) => info.movieGenreId === id)
          return found ? { id, slug: found[0], name: found[1].name } : null
        })
        .filter((e): e is NonNullable<typeof e> => e !== null)

      const genreResults = await Promise.all(
        topGenreEntries.map(e =>
          discoverMovies({ genre: String(e.id), sortBy: 'popularity.desc', minRating: '7' }).catch(() => ({ results: [] }))
        )
      )

      personalizedGenres = topGenreEntries
        .map((e, i) => ({ name: e.name, slug: e.slug, items: genreResults[i].results.slice(0, 12) }))
        .filter(g => g.items.length > 0)
    }
  }

  // Carousel için tip dönüşümü — TV serileri
  const topSeriesItems: TMDbMovie[] = (topSeriesRes.results ?? []).map((s: any) => ({
    ...s,
    title: s.title || s.name || '',
    media_type: 'tv',
  }))

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      {hero && (
        <div className="relative h-[75vh] min-h-[450px] overflow-hidden">
          {heroBackdrop && (
            <img src={heroBackdrop} alt={getMediaTitle(hero)}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager" fetchPriority="high" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[--bg-primary] via-transparent to-transparent" />
          <div className="relative h-full flex items-end px-6 lg:px-16 max-w-7xl mx-auto pb-16">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <IconTrendingUp className="h-4 w-4 text-[--accent]" />
                <span className="text-xs font-semibold text-[--accent] uppercase tracking-wider">
                  Bu Haftanın Trendi
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
                {getMediaTitle(hero)}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <IconStar className="h-4 w-4 fill-[--gold] text-[--gold]" />
                  <span className="text-[--gold] font-semibold">{hero.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-[--text-secondary]">·</span>
                <span className="text-[--text-secondary] text-sm">{getMediaYear(hero)}</span>
              </div>
              <p className="text-[--text-secondary] text-sm leading-relaxed mb-6 line-clamp-3 max-w-lg">
                {hero.overview}
              </p>
              <Link
                href={`/${heroType}/${hero.id}`}
                className="inline-flex items-center gap-2 bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-[--accent]/30"
              >
                İncele <IconChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── İstatistik bandı ──────────────────────────────────────── */}
      {hasLocalCatalog && (
        <div className="bg-[--bg-card] border-y border-[--border]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <IconFilm className="h-4 w-4 text-[--accent]" />
                <span className="text-white font-bold">{(filmCount ?? 0).toLocaleString('tr-TR')}</span>
                <span className="text-[--text-secondary]">film</span>
              </div>
              <div className="w-px h-4 bg-[--border]" />
              <div className="flex items-center gap-2">
                <IconTv className="h-4 w-4 text-[--accent]" />
                <span className="text-white font-bold">{(diziCount ?? 0).toLocaleString('tr-TR')}</span>
                <span className="text-[--text-secondary]">dizi</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/filmler?dil=tr" className="text-xs text-[--accent] hover:underline font-medium">
                🇹🇷 Türk Filmleri
              </Link>
              <span className="text-[--border]">·</span>
              <Link href="/filmler?sirala=vote_average.desc" className="text-xs text-[--text-secondary] hover:text-white transition-colors">
                En İyi Puanlı
              </Link>
              <span className="text-[--border]">·</span>
              <Link href="/filmler?sirala=release_date.desc" className="text-xs text-[--text-secondary] hover:text-white transition-colors">
                Yeni Çıkanlar
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* ── Onboarding CTA ──────────────────────────────────────── */}
        {user && !userOnboarded && (
          <div className="rounded-2xl border border-[--accent]/40 bg-gradient-to-br from-[--accent]/15 via-[--bg-card] to-[--bg-card] p-6 sm:p-8 text-center">
            <p className="text-3xl mb-3">🎬</p>
            <h2 className="text-xl font-bold text-white mb-2">Sinezon'u Kişiselleştir</h2>
            <p className="text-sm text-[--text-secondary] max-w-md mx-auto mb-5">
              Favori türlerini, platformlarını ve filmleri bize anlat — sana özel bir sinema deneyimi hazırlayalım.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors shadow-lg shadow-[--accent]/20"
            >
              Başla → <span className="text-xs opacity-70">(~2 dk)</span>
            </Link>
          </div>
        )}

        {/* ── Kişiselleştirilmiş bölümler ───────────────────────── */}
        {personalizedGenres.map(g => (
          <HomeCarousel
            key={g.slug}
            title={`✨ Senin İçin: ${g.name}`}
            href={`/tur/${g.slug}`}
            items={g.items}
            defaultType="film"
          />
        ))}

        {userOnboarded && (
          <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-[--bg-card] border border-[--border]">
            <div>
              <p className="text-sm font-medium text-white">Kişisel Öneri Sayfan</p>
              <p className="text-xs text-[--text-secondary] mt-0.5">Zevklerine göre seçilmiş filmler ve diziler</p>
            </div>
            <Link href="/oneriler" className="text-sm text-[--accent] hover:underline font-medium whitespace-nowrap">
              Önerilere Git →
            </Link>
          </div>
        )}

        {/* ── 1. Bugün Trend ────────────────────────────────────── */}
        <HomeCarousel
          title="Bugün Trend"
          icon={<IconFire className="h-5 w-5 text-[--accent]" />}
          href="/filmler"
          items={trendingRes.results.slice(0, 20)}
          defaultType="film"
        />

        {/* ── 2. Bu Hafta Popüler ───────────────────────────────── */}
        <HomeCarousel
          title="Bu Hafta Popüler"
          icon={<IconTrendingUp className="h-5 w-5 text-[--accent]" />}
          href="/filmler?sirala=popularity.desc"
          items={(popularRes.results ?? []).slice(0, 20)}
          defaultType="film"
        />

        {/* ── Özel Seçim ───────────────────────────────────────── */}
        {featuredMedia && (
          <div className="rounded-2xl border border-[--accent]/30 bg-gradient-to-br from-[--accent]/10 via-[--bg-card] to-[--bg-card] overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-6 p-6">
              {featuredMedia.poster && (
                <Link href={`/${featuredMedia.type}/${featuredMedia.id}`} className="shrink-0">
                  <img
                    src={featuredMedia.poster}
                    alt={featuredMedia.title}
                    className="w-32 h-48 object-cover rounded-xl shadow-xl hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </Link>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[--accent] uppercase tracking-wider px-2 py-0.5 bg-[--accent]/15 rounded-full">
                    ★ {featuredMedia.label}
                  </span>
                </div>
                <Link href={`/${featuredMedia.type}/${featuredMedia.id}`}>
                  <h2 className="text-2xl font-bold text-white hover:text-[--accent] transition-colors leading-tight mb-1">
                    {featuredMedia.title}
                  </h2>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-[--gold] font-semibold">★ {featuredMedia.rating.toFixed(1)}</span>
                  <span className="text-[--border]">·</span>
                  <span className="text-xs text-[--text-secondary] capitalize">{featuredMedia.type}</span>
                </div>
                {featuredMedia.note && (
                  <p className="text-sm text-[--accent]/80 italic mb-2">"{featuredMedia.note}"</p>
                )}
                {featuredMedia.overview && (
                  <p className="text-sm text-[--text-secondary] leading-relaxed line-clamp-3 max-w-2xl mb-4">
                    {featuredMedia.overview}
                  </p>
                )}
                <Link
                  href={`/${featuredMedia.type}/${featuredMedia.id}`}
                  className="inline-flex items-center gap-2 bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors w-fit"
                >
                  İncele <IconChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. En Yüksek Puanlı Filmler ──────────────────────── */}
        <HomeCarousel
          title="En Yüksek Puanlı Filmler"
          icon={<IconStar className="h-5 w-5 text-[--gold]" />}
          href="/filmler?sirala=vote_average.desc"
          items={(topMoviesRes.results ?? []).slice(0, 20)}
          defaultType="film"
        />

        {/* ── 4. En Yüksek Puanlı Diziler ──────────────────────── */}
        <HomeCarousel
          title="En Yüksek Puanlı Diziler"
          icon={
            <div className="flex items-center gap-1">
              <IconTv className="h-5 w-5 text-[--gold]" />
            </div>
          }
          href="/diziler?sirala=vote_average.desc"
          items={topSeriesItems.slice(0, 20)}
          defaultType="dizi"
        />

        {/* ── 5. Yeni Eklenenler ────────────────────────────────── */}
        <HomeCarousel
          title="Yeni Eklenenler"
          icon={<IconFilm className="h-5 w-5 text-[--accent]" />}
          href="/filmler?sirala=release_date.desc"
          items={(newReleasesRes.results ?? []).slice(0, 20)}
          defaultType="film"
        />

        {/* ── 6. Editör Seçimleri ───────────────────────────────── */}
        <HomeCarousel
          title="Editör Seçimleri"
          icon={<IconStar className="h-5 w-5 text-[--accent]" />}
          href="/filmler?sirala=vote_count.desc"
          items={(editorPicksRes.results ?? []).slice(0, 20)}
          defaultType="film"
        />

        {/* ── Haftanın Alıntısı ─────────────────────────────────── */}
        {featuredQuote && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[--bg-card] to-[--bg-secondary] border border-[--border] px-8 py-10">
            <div className="absolute top-4 left-6 text-8xl text-[--accent]/10 font-serif leading-none select-none">"</div>
            <blockquote className="relative z-10 max-w-3xl mx-auto text-center">
              <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed italic">
                "{featuredQuote.content}"
              </p>
              <footer className="mt-4 flex flex-col items-center gap-1">
                {featuredQuote.character_name && (
                  <span className="text-[--accent] font-semibold">— {featuredQuote.character_name}</span>
                )}
                {quoteMediaTitle && (
                  <a
                    href={`/${featuredQuote.media_type}/${featuredQuote.media_id}`}
                    className="text-sm text-[--text-secondary] hover:text-white transition-colors"
                  >
                    {featuredQuote.media_type === 'film' ? '🎬' : '📺'} {quoteMediaTitle}
                  </a>
                )}
              </footer>
            </blockquote>
            <div className="absolute bottom-4 right-6 text-8xl text-[--accent]/10 font-serif leading-none rotate-180 select-none">"</div>
          </div>
        )}

        {/* ── Fragmanlar ───────────────────────────────────────── */}
        <Suspense fallback={<TrailerSkeleton />}>
          <HomeTrailerSection />
        </Suspense>
      </div>
    </div>
  )
}

function TrailerSkeleton() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <div className="h-5 w-5 rounded bg-[--skeleton] animate-pulse" />
        <div className="h-6 w-32 rounded bg-[--skeleton] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-[--bg-card] border border-[--border]">
            <div className="aspect-video bg-[--skeleton] animate-pulse" />
            <div className="p-3 space-y-1.5">
              <div className="h-3 rounded bg-[--skeleton] animate-pulse w-3/4" />
              <div className="h-2.5 rounded bg-[--skeleton] animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
