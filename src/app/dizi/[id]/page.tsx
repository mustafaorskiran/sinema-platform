import { notFound } from 'next/navigation'
import { getTranslations } from '@/lib/i18n'
import SinezonStats from '@/components/SinezonStats'
import { getSeriesDetail, getSimilarSeries, getBackdropUrl, getPosterUrl, getMediaTitle, getMediaYear, getTVWatchProviders, getSeriesImages, getSeriesKeywords, getSeriesCertification, getTVVideos, getPersonCredits } from '@/lib/tmdb'
import { tvGenreToSlug } from '@/lib/genres'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'
import WatchlistButton from '@/components/WatchlistButton'
import AddToListButton from '@/components/AddToListButton'
import TopicTagger from '@/components/TopicTagger'
import DiaryButton from '@/components/DiaryButton'
import PrivateNoteWidget from '@/components/PrivateNoteWidget'
import CollectionButton from '@/components/CollectionButton'
import WatchProviders from '@/components/WatchProviders'
import SeasonTracker from '@/components/SeasonTracker'
import CastRow from '@/components/CastRow'
import RatingSlider from '@/components/RatingSlider'
import BackdropGallery from '@/components/BackdropGallery'
import QuotesSection from '@/components/QuotesSection'
import SoundtrackSection from '@/components/SoundtrackSection'
import ShareButtons from '@/components/ShareButtons'
import SimilarWatchers from '@/components/SimilarWatchers'
import AffiliateLinks from '@/components/AffiliateLinks'
import VideoGallery from '@/components/VideoGallery'
import RatingDistribution from '@/components/RatingDistribution'
import DemoRatings from '@/components/DemoRatings'
import TriviaSection from '@/components/TriviaSection'
import AwardsSection from '@/components/AwardsSection'
import Keywords from '@/components/Keywords'
import ParentsGuide from '@/components/ParentsGuide'
import StickyRating from '@/components/StickyRating'
import PageNav from '@/components/PageNav'
import WatchStatusButton from '@/components/WatchStatusButton'
import CriticScores from '@/components/CriticScores'
import ReviewSortButton from '@/components/ReviewSortButton'
import AISummary from '@/components/AISummary'
import AIChatWidget from '@/components/AIChatWidget'
import AlsoWatched from '@/components/AlsoWatched'
import FilmOnerButton from '@/components/FilmOnerButton'
import AdBanner from '@/components/AdBanner'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { IconCake, IconScale, IconTv, IconStar, IconStarFilled, IconClipboard } from '@/components/icons'
import type { Review } from '@/lib/types'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ siralama?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { t } = await getTranslations()
  try {
    const series = await getSeriesDetail(Number(id))
    const title = getMediaTitle(series)
    const year = series.first_air_date?.split('-')[0] ?? ''
    const genreNames = (series.genres ?? []).slice(0, 2).map((g: { name: string }) => g.name).join(', ')
    const description = series.overview
      ? series.overview.slice(0, 155)
      : `${title}${year ? ` (${year})` : ''}${genreNames ? ' — ' + genreNames : ''} · ${t('series.metaDescriptionSuffix')}`
    const posterUrl = series.poster_path ? `https://image.tmdb.org/t/p/w300${series.poster_path}` : ''
    const ogParams = new URLSearchParams({ title, type: 'dizi', ...(year && { year }), ...(posterUrl && { poster: posterUrl }) })
    const ogImage = `/api/og?${ogParams.toString()}`
    return {
      title,
      description,
      alternates: { canonical: `/dizi/${id}` },
      openGraph: {
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        type: 'video.tv_show',
        url: `/dizi/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: [ogImage],
      },
    }
  } catch {
    return { title: t('series.notFound') }
  }
}

export default async function DiziPage({ params, searchParams }: Props) {
  const { id } = await params
  const { t } = await getTranslations()
  const { siralama = 'yeni' } = (await searchParams) ?? {}
  const seriesId = Number(id)

  const supabase = await createClient()

  const tvReviewSortMap: Record<string, { col: string; asc: boolean }> = {
    yeni:        { col: 'created_at', asc: false },
    puan_yuksek: { col: 'rating',     asc: false },
    puan_dusuk:  { col: 'rating',     asc: true  },
    populer:     { col: 'created_at', asc: false },
  }
  const tvSort = tvReviewSortMap[siralama] ?? tvReviewSortMap.yeni

  // ── TMDb istekleri ve series verisine bağlı olmayan Supabase sorguları aynı anda başlar ──
  // (getSession() network isteği yapmaz — middleware zaten bu istek için getUser() ile doğruladı)
  const [
    [series, similarData, imagesData, keywordsData, certification, videosData, watchProviders],
    { data: { session } },
    { data: reviews },
    { data: watchlistEntries },
    { data: triviaItems },
    { data: seriesQuotes },
    { data: containingListsRaw },
    { data: editorialMemberships },
    { data: topics },
    { data: allVotes },
  ] = await Promise.all([
    Promise.all([
      getSeriesDetail(seriesId).catch(() => null),
      getSimilarSeries(seriesId).catch(() => ({ results: [] })),
      getSeriesImages(seriesId).catch(() => ({ backdrops: [], posters: [] })),
      getSeriesKeywords(seriesId),
      getSeriesCertification(seriesId),
      getTVVideos(seriesId),
      getTVWatchProviders(seriesId).catch(() => null),
    ]),
    supabase.auth.getSession(),
    supabase.from('reviews')
      .select('*, profiles(username, avatar_url, is_admin)')
      .eq('media_id', seriesId).eq('media_type', 'dizi')
      .order(tvSort.col, { ascending: tvSort.asc }),
    supabase.from('watchlist').select('status').eq('media_id', seriesId).eq('media_type', 'dizi'),
    supabase.from('trivia')
      .select('id, content, type, created_at, profiles(username)')
      .eq('media_id', seriesId).eq('media_type', 'dizi').eq('approved', true)
      .order('created_at', { ascending: true }),
    supabase.from('quotes')
      .select('id, content, character_name, likes_count')
      .eq('media_id', seriesId).eq('media_type', 'dizi').eq('approved', true)
      .order('likes_count', { ascending: false })
      .limit(5),
    supabase.from('list_items').select('list_id').eq('media_id', seriesId).eq('media_type', 'dizi').limit(20),
    supabase.from('list_items').select('list_id').eq('media_id', seriesId).eq('media_type', 'dizi'),
    supabase.from('topics').select('id, name, slug, emoji').order('id'),
    supabase.from('topic_votes').select('topic_id, user_id').eq('media_id', seriesId).eq('media_type', 'dizi'),
  ])
  if (!series) notFound()
  const user = session?.user ?? null
  const backdrops = imagesData.backdrops.slice(0, 18)
  const posters   = [...imagesData.posters]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 10)
  const keywords  = keywordsData.results ?? []
  const videos    = videosData.results.filter(v => v.site === 'YouTube')
  const seriesGenreIds = (series.genres ?? []).map((g: { id: number }) => g.id)
  const director = series.credits?.crew?.find((c) => c.job === 'Director' || c.job === 'Series Director' || c.job === 'Creator')

  // ── series verisine bağlı sorgular: lokal benzer diziler + yaratıcının diğer dizileri aynı anda ──
  const [{ data: localSimilar }, directorCredits] = await Promise.all([
    seriesGenreIds.length > 0
      ? supabase.from('series')
          .select('tmdb_id, name, poster_path, vote_average, first_air_year, genre_ids')
          .contains('genre_ids', [seriesGenreIds[0]])
          .neq('tmdb_id', seriesId)
          .gte('vote_count', 50)
          .order('popularity', { ascending: false })
          .limit(12)
      : Promise.resolve({ data: null } as any),
    director?.id ? getPersonCredits(director.id).catch(() => null) : Promise.resolve(null),
  ])

  // Benzer diziler: lokal katalogdan genre eşleşmesi
  let similar = similarData.results.slice(0, 12)
  if ((localSimilar ?? []).length >= 6) {
    similar = (localSimilar ?? []).map((s: any) => ({
      id: s.tmdb_id, name: s.name, title: s.name, poster_path: s.poster_path,
      vote_average: s.vote_average, first_air_date: s.first_air_year ? `${s.first_air_year}-01-01` : '',
      genre_ids: s.genre_ids ?? [], overview: '', popularity: 0, backdrop_path: null, vote_count: 0, media_type: 'tv',
    }))
  }

  const userReview = reviews?.find((r: Review) => r.user_id === user?.id)

  const ratedReviews = (reviews ?? []).filter(r => r.rating > 0)
  const sinemaPuan = ratedReviews.length > 0
    ? ratedReviews.reduce((s: number, r: Review) => s + r.rating, 0) / ratedReviews.length
    : null

  // Watchlist topluluk istatistikleri
  const watchedCount = (watchlistEntries ?? []).filter(w => w.status === 'izledim').length
  const wantCount    = (watchlistEntries ?? []).filter(w => w.status === 'izlemek-istiyorum').length

  const containingListIds = [...new Set((containingListsRaw ?? []).map((r: any) => r.list_id))]
  const editorialListIds = (editorialMemberships ?? []).map((m: any) => m.list_id)

  const voteCounts: Record<number, number> = {}
  for (const v of allVotes ?? []) voteCounts[v.topic_id] = (voteCounts[v.topic_id] ?? 0) + 1
  const userVotedTopicIds = user ? (allVotes ?? []).filter(v => v.user_id === user.id).map(v => v.topic_id) : []

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  // ── İkinci tur: birincinin sonuçlarına bağımlı sorgular ──────────────────
  const reviewIds = (reviews ?? []).map(r => r.id)
  let likeData: Record<string, { count: number; liked: boolean }> = {}
  let replyCount: Record<string, number> = {}
  let helpfulData: Record<string, { count: number; marked: boolean }> = {}

  let watchlistStatus: 'izlemek-istiyorum' | 'izledim' | null = null
  let friendsRatings: { username: string; avatar_url: string | null; rating: number }[] = []
  let privateNote = ''
  let inCollection = false
  let collectionFormat = 'dijital'

  const [likesRes, userBlockRes, containingListsRes] = await Promise.all([
    reviewIds.length > 0
      ? Promise.all([
          supabase.from('review_likes').select('review_id, user_id').in('review_id', reviewIds),
          supabase.from('review_replies').select('review_id').in('review_id', reviewIds),
          supabase.from('review_helpful').select('review_id, user_id').in('review_id', reviewIds),
        ])
      : Promise.resolve(null),
    user
      ? Promise.all([
          supabase.from('watchlist').select('status').eq('user_id', user.id).eq('media_id', seriesId).eq('media_type', 'dizi').maybeSingle(),
          supabase.from('follows').select('following_id').eq('follower_id', user.id),
          supabase.from('private_notes').select('note').eq('user_id', user.id).eq('media_id', seriesId).eq('media_type', 'dizi').maybeSingle(),
          supabase.from('collection').select('format').eq('user_id', user.id).eq('media_id', seriesId).eq('media_type', 'dizi').maybeSingle(),
        ])
      : Promise.resolve(null),
    containingListIds.length > 0
      ? supabase.from('lists').select('id, title, profiles(username)').in('id', containingListIds).eq('public', true).not('user_id', 'is', null).limit(6)
      : Promise.resolve({ data: [] } as any),
  ])

  if (likesRes) {
    const [{ data: likes }, { data: repliesRaw }, { data: helpfulRows }] = likesRes
    for (const id of reviewIds) {
      const reviewLikes = (likes ?? []).filter(l => l.review_id === id)
      likeData[id] = {
        count: reviewLikes.length,
        liked: !!user && reviewLikes.some(l => l.user_id === user.id),
      }
      replyCount[id] = (repliesRaw ?? []).filter(r => r.review_id === id).length
      const helpfulForReview = (helpfulRows ?? []).filter(h => h.review_id === id)
      helpfulData[id] = {
        count: helpfulForReview.length,
        marked: !!user && helpfulForReview.some(h => h.user_id === user.id),
      }
    }
  }

  const tvSortedReviews = siralama === 'populer'
    ? [...(reviews ?? [])].sort((a, b) => (likeData[b.id]?.count ?? 0) - (likeData[a.id]?.count ?? 0))
    : (reviews ?? [])

  let followingIdsForFriends: string[] = []
  if (userBlockRes) {
    const [{ data: wl }, { data: follows }, { data: noteRow }, { data: colRow }] = userBlockRes
    watchlistStatus = (wl?.status as typeof watchlistStatus) ?? null
    privateNote = noteRow?.note ?? ''
    inCollection = !!colRow
    collectionFormat = colRow?.format ?? 'dijital'
    if (follows && follows.length > 0) followingIdsForFriends = follows.map(f => f.following_id)
  }

  if (followingIdsForFriends.length > 0) {
    const { data: friendReviews } = await supabase
      .from('reviews')
      .select('rating, profiles(username, avatar_url)')
      .eq('media_id', seriesId)
      .eq('media_type', 'dizi')
      .in('user_id', followingIdsForFriends)
    friendsRatings = (friendReviews ?? []).map(r => ({
      username: (r.profiles as unknown as { username: string; avatar_url: string | null })?.username ?? '',
      avatar_url: (r.profiles as unknown as { username: string; avatar_url: string | null })?.avatar_url ?? null,
      rating: r.rating,
    }))
  }

  const { data: containingLists } = containingListsRes

  const backdrop = getBackdropUrl(series.backdrop_path)
  const poster = getPosterUrl(series.poster_path, 'w500')
  const title = getMediaTitle(series)
  const cast = series.credits?.cast?.slice(0, 12) ?? []
  const trailer = series.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube')

  // Creator/yönetmenin diğer dizileri
  let directorOtherSeries: { id: number; name: string; poster_path: string | null; first_air_date: string; vote_average: number }[] = []
  if (directorCredits) {
    directorOtherSeries = (directorCredits.crew ?? [])
      .filter((c: any) => (c.job === 'Director' || c.job === 'Creator' || c.job === 'Series Director') && c.id !== seriesId && c.poster_path && c.vote_average > 5 && (c.first_air_date || c.release_date))
      .sort((a: any, b: any) => b.vote_average - a.vote_average)
      .slice(0, 8) as typeof directorOtherSeries
  }

  // Tam ekip
  const seriesCrew = series.credits?.crew ?? []
  const tvWriters   = seriesCrew.filter((c: any) => c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Creator').slice(0, 3)
  const tvComposers = seriesCrew.filter((c: any) => c.job === 'Original Music Composer' || c.job === 'Music').slice(0, 2)
  const tvDops      = seriesCrew.filter((c: any) => c.job === 'Director of Photography').slice(0, 2)
  const tvProducers = seriesCrew.filter((c: any) => c.job === 'Executive Producer' || c.job === 'Producer').slice(0, 3)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
  const imdbId = (series as any).external_ids?.imdb_id as string | null | undefined

  const anniversary = (() => {
    if (!series.first_air_date) return null
    const rd = new Date(series.first_air_date)
    const now = new Date()
    const years = now.getFullYear() - rd.getFullYear()
    if (years <= 0) return null
    const sameDay = rd.getMonth() === now.getMonth() && rd.getDate() === now.getDate()
    const sameWeek = Math.abs(rd.getMonth() * 31 + rd.getDate() - now.getMonth() * 31 - now.getDate()) <= 3
    if (sameDay) return { years, type: 'exact' as const }
    if (sameWeek) return { years, type: 'week' as const }
    return null
  })()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    '@id': `${siteUrl}/dizi/${seriesId}`,
    inLanguage: 'tr',
    url: `${siteUrl}/dizi/${seriesId}`,
    name: title,
    ...((series as any).original_name && (series as any).original_name !== title && { alternateName: (series as any).original_name }),
    ...(series.first_air_date && { startDate: series.first_air_date, datePublished: series.first_air_date }),
    ...((series as any).last_air_date && { endDate: (series as any).last_air_date }),
    description: series.overview ?? '',
    ...(series.poster_path && { image: `https://image.tmdb.org/t/p/w500${series.poster_path}` }),
    ...(certification && { contentRating: certification }),
    ...((series.vote_count ?? 0) > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(series.vote_average?.toFixed(1)),
        ratingCount: series.vote_count,
        bestRating: 10,
        worstRating: 1,
      }
    }),
    ...(series.number_of_episodes && { numberOfEpisodes: series.number_of_episodes }),
    ...(series.number_of_seasons && { numberOfSeasons: series.number_of_seasons }),
    ...(cast.length > 0 && {
      actor: cast.slice(0, 8).map((a: { id: number; name: string }) => ({
        '@type': 'Person',
        name: a.name,
        url: `${siteUrl}/oyuncu/${a.id}`,
      }))
    }),
    ...(director
      ? director.job === 'Creator'
        ? { creator: [{ '@type': 'Person', name: director.name, url: `${siteUrl}/oyuncu/${director.id}` }] }
        : { director: [{ '@type': 'Person', name: director.name, url: `${siteUrl}/oyuncu/${director.id}` }] }
      : {}
    ),
    ...(series.genres?.length && { genre: series.genres.map((g: { id: number; name: string }) => g.name) }),
    ...((series as any).production_companies?.length && {
      productionCompany: (series as any).production_companies.slice(0, 3).map((c: { name: string }) => ({
        '@type': 'Organization',
        name: c.name,
      }))
    }),
    ...(trailer && {
      trailer: {
        '@type': 'VideoObject',
        name: `${title} — ${t('film.trailer')}`,
        embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
        thumbnailUrl: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
      }
    }),
    ...(imdbId && { sameAs: `https://www.imdb.com/title/${imdbId}/` }),
  }

  const breadcrumbItems = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Diziler', path: '/diziler' },
    { name: title, path: `/dizi/${seriesId}` },
  ]

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <BreadcrumbJsonLd items={breadcrumbItems} />
    <div>
      {/* Backdrop */}
      <div className="relative h-[72vh] min-h-[500px] max-h-[860px] overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt={title} className="absolute inset-0 w-full h-full object-cover object-center" style={{ filter: 'brightness(0.85) saturate(1.12)' }} />
        )}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[--bg-primary]/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[--bg-primary] via-[--bg-primary]/80 to-transparent" style={{ height: '440px' }} />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[--bg-primary]/90 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-52 relative">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Poster — desktop */}
          <div className="shrink-0 hidden md:block">
            <div
              className="w-52 lg:w-64 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 12px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)' }}
            >
              {poster ? (
                <img src={poster} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="aspect-[2/3] bg-[--bg-card] flex items-center justify-center text-[--text-secondary] text-sm">
                  {t('film.poster')}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2 md:pt-10">
            {/* Poster — mobil */}
            {poster && (
              <div className="md:hidden mb-4">
                <div className="w-32 rounded-xl overflow-hidden" style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)' }}>
                  <img src={poster} alt={title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {anniversary && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse"
                style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' }}>
                <IconCake size={14} /> {anniversary.type === 'exact' ? t('film.anniversaryToday', { years: anniversary.years }) : t('film.anniversaryWeek', { years: anniversary.years })}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">{title}</h1>
            {(series as any).original_name && (series as any).original_name !== title && (
              <p className="mt-1.5 text-base italic" style={{ color: 'var(--text-secondary)' }}>
                {(series as any).original_name}
              </p>
            )}
            {series.tagline && (
              <p className="mt-2 text-sm italic opacity-70" style={{ color: 'var(--text-secondary)' }}>
                "{series.tagline}"
              </p>
            )}

            {/* Meta — teknik bilgi */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {series.first_air_date && (
                <span className="font-medium">{getMediaYear(series)}</span>
              )}
              {series.number_of_seasons && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{series.number_of_seasons} {t('series.seasons')}</span>
                </>
              )}
            </div>

            {/* Sinezon Topluluk İstatistikleri */}
            <SinezonStats
              sinezonRating={sinemaPuan}
              ratingCount={ratedReviews.length}
              reviewCount={reviews?.length ?? 0}
              watchedCount={watchedCount}
              wantCount={wantCount}
              tmdbRating={series.vote_average}
              tmdbVoteCount={series.vote_count ?? 0}
            />

            <CriticScores imdbId={imdbId} />

            {/* AI Özet + Sohbet */}
            <AISummary
              mediaId={seriesId}
              mediaType="dizi"
              title={title}
              year={getMediaYear(series) ?? ''}
              genres={(series.genres ?? []).map((g: any) => g.name).join(', ')}
              director={director?.name ?? ''}
            />
            <AIChatWidget
              mediaId={seriesId}
              mediaType="dizi"
              title={title}
              year={getMediaYear(series) ?? ''}
              genres={(series.genres ?? []).map((g: any) => g.name).join(', ')}
              director={director?.name}
              isLoggedIn={!!user}
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {series.genres?.map((g) => {
                const slug = tvGenreToSlug(g.id)
                return slug ? (
                  <a key={g.id} href={`/tur/${slug}`} className="genre-chip text-[11px] font-medium px-3.5 py-1.5 rounded-full">
                    {g.name}
                  </a>
                ) : (
                  <span key={g.id} className="genre-chip text-[11px] font-medium px-3.5 py-1.5 rounded-full">{g.name}</span>
                )
              })}
            </div>

            {/* Yayın Ağı */}
            {(series as { networks?: { id: number; name: string; logo_path: string | null }[] }).networks?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {(series as { networks?: { id: number; name: string; logo_path: string | null }[] }).networks!.map(n => (
                  <div key={n.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {n.logo_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w45${n.logo_path}`}
                        alt={n.name}
                        className="h-4 object-contain opacity-70"
                      />
                    )}
                    <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{n.name}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Puan Barı */}
            <div className="mt-5 max-w-lg">
              <RatingSlider
                mediaId={seriesId}
                mediaType="dizi"
                siteAvg={sinemaPuan}
                siteVoteCount={ratedReviews.length}
                imdbAvg={series.vote_average}
                imdbVoteCount={series.vote_count ?? 0}
                userRating={userReview?.rating ?? null}
                isLoggedIn={!!user}
              />
            </div>

            {/* Watchlist + Listeye Ekle */}
            <div className="mt-4 flex flex-wrap gap-2">
              <WatchlistButton
                mediaId={seriesId}
                mediaType="dizi"
                initialStatus={watchlistStatus}
                isLoggedIn={!!user}
              />
              <WatchStatusButton
                mediaId={seriesId}
                mediaType="dizi"
                isLoggedIn={!!user}
              />
              {user?.id && (
                <AddToListButton mediaId={seriesId} mediaType="dizi" userId={user.id} />
              )}
              <DiaryButton
                mediaId={seriesId}
                mediaType="dizi"
                mediaTitle={title}
                isLoggedIn={!!user}
              />
              {user && (
                <CollectionButton
                  mediaId={seriesId}
                  mediaType="dizi"
                  inCollection={inCollection}
                  initialFormat={collectionFormat}
                />
              )}
            </div>

            {/* Paylaş + Karşılaştır */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ShareButtons path={`/dizi/${seriesId}`} title={`${title} — ${t('film.shareSuffix')}`} />
              <a
                href={`/karsilastir?a=${seriesId}&ta=dizi`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:text-white hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}
              >
                <IconScale size={14} /> {t('film.compare')}
              </a>
              {user && (
                <FilmOnerButton
                  filmId={seriesId}
                  filmType="dizi"
                  filmTitle={title}
                  filmPoster={getPosterUrl(series.poster_path, 'w342') ?? ''}
                />
              )}
            </div>

            {series.overview && (
              <p className="mt-6 text-[15px] leading-[1.75] max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                {series.overview}
              </p>
            )}

            {/* ── Bilgi Kartları ── */}
            <div className="mt-6 rounded-2xl overflow-hidden max-w-xl"
              style={{
                background: 'linear-gradient(160deg, rgba(20,28,47,0.95) 0%, rgba(14,20,32,0.98) 100%)',
                border: '1px solid rgba(212,168,67,0.12)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0">
                {[
                  series.first_air_date && {
                    label: t('series.labelFirstAir'),
                    value: new Date(series.first_air_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
                    link: null,
                  },
                  series.number_of_seasons && {
                    label: t('series.labelSeasonEpisode'),
                    value: `${series.number_of_seasons} ${t('series.seasons')}${series.number_of_episodes ? ` · ${series.number_of_episodes} ${t('series.episodes')}` : ''}`,
                    link: null,
                  },
                  (series as any).spoken_languages?.[0] && {
                    label: t('film.labelLanguage'),
                    value: ((series as any).spoken_languages as Array<{ english_name?: string; name: string }>)
                      .slice(0, 2).map(l => l.english_name || l.name).join(', '),
                    link: null,
                  },
                  (series as any).production_countries?.[0] && {
                    label: t('film.labelCountry'),
                    value: ((series as any).production_countries as Array<{ name: string }>)
                      .slice(0, 2).map(c => c.name).join(', '),
                    link: null,
                  },
                  director && {
                    label: director.job === 'Creator' ? t('series.creator') : t('film.director'),
                    value: director.name,
                    link: `/oyuncu/${director.id}`,
                  },
                  (series as any).networks?.[0] && {
                    label: t('series.network'),
                    value: (series as any).networks[0].name,
                    link: null,
                  },
                ].filter(Boolean).map((item: any, i, arr) => (
                  <div key={item.label}
                    className="px-5 py-4"
                    style={{
                      borderRight: (i + 1) % 3 !== 0 && i < arr.length - 1 ? '1px solid rgba(212,168,67,0.08)' : undefined,
                      borderBottom: i < arr.length - 3 ? '1px solid rgba(212,168,67,0.08)' : undefined,
                    }}>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: 'rgba(212,168,67,0.45)' }}>
                      {item.label}
                    </p>
                    {item.link ? (
                      <a href={item.link} className="text-[13px] font-semibold transition-colors hover:text-[--accent]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <WatchProviders allProviders={watchProviders} mediaType="dizi" title={title} />
            <AffiliateLinks title={title} year={getMediaYear(series)} />

            {/* Sezon Listesi */}
            {((series as any).seasons ?? []).filter((s: any) => s.season_number > 0).length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-5 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
                  <h2 className="text-base font-bold text-white">{t('series.seasonsHeading')}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {((series as any).seasons as any[])
                    .filter((s: any) => s.season_number > 0)
                    .map((s: any) => (
                    <a key={s.season_number} href={`/dizi/${seriesId}/sezon/${s.season_number}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl transition-all active:scale-95 hover:-translate-y-0.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', minHeight: '56px' }}>
                      {s.poster_path
                        ? <img src={`https://image.tmdb.org/t/p/w92${s.poster_path}`} alt={t('series.seasonNumber', { n: s.season_number })}
                            className="w-8 h-12 rounded-md object-cover shrink-0" />
                        : <div className="w-8 h-12 rounded-md shrink-0 flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}><IconTv size={18} /></div>
                      }
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">{t('series.seasonNumber', { n: s.season_number })}</p>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.episode_count} {t('series.episodes')}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Konular */}
            <TopicTagger
              topics={topics ?? []}
              mediaId={seriesId}
              mediaType="dizi"
              userVotedIds={userVotedTopicIds}
              voteCounts={voteCounts}
              isLoggedIn={!!user}
            />

            {/* Keywords */}
            <Keywords keywords={keywords} mediaType="dizi" />

            {/* İçerik Rehberi */}
            <ParentsGuide certification={certification} genres={(series as any).genres ?? []} />

          </div>
        </div>

        {/* ── Featured Fragman ── */}
        {trailer && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">{t('film.trailer')}</h2>
            </div>
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%', background: 'var(--bg-card)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?modestbranding=1&rel=0`}
                title={`${title} — ${t('film.trailer')}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Sayfa içi navigasyon */}
        <PageNav sections={[
          { id: 'oyuncular', label: t('film.cast') },
          { id: 'odüller', label: t('film.awardsNav') },
          { id: 'puan-dagilimi', label: t('film.ratingsNav') },
          ...(videos.length > 0 ? [{ id: 'videolar', label: t('film.videosNav') }] : []),
          ...(backdrops.length > 0 || posters.length > 0 ? [{ id: 'galeri', label: t('film.galleryNav') }] : []),
          { id: 'trivia', label: t('film.triviaNav') },
          { id: 'yorumlar', label: t('film.reviewsNav') },
          { id: 'benzer', label: t('film.similarNav') },
        ]} />

        {/* Cast & Crew */}
        <div id="oyuncular">
          <CastRow cast={cast} director={director} />

          {/* Tam Ekip */}
          {(tvWriters.length > 0 || tvComposers.length > 0 || tvDops.length > 0 || tvProducers.length > 0) && (
            <div className="mt-6 rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(212,168,67,0.08)', background: 'rgba(212,168,67,0.02)' }}>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(212,168,67,0.5)' }}>{t('film.crew')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: 'rgba(212,168,67,0.06)' }}>
                {[
                  tvWriters.length > 0 && { label: t('series.creatorWriter'), people: tvWriters },
                  tvComposers.length > 0 && { label: t('film.composer'), people: tvComposers },
                  tvDops.length > 0 && { label: t('film.cinematographer'), people: tvDops },
                  tvProducers.length > 0 && { label: t('series.executiveProducer'), people: tvProducers },
                ].filter(Boolean).map((item: any) => (
                  <div key={item.label} className="px-4 py-3" style={{ background: 'rgba(14,20,32,0.95)' }}>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: 'rgba(212,168,67,0.4)' }}>{item.label}</p>
                    {item.people.map((p: any) => (
                      <a key={p.id} href={`/oyuncu/${p.id}`}
                        className="company-link block text-[12px] font-medium leading-snug mb-0.5">
                        {p.name}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMDb Linki */}
          {imdbId && (
            <div className="mt-4">
              <a href={`https://www.imdb.com/title/${imdbId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)', color: '#D4A843' }}>
                <IconStar size={14} /> {t('film.imdbOpen')} →
              </a>
            </div>
          )}
        </div>

        {/* Ödüller */}
        <div id="odüller">
          <AwardsSection editorialListIds={editorialListIds} />
        </div>

        {/* Puan Dağılımı */}
        <div id="puan-dagilimi">
          <RatingDistribution reviews={reviews ?? []} />
          <DemoRatings mediaId={seriesId} mediaType="dizi" />
        </div>

        {/* Reklam */}
        <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_1 ?? ''} format="horizontal" className="my-4 rounded-xl overflow-hidden" />

        {/* Video Galerisi */}
        <div id="videolar">
          <VideoGallery videos={videos} title={title} />
        </div>

        {/* Arkadaşların Puanları */}
        {friendsRatings.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">{t('film.friendsRatings')}</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {friendsRatings.map(fr => (
                <a key={fr.username} href={`/profil/${fr.username}`}
                  className="friend-card flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                >
                  <div className="h-7 w-7 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    {fr.avatar_url ? <img src={fr.avatar_url} alt={fr.username} className="w-full h-full object-cover" /> : fr.username[0]?.toUpperCase()}
                  </div>
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{fr.username}</span>
                  <span className="text-[13px] font-bold inline-flex items-center gap-1" style={{ color: '#D4A843' }}><IconStarFilled size={12} /> {fr.rating}</span>
                </a>
              ))}
            </div>
            {friendsRatings.length > 1 && (
              <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('film.average')} <span className="font-bold" style={{ color: '#D4A843' }}>{(friendsRatings.reduce((s, r) => s + r.rating, 0) / friendsRatings.length).toFixed(1)}/10</span>
              </p>
            )}
          </div>
        )}

        {/* Sezon/Bölüm Takibi */}
        {series.seasons && series.seasons.length > 0 && (
          <SeasonTracker
            seriesId={seriesId}
            seasons={series.seasons}
            isLoggedIn={!!user}
          />
        )}

        {/* Fotoğraf Galerisi */}
        <div className="mt-10" id="galeri">
          <BackdropGallery backdrops={backdrops} posters={posters} title={series ? getMediaTitle(series) : ''} />
        </div>

        {/* Alıntılar */}
        <QuotesSection mediaId={seriesId} mediaType="dizi" isLoggedIn={!!user} title={title} />

        {/* Soundtrack */}
        <SoundtrackSection mediaId={seriesId} mediaType="dizi" isLoggedIn={!!user} />

        {/* Trivia & Goofs */}
        {/* Dizi Alıntıları */}
        {(seriesQuotes ?? []).length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
                <h2 className="text-xl font-bold text-white tracking-tight">{t('film.memorableQuotes')}</h2>
              </div>
              <a href="/alintilar" className="text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('film.viewAll')} →
              </a>
            </div>
            <div className="space-y-3">
              {(seriesQuotes ?? []).map((q: any) => (
                <div key={q.id} className="p-4 rounded-xl"
                  style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.12)' }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    &ldquo;{q.content}&rdquo;
                  </p>
                  {q.character_name && (
                    <p className="text-xs mt-1.5 font-semibold" style={{ color: 'rgba(212,168,67,0.6)' }}>
                      — {q.character_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div id="trivia">
          <TriviaSection
            items={(triviaItems ?? []) as any}
            mediaId={seriesId}
            mediaType="dizi"
            isLoggedIn={!!user}
          />
        </div>

        {/* Bu Diziyi İçeren Listeler */}
        {(containingLists ?? []).length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">{t('series.containingLists')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(containingLists ?? []).map((list: any) => (
                <a key={list.id} href={`/liste/${list.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.7)' }}>
                  <IconClipboard size={14} /> {list.title}
                  {list.profiles?.username && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>@{list.profiles.username}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bu izleyenler şunu da izledi */}
        <AlsoWatched mediaId={seriesId} mediaType="dizi" />

        <div className="mt-12 grid lg:grid-cols-3 gap-8" id="yorumlar">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #E11D48 0%, #E11D4880 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">
                {userReview ? t('review.editTitle') : t('review.write')}
              </h2>
            </div>
            {user && (
              <div className="mb-5">
                <PrivateNoteWidget mediaId={seriesId} mediaType="dizi" initialNote={privateNote} />
              </div>
            )}
            {user ? (
              <ReviewForm mediaId={seriesId} mediaType="dizi" existingReview={userReview} />
            ) : (
              <div className="rounded-lg p-6 text-center"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[--text-secondary] text-sm mb-4">
                  {t('review.loginPrompt')}
                </p>
                <a
                  href="/auth/giris"
                  className="inline-block bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
                >
                  {t('review.loginBtn')}
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_2 ?? ''} format="rectangle" className="mb-5 rounded-xl overflow-hidden" />
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #E11D48 0%, #E11D4880 100%)' }} />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {t('review.title')} <span className="font-normal text-base" style={{ color: 'rgba(255,255,255,0.35)' }}>({reviews?.length ?? 0})</span>
                </h2>
              </div>
              <ReviewSortButton current={siralama as any} />
            </div>
            <ReviewList reviews={tvSortedReviews} currentUserId={user?.id} likeData={likeData} replyCount={replyCount} helpfulData={helpfulData} />
          </div>
        </div>

        {/* Bunu İzleyenler */}
        <SimilarWatchers mediaId={seriesId} mediaType="dizi" />

        {/* Yaratıcının/Yönetmenin Diğer Dizileri */}
        {directorOtherSeries.length > 0 && director && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">
                {director.name} — {t('series.otherWorksBy')}
              </h2>
              <a href={`/kisi/${director.id}`} className="ml-auto text-xs hover:underline" style={{ color: 'var(--accent)' }}>
                {t('film.fullFilmography')} →
              </a>
            </div>
            <div className="home-carousel-scroll flex gap-3 overflow-x-auto pb-3">
              {directorOtherSeries.map((s) => (
                <a key={s.id} href={`/dizi/${s.id}`} className="group shrink-0 w-[120px]" style={{ scrollSnapAlign: 'start' }}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {getPosterUrl(s.poster_path, 'w342') && (
                      <img src={getPosterUrl(s.poster_path, 'w342')!} alt={s.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5"
                      style={{ background: 'rgba(0,0,0,0.75)', color: '#D4A843', backdropFilter: 'blur(4px)' }}>
                      <IconStarFilled size={10} /> {s.vote_average.toFixed(1)}
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs font-medium line-clamp-2 group-hover:text-white transition-colors"
                    style={{ color: 'rgba(255,255,255,0.6)' }}>{s.name}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{(s.first_air_date || '').slice(0,4)}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Benzer Diziler */}
        {similar.length > 0 && (
          <div className="mt-12" id="benzer">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">{t('series.similar')}</h2>
            </div>
            <div className="home-carousel-scroll flex gap-3 overflow-x-auto pb-3">
              {similar.map((item) => (
                <a key={item.id} href={`/dizi/${item.id}`} className="group shrink-0 w-[128px]" style={{ scrollSnapAlign: 'start' }}>
                  <div
                    className="relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                  >
                    {getPosterUrl(item.poster_path, 'w342') ? (
                      <img
                        src={getPosterUrl(item.poster_path, 'w342')!}
                        alt={getMediaTitle(item)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs p-2 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {getMediaTitle(item)}
                      </div>
                    )}
                    {item.vote_average > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5"
                        style={{ background: 'rgba(0,0,0,0.75)', color: '#D4A843', backdropFilter: 'blur(4px)' }}>
                        <IconStarFilled size={10} /> {item.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] leading-tight line-clamp-2 transition-colors group-hover:text-white/70" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {getMediaTitle(item)}
                  </p>
                  {getMediaYear(item) && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{getMediaYear(item)}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="pb-24" />
      </div>
    </div>

    {/* Sticky Puan Ver */}
    <StickyRating
      mediaId={seriesId}
      mediaType="dizi"
      title={title}
      posterPath={series.poster_path}
      isLoggedIn={!!user}
      currentRating={userReview?.rating ?? null}
    />
    </>
  )
}
