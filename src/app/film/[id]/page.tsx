import { notFound } from 'next/navigation'
import { getTranslations } from '@/lib/i18n'
import SinezonStats from '@/components/SinezonStats'
import { getMovieDetail, getSimilarMovies, getBackdropUrl, getPosterUrl, getMediaTitle, getMediaYear, getMovieWatchProviders, getMovieImages, getMovieKeywords, getMovieCertification, getMovieVideos, getPersonCredits } from '@/lib/tmdb'
import { movieGenreToSlug } from '@/lib/genres'
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
import WhoWatchedThis from '@/components/WhoWatchedThis'
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
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import ParentsGuide from '@/components/ParentsGuide'
import StickyRating from '@/components/StickyRating'
import PageNav from '@/components/PageNav'
import CriticScores from '@/components/CriticScores'
import AISummary from '@/components/AISummary'
import AIChatWidget from '@/components/AIChatWidget'
import ReviewSortButton from '@/components/ReviewSortButton'
import FilmOnerButton from '@/components/FilmOnerButton'
import AlsoWatched from '@/components/AlsoWatched'
import ReleaseReminderButton from '@/components/ReleaseReminderButton'
import AdBanner from '@/components/AdBanner'
import { IconCake, IconScale, IconFilm, IconStar, IconStarFilled, IconClipboard } from '@/components/icons'
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
    const movie = await getMovieDetail(Number(id))
    const title = getMediaTitle(movie)
    const year = movie.release_date?.split('-')[0] ?? ''
    const genreNames = (movie.genres ?? []).slice(0, 2).map((g: { name: string }) => g.name).join(', ')
    const description = movie.overview
      ? movie.overview.slice(0, 155)
      : `${title}${year ? ` (${year})` : ''}${genreNames ? ' — ' + genreNames : ''} · ${t('film.metaDescriptionSuffix')}`
    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : ''
    const ogParams = new URLSearchParams({ title, type: 'film', ...(year && { year }), ...(posterUrl && { poster: posterUrl }) })
    const ogImage = `/api/og?${ogParams.toString()}`
    return {
      title,
      description,
      alternates: { canonical: `/film/${id}` },
      openGraph: {
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        type: 'video.movie',
        url: `/film/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: [ogImage],
      },
    }
  } catch {
    return { title: t('film.notFound') }
  }
}

export default async function FilmPage({ params, searchParams }: Props) {
  const { id } = await params
  const { t } = await getTranslations()
  const { siralama = 'yeni' } = (await searchParams) ?? {}
  const movieId = Number(id)

  const supabase = await createClient()

  const reviewSortMap: Record<string, { col: string; asc: boolean }> = {
    yeni:        { col: 'created_at',  asc: false },
    puan_yuksek: { col: 'rating',      asc: false },
    puan_dusuk:  { col: 'rating',      asc: true  },
    populer:     { col: 'created_at',  asc: false },
  }
  const rSort = reviewSortMap[siralama] ?? reviewSortMap.yeni

  // ── TMDb istekleri ve movie verisine bağlı olmayan Supabase sorguları aynı anda başlar ──
  // (getSession() network isteği yapmaz — middleware zaten bu istek için getUser() ile doğruladı)
  const [
    [movie, similarData, imagesData, keywordsData, certification, videosData, watchProviders],
    { data: { session } },
    { data: reviews },
    { data: watchlistEntries },
    { data: triviaItems },
    { data: movieQuotes },
    { data: editorialMemberships },
    { data: containingListsRaw },
    { data: topics },
    { data: allVotes },
  ] = await Promise.all([
    Promise.all([
      getMovieDetail(movieId).catch(() => null),
      getSimilarMovies(movieId).catch(() => ({ results: [] })),
      getMovieImages(movieId).catch(() => ({ backdrops: [], posters: [] })),
      getMovieKeywords(movieId).catch(() => ({ keywords: [] })),
      getMovieCertification(movieId).catch(() => null),
      getMovieVideos(movieId).catch(() => ({ results: [] })),
      getMovieWatchProviders(movieId).catch(() => null),
    ]),
    supabase.auth.getSession(),
    supabase.from('reviews')
      .select('*, profiles(username, avatar_url, is_admin)')
      .eq('media_id', movieId).eq('media_type', 'film')
      .order(rSort.col, { ascending: rSort.asc }),
    supabase.from('watchlist').select('status').eq('media_id', movieId).eq('media_type', 'film'),
    supabase.from('trivia')
      .select('id, content, type, created_at, profiles(username)')
      .eq('media_id', movieId).eq('media_type', 'film').eq('approved', true)
      .order('created_at', { ascending: true }),
    supabase.from('quotes')
      .select('id, content, character_name, likes_count')
      .eq('media_id', movieId).eq('media_type', 'film').eq('approved', true)
      .order('likes_count', { ascending: false })
      .limit(5),
    supabase.from('list_items').select('list_id').eq('media_id', movieId).eq('media_type', 'film'),
    supabase.from('list_items').select('list_id').eq('media_id', movieId).eq('media_type', 'film').limit(20),
    supabase.from('topics').select('id, name, slug, emoji').order('id'),
    supabase.from('topic_votes').select('topic_id, user_id').eq('media_id', movieId).eq('media_type', 'film'),
  ])
  if (!movie) notFound()
  const user = session?.user ?? null
  const backdrops = imagesData.backdrops.slice(0, 18)
  const posters   = [...imagesData.posters]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 10)
  const keywords  = keywordsData.keywords ?? []
  const videos    = videosData.results.filter(v => v.site === 'YouTube')
  const movieGenreIds = (movie.genres ?? []).map((g: { id: number }) => g.id)
  const director = movie.credits?.crew?.find((c) => c.job === 'Director')

  // ── movie verisine bağlı sorgular: lokal benzer filmler + yönetmenin diğer filmleri aynı anda ──
  const [{ data: localSimilar }, directorCredits] = await Promise.all([
    movieGenreIds.length > 0
      ? supabase.from('movies')
          .select('tmdb_id, title, poster_path, vote_average, release_year, genre_ids')
          .contains('genre_ids', [movieGenreIds[0]])
          .neq('tmdb_id', movieId)
          .gte('vote_count', 100)
          .order('popularity', { ascending: false })
          .limit(12)
      : Promise.resolve({ data: null } as any),
    director?.id ? getPersonCredits(director.id).catch(() => null) : Promise.resolve(null),
  ])

  // Benzer filmler: önce lokal katalogdan genre eşleşmesi dene
  let similar = similarData.results.slice(0, 12)
  if ((localSimilar ?? []).length >= 6) {
    similar = (localSimilar ?? []).map((m: any) => ({
      id: m.tmdb_id, title: m.title, poster_path: m.poster_path,
      vote_average: m.vote_average, release_date: m.release_year ? `${m.release_year}-01-01` : '',
      genre_ids: m.genre_ids ?? [], overview: '', popularity: 0, backdrop_path: null, vote_count: 0,
    }))
  }

  const userReview = reviews?.find((r: Review) => r.user_id === user?.id)

  // SineMa platform puanı
  const ratedReviews = (reviews ?? []).filter(r => r.rating > 0)
  const sinemaPuan = ratedReviews.length > 0
    ? ratedReviews.reduce((s: number, r: Review) => s + r.rating, 0) / ratedReviews.length
    : null

  // Watchlist topluluk istatistikleri (kullanıcıya özel değil, genel sayım)
  const watchedCount = (watchlistEntries ?? []).filter(w => w.status === 'izledim').length
  const wantCount    = (watchlistEntries ?? []).filter(w => w.status === 'izlemek-istiyorum').length

  const editorialListIds = (editorialMemberships ?? []).map((m: any) => m.list_id)
  const containingListIds = [...new Set((containingListsRaw ?? []).map((r: any) => r.list_id))]

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
  let hasReminder = false

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
          supabase.from('watchlist').select('status').eq('user_id', user.id).eq('media_id', movieId).eq('media_type', 'film').maybeSingle(),
          supabase.from('follows').select('following_id').eq('follower_id', user.id),
          supabase.from('private_notes').select('note').eq('user_id', user.id).eq('media_id', movieId).eq('media_type', 'film').maybeSingle(),
          supabase.from('collection').select('format').eq('user_id', user.id).eq('media_id', movieId).eq('media_type', 'film').maybeSingle(),
          supabase.from('release_reminders').select('id').eq('user_id', user.id).eq('media_id', movieId).eq('media_type', 'film').maybeSingle(),
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

  // Populer sıralama: beğeni sayısına göre
  const sortedReviews = siralama === 'populer'
    ? [...(reviews ?? [])].sort((a, b) => (likeData[b.id]?.count ?? 0) - (likeData[a.id]?.count ?? 0))
    : (reviews ?? [])

  let followingIdsForFriends: string[] = []
  if (userBlockRes) {
    const [{ data: wl }, { data: follows }, { data: noteRow }, { data: colRow }, { data: reminderRow }] = userBlockRes
    watchlistStatus = (wl?.status as typeof watchlistStatus) ?? null
    privateNote = noteRow?.note ?? ''
    inCollection = !!colRow
    collectionFormat = colRow?.format ?? 'dijital'
    hasReminder = !!reminderRow
    if (follows && follows.length > 0) followingIdsForFriends = follows.map(f => f.following_id)
  }

  if (followingIdsForFriends.length > 0) {
    const { data: friendReviews } = await supabase
      .from('reviews')
      .select('rating, profiles(username, avatar_url)')
      .eq('media_id', movieId)
      .eq('media_type', 'film')
      .in('user_id', followingIdsForFriends)
    friendsRatings = (friendReviews ?? []).map(r => ({
      username: (r.profiles as unknown as { username: string; avatar_url: string | null })?.username ?? '',
      avatar_url: (r.profiles as unknown as { username: string; avatar_url: string | null })?.avatar_url ?? null,
      rating: r.rating,
    }))
  }

  const { data: containingLists } = containingListsRes

  const backdrop = getBackdropUrl(movie.backdrop_path)
  const poster = getPosterUrl(movie.poster_path, 'w500')
  const title = getMediaTitle(movie)
  const cast = movie.credits?.cast?.slice(0, 12) ?? []

  // Yönetmenin diğer filmleri
  let directorOtherMovies: { id: number; title: string; poster_path: string | null; release_date: string; vote_average: number }[] = []
  if (directorCredits) {
    directorOtherMovies = (directorCredits.crew ?? [])
      .filter((c: any) => c.job === 'Director' && c.id !== movieId && c.poster_path && c.vote_average > 5)
      .sort((a: any, b: any) => b.vote_average - a.vote_average)
      .slice(0, 8) as typeof directorOtherMovies
  }
  const trailer = movie.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube')

  // Tam ekip
  const crew = movie.credits?.crew ?? []
  const writers = crew.filter((c) => c.job === 'Screenplay' || c.job === 'Writer' || c.job === 'Story').slice(0, 3)
  const composers = crew.filter((c) => c.job === 'Original Music Composer' || c.job === 'Music').slice(0, 2)
  const dops = crew.filter((c) => c.job === 'Director of Photography' || c.job === 'Cinematography').slice(0, 2)
  const editors = crew.filter((c) => c.job === 'Editor').slice(0, 2)
  const producers = crew.filter((c) => c.job === 'Producer' || c.job === 'Executive Producer').slice(0, 3)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
  const imdbId = (movie as any).external_ids?.imdb_id as string | null | undefined

  // Yıl dönümü kontrolü (aynı ay/gün ise)
  const anniversary = (() => {
    if (!movie.release_date) return null
    const rd = new Date(movie.release_date)
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
    '@type': 'Movie',
    '@id': `${siteUrl}/film/${movieId}`,
    inLanguage: 'tr',
    url: `${siteUrl}/film/${movieId}`,
    name: title,
    ...((movie as any).original_title && (movie as any).original_title !== title && { alternateName: (movie as any).original_title }),
    ...(movie.release_date && { datePublished: movie.release_date }),
    description: movie.overview ?? '',
    ...(movie.poster_path && { image: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }),
    ...(movie.runtime && { duration: `PT${movie.runtime}M` }),
    ...(certification && { contentRating: certification }),
    ...((movie.vote_count ?? 0) > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(movie.vote_average?.toFixed(1)),
        ratingCount: movie.vote_count,
        bestRating: 10,
        worstRating: 1,
      }
    }),
    ...(director && {
      director: [{ '@type': 'Person', name: director.name, url: `${siteUrl}/oyuncu/${director.id}` }]
    }),
    ...(cast.length > 0 && {
      actor: cast.slice(0, 8).map((a: { id: number; name: string }) => ({
        '@type': 'Person',
        name: a.name,
        url: `${siteUrl}/oyuncu/${a.id}`,
      }))
    }),
    ...(movie.genres?.length && { genre: movie.genres.map((g: { id: number; name: string }) => g.name) }),
    ...((movie as any).production_companies?.length && {
      productionCompany: (movie as any).production_companies.slice(0, 3).map((c: { name: string }) => ({
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
    { name: 'Filmler', path: '/filmler' },
    { name: title, path: `/film/${movieId}` },
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
            {(movie as any).original_title && (movie as any).original_title !== title && (
              <p className="mt-1.5 text-base italic" style={{ color: 'var(--text-secondary)' }}>
                {(movie as any).original_title}
              </p>
            )}
            {movie.tagline && (
              <p className="mt-2 text-sm italic opacity-70" style={{ color: 'var(--text-secondary)' }}>
                "{movie.tagline}"
              </p>
            )}

            {/* Meta — sadece teknik bilgi, puan SinezonStats'ta */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {movie.release_date && (
                <span className="font-medium">{getMediaYear(movie)}</span>
              )}
              {movie.runtime && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{movie.runtime} {t('film.runtime')}</span>
                </>
              )}
              {certification && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ border: '1px solid var(--border-strong)' }}>
                    {certification}
                  </span>
                </>
              )}
            </div>

            {/* Sinezon Topluluk İstatistikleri — ana puan bloğu */}
            <SinezonStats
              sinezonRating={sinemaPuan}
              ratingCount={ratedReviews.length}
              reviewCount={reviews?.length ?? 0}
              watchedCount={watchedCount}
              wantCount={wantCount}
              tmdbRating={movie.vote_average}
              tmdbVoteCount={movie.vote_count ?? 0}
            />

            <CriticScores imdbId={imdbId} />

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres?.map((g) => {
                const slug = movieGenreToSlug(g.id)
                return slug ? (
                  <a key={g.id} href={`/tur/${slug}`} className="genre-chip text-[11px] font-medium px-3.5 py-1.5 rounded-full">
                    {g.name}
                  </a>
                ) : (
                  <span key={g.id} className="genre-chip text-[11px] font-medium px-3.5 py-1.5 rounded-full">{g.name}</span>
                )
              })}
            </div>

            {/* Puan Barı */}
            <div className="mt-5 max-w-lg">
              <RatingSlider
                mediaId={movieId}
                mediaType="film"
                siteAvg={sinemaPuan}
                siteVoteCount={ratedReviews.length}
                imdbAvg={movie.vote_average}
                imdbVoteCount={movie.vote_count ?? 0}
                userRating={userReview?.rating ?? null}
                isLoggedIn={!!user}
              />
            </div>

            {/* Watchlist + Listeye Ekle */}
            <div className="mt-4 flex flex-wrap gap-2">
              <WatchlistButton
                mediaId={movieId}
                mediaType="film"
                initialStatus={watchlistStatus}
                isLoggedIn={!!user}
              />
              {user?.id && (
                <AddToListButton mediaId={movieId} mediaType="film" userId={user.id} />
              )}
              <DiaryButton
                mediaId={movieId}
                mediaType="film"
                mediaTitle={title}
                isLoggedIn={!!user}
              />
              {user && (
                <CollectionButton
                  mediaId={movieId}
                  mediaType="film"
                  inCollection={inCollection}
                  initialFormat={collectionFormat}
                />
              )}
            </div>

            {/* Paylaş + Karşılaştır */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ShareButtons path={`/film/${movieId}`} title={`${title} — ${t('film.shareSuffix')}`} />
              <a
                href={`/karsilastir?a=${movieId}&ta=film`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:text-white hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}
              >
                <IconScale size={14} /> {t('film.compare')}
              </a>
              {user && (
                <FilmOnerButton
                  filmId={movieId}
                  filmType="film"
                  filmTitle={title}
                  filmPoster={getPosterUrl(movie.poster_path, 'w342') ?? ''}
                />
              )}
              {user && movie.release_date && new Date(movie.release_date) > new Date() && (
                <ReleaseReminderButton
                  mediaId={movieId}
                  mediaType="film"
                  title={title}
                  releaseDate={movie.release_date}
                  initialSet={hasReminder}
                />
              )}
            </div>

            {/* Overview */}
            {movie.overview && (
              <p className="mt-6 text-[15px] leading-[1.75] max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                {movie.overview}
              </p>
            )}

            {/* AI Film Özeti */}
            <AISummary
              mediaId={movieId}
              mediaType="film"
              title={title}
              year={getMediaYear(movie) ?? ''}
              genres={(movie.genres ?? []).map((g: any) => g.name).join(', ')}
              director={director?.name ?? ''}
            />

            {/* AI Sohbet Asistanı */}
            <AIChatWidget
              mediaId={movieId}
              mediaType="film"
              title={title}
              year={getMediaYear(movie) ?? ''}
              genres={(movie.genres ?? []).map((g: any) => g.name).join(', ')}
              director={director?.name}
              isLoggedIn={!!user}
            />

            {/* ── Bilgi Kartları ── */}
            <div className="mt-6 rounded-2xl overflow-hidden max-w-xl"
              style={{
                background: 'linear-gradient(160deg, rgba(20,28,47,0.95) 0%, rgba(14,20,32,0.98) 100%)',
                border: '1px solid rgba(212,168,67,0.12)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0"
                style={{ borderColor: 'rgba(212,168,67,0.08)' }}>
                {[
                  movie.release_date && {
                    label: t('film.labelReleaseDate'),
                    value: new Date(movie.release_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
                    link: null,
                  },
                  movie.runtime && {
                    label: t('film.labelRuntime'),
                    value: movie.runtime >= 60 ? t('film.durationFormat', { h: Math.floor(movie.runtime / 60), m: movie.runtime % 60 }) : `${movie.runtime} ${t('film.runtime')}`,
                    link: null,
                  },
                  (movie as any).spoken_languages?.[0] && {
                    label: t('film.labelLanguage'),
                    value: ((movie as any).spoken_languages as Array<{ english_name?: string; name: string }>)
                      .slice(0, 2).map(l => l.english_name || l.name).join(', '),
                    link: null,
                  },
                  (movie as any).production_countries?.[0] && {
                    label: t('film.labelCountry'),
                    value: ((movie as any).production_countries as Array<{ name: string }>)
                      .slice(0, 2).map(c => c.name).join(', '),
                    link: null,
                  },
                  director && {
                    label: t('film.director'),
                    value: director.name,
                    link: `/oyuncu/${director.id}`,
                  },
                  (movie as any).production_companies?.[0] && {
                    label: t('film.producer'),
                    value: ((movie as any).production_companies as Array<{ name: string }>)
                      .slice(0, 2).map(c => c.name).join(', '),
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

            <WatchProviders allProviders={watchProviders} mediaType="film" title={title} />
            <AffiliateLinks title={title} year={getMediaYear(movie)} />
            <WhoWatchedThis mediaId={movieId} mediaType="film" />

            {/* Konular */}
            <TopicTagger
              topics={topics ?? []}
              mediaId={movieId}
              mediaType="film"
              userVotedIds={userVotedTopicIds}
              voteCounts={voteCounts}
              isLoggedIn={!!user}
            />

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.4)' }}>{t('film.productionLabel')}</span>
                {movie.production_companies.slice(0, 4).map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && <span className="mx-1" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
                    <a href={`/sirket/${c.id}`} className="company-link text-[12px]">{c.name}</a>
                  </span>
                ))}
              </div>
            )}

            {/* Koleksiyon */}
            {movie.belongs_to_collection && (
              <div className="mt-3">
                <a href={`/koleksiyon/${movie.belongs_to_collection.id}`}
                  className="collection-chip inline-flex items-center gap-2 text-[12px] px-4 py-2 rounded-xl">
                  <IconFilm size={14} /> {movie.belongs_to_collection.name} →
                </a>
              </div>
            )}

            {/* Keywords */}
            <Keywords keywords={keywords} mediaType="film" />

            {/* Parents Guide / İçerik Uyarısı */}
            <ParentsGuide certification={certification} genres={movie.genres ?? []} runtime={movie.runtime} />

            {/* Çekim Ülkeleri */}
            {movie.production_countries && movie.production_countries.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-2.5">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(212,168,67,0.5)' }}>{t('film.filmingCountries')}</p>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,168,67,0.15) 0%, transparent 100%)' }} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(movie.production_countries as any[]).map((c, i) => (
                    <a key={c.iso_3166_1 ?? i}
                      href={c.iso_3166_1 ? `/ulke/${c.iso_3166_1.toLowerCase()}` : '#'}
                      className="country-chip text-[11px] px-3 py-1.5 rounded-lg"
                    >
                      {c.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
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
          {(writers.length > 0 || composers.length > 0 || dops.length > 0 || editors.length > 0 || producers.length > 0) && (
            <div className="mt-6 rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(212,168,67,0.08)', background: 'rgba(212,168,67,0.02)' }}>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(212,168,67,0.5)' }}>{t('film.crew')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: 'rgba(212,168,67,0.06)' }}>
                {[
                  writers.length > 0 && { label: t('film.writer'), people: writers },
                  composers.length > 0 && { label: t('film.composer'), people: composers },
                  dops.length > 0 && { label: t('film.cinematographer'), people: dops },
                  editors.length > 0 && { label: t('film.editor'), people: editors },
                  producers.length > 0 && { label: t('film.producer'), people: producers },
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

        {/* Box Office */}
        {((movie.budget ?? 0) > 0 || (movie.revenue ?? 0) > 0 || movie.external_ids?.imdb_id) && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #D4A84380 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">{t('film.boxOffice')}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(movie.budget ?? 0) > 0 && (
              <div className="relative overflow-hidden rounded-2xl p-5 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('film.budget')}</p>
                <p className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.7)' }}>${((movie.budget ?? 0) / 1_000_000).toFixed(1)}M</p>
              </div>
            )}
            {(movie.revenue ?? 0) > 0 && (
              <div className="relative overflow-hidden rounded-2xl p-5 text-center"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(74,222,128,0.5)' }}>{t('film.revenue')}</p>
                <p className="text-xl font-black" style={{ color: '#4ade80' }}>${((movie.revenue ?? 0) / 1_000_000).toFixed(1)}M</p>
              </div>
            )}
            {(movie.budget ?? 0) > 0 && (movie.revenue ?? 0) > 0 && (() => {
              const profit = (movie.revenue ?? 0) - (movie.budget ?? 0)
              const isPos = profit >= 0
              return (
                <div className="relative overflow-hidden rounded-2xl p-5 text-center"
                  style={{
                    background: isPos ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${isPos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('film.profitLoss')}</p>
                  <p className="text-xl font-black" style={{ color: isPos ? '#4ade80' : '#f87171' }}>
                    {isPos ? '+' : '-'}${Math.abs(profit / 1_000_000).toFixed(1)}M
                  </p>
                </div>
              )
            })()}
            {movie.external_ids?.imdb_id && (
              <a href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`} target="_blank" rel="noopener noreferrer"
                className="relative overflow-hidden rounded-2xl p-5 text-center transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(212,168,67,0.5)' }}>IMDb</p>
                <p className="text-xl font-black" style={{ color: '#D4A843' }}>{t('film.goToPage')} →</p>
              </a>
            )}
            </div>
          </div>
        )}

        {/* Puan Dağılımı */}
        <div id="puan-dagilimi">
          <RatingDistribution reviews={reviews ?? []} />
          <DemoRatings mediaId={movieId} mediaType="film" />
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
                    {fr.avatar_url
                      ? <img src={fr.avatar_url} alt={fr.username} className="w-full h-full object-cover" />
                      : fr.username[0]?.toUpperCase()
                    }
                  </div>
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{fr.username}</span>
                  <span className="text-[13px] font-bold inline-flex items-center gap-1" style={{ color: '#D4A843' }}><IconStarFilled size={12} /> {fr.rating}</span>
                </a>
              ))}
            </div>
            {friendsRatings.length > 1 && (
              <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('film.average')} <span className="font-bold" style={{ color: '#D4A843' }}>
                  {(friendsRatings.reduce((s, r) => s + r.rating, 0) / friendsRatings.length).toFixed(1)}/10
                </span>
              </p>
            )}
          </div>
        )}

        {/* Fotoğraf Galerisi */}
        <div className="mt-10" id="galeri">
          <BackdropGallery backdrops={backdrops} posters={posters} title={title} />
        </div>

        {/* Alıntılar */}
        <QuotesSection mediaId={movieId} mediaType="film" isLoggedIn={!!user} title={title} />

        {/* Soundtrack */}
        <SoundtrackSection mediaId={movieId} mediaType="film" isLoggedIn={!!user} />

        {/* Film Alıntıları */}
        {(movieQuotes ?? []).length > 0 && (
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
              {(movieQuotes ?? []).map((q: any) => (
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

        {/* Trivia & Goofs */}
        <div id="trivia">
          <TriviaSection
            items={(triviaItems ?? []) as any}
            mediaId={movieId}
            mediaType="film"
            isLoggedIn={!!user}
          />
        </div>

        {/* Bu izleyenler şunu da izledi */}
        <AlsoWatched mediaId={movieId} mediaType="film" />

        {/* Reviews */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8" id="yorumlar">
          {/* Write review */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #E11D48 0%, #E11D4880 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">
                {userReview ? t('review.editTitle') : t('review.write')}
              </h2>
            </div>
            {user && (
              <div className="mb-5">
                <PrivateNoteWidget mediaId={movieId} mediaType="film" initialNote={privateNote} />
              </div>
            )}
            {user ? (
              <ReviewForm
                mediaId={movieId}
                mediaType="film"
                existingReview={userReview}
              />
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

          {/* Review list */}
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
            <ReviewList reviews={sortedReviews} currentUserId={user?.id} likeData={likeData} replyCount={replyCount} helpfulData={helpfulData} />
          </div>
        </div>

        {/* Bunu İzleyenler */}
        <SimilarWatchers mediaId={movieId} mediaType="film" />

        {/* Yönetmenin Diğer Filmleri */}
        {directorOtherMovies.length > 0 && director && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">
                {director.name} — {t('film.otherMoviesBy')}
              </h2>
              <a href={`/kisi/${director.id}`} className="ml-auto text-xs hover:underline" style={{ color: 'var(--accent)' }}>
                {t('film.fullFilmography')} →
              </a>
            </div>
            <div className="home-carousel-scroll flex gap-3 overflow-x-auto pb-3">
              {directorOtherMovies.map((film) => (
                <a key={film.id} href={`/film/${film.id}`} className="group shrink-0 w-[120px]" style={{ scrollSnapAlign: 'start' }}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {getPosterUrl(film.poster_path, 'w342') && (
                      <img src={getPosterUrl(film.poster_path, 'w342')!} alt={film.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5"
                      style={{ background: 'rgba(0,0,0,0.75)', color: '#D4A843', backdropFilter: 'blur(4px)' }}>
                      <IconStarFilled size={10} /> {film.vote_average.toFixed(1)}
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs font-medium line-clamp-2 group-hover:text-white transition-colors"
                    style={{ color: 'rgba(255,255,255,0.6)' }}>{film.title}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{film.release_date?.slice(0,4)}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Benzer Filmler */}
        {similar.length > 0 && (
          <div className="mt-12" id="benzer">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">{t('film.similar')}</h2>
            </div>
            <div className="home-carousel-scroll flex gap-3 overflow-x-auto pb-3">
              {similar.map((item) => (
                <a key={item.id} href={`/film/${item.id}`} className="group shrink-0 w-[128px]" style={{ scrollSnapAlign: 'start' }}>
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

        {/* Bu Filmi İçeren Listeler */}
        {(containingLists ?? []).length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
              <h2 className="text-xl font-bold text-white tracking-tight">{t('film.containingLists')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(containingLists ?? []).map((l: any) => (
                <a key={l.id} href={`/liste/${l.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xs"><IconClipboard size={14} /></span>
                  <span className="text-white font-medium">{l.title}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    @{(l.profiles as any)?.username}
                  </span>
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
      mediaId={movieId}
      mediaType="film"
      title={title}
      posterPath={movie.poster_path}
      isLoggedIn={!!user}
      currentRating={userReview?.rating ?? null}
    />
    </>
  )
}
