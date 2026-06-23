import { notFound } from 'next/navigation'
import SinezonStats from '@/components/SinezonStats'
import { getMovieDetail, getSimilarMovies, getBackdropUrl, getPosterUrl, getMediaTitle, getMediaYear, getMovieWatchProviders, getMovieImages, getMovieKeywords, getMovieCertification, getMovieVideos } from '@/lib/tmdb'
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
import CriticScores from '@/components/CriticScores'
import AISummary from '@/components/AISummary'
import type { Review } from '@/lib/types'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const movie = await getMovieDetail(Number(id))
    const title = getMediaTitle(movie)
    const year = movie.release_date?.split('-')[0] ?? ''
    const genreNames = (movie.genres ?? []).slice(0, 2).map((g: { name: string }) => g.name).join(', ')
    const description = movie.overview
      ? movie.overview.slice(0, 155)
      : `${title}${year ? ` (${year})` : ''}${genreNames ? ' — ' + genreNames : ''} · Sinezon'da puan ver ve yorum yap.`
    const ogImage = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : undefined
    return {
      title,
      description,
      alternates: { canonical: `/film/${id}` },
      openGraph: {
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: ogImage ? [{ url: ogImage, width: 1280, height: 720, alt: title }] : [],
        type: 'video.movie',
        url: `/film/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch {
    return { title: 'Film bulunamadı' }
  }
}

export default async function FilmPage({ params }: Props) {
  const { id } = await params
  const movieId = Number(id)

  const [movie, similarData, imagesData, keywordsData, certification, videosData, watchProviders] = await Promise.all([
    getMovieDetail(movieId).catch(() => null),
    getSimilarMovies(movieId).catch(() => ({ results: [] })),
    getMovieImages(movieId).catch(() => ({ backdrops: [], posters: [] })),
    getMovieKeywords(movieId),
    getMovieCertification(movieId),
    getMovieVideos(movieId),
    getMovieWatchProviders(movieId).catch(() => null),
  ])
  if (!movie) notFound()
  const backdrops = imagesData.backdrops.slice(0, 18)
  const keywords  = keywordsData.keywords ?? []
  const videos    = videosData.results.filter(v => v.site === 'YouTube')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Benzer filmler: önce lokal katalogdan genre eşleşmesi dene
  let similar = similarData.results.slice(0, 12)
  const movieGenreIds = (movie.genres ?? []).map((g: { id: number }) => g.id)
  if (movieGenreIds.length > 0) {
    const { data: localSimilar } = await supabase
      .from('movies')
      .select('tmdb_id, title, poster_path, vote_average, release_year, genre_ids')
      .contains('genre_ids', [movieGenreIds[0]])
      .neq('tmdb_id', movieId)
      .gte('vote_count', 100)
      .order('popularity', { ascending: false })
      .limit(12)
    if ((localSimilar ?? []).length >= 6) {
      similar = (localSimilar ?? []).map((m: any) => ({
        id: m.tmdb_id, title: m.title, poster_path: m.poster_path,
        vote_average: m.vote_average, release_date: m.release_year ? `${m.release_year}-01-01` : '',
        genre_ids: m.genre_ids ?? [], overview: '', popularity: 0, backdrop_path: null, vote_count: 0,
      }))
    }
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(username, avatar_url)')
    .eq('media_id', movieId)
    .eq('media_type', 'film')
    .order('created_at', { ascending: false })

  const userReview = reviews?.find((r: Review) => r.user_id === user?.id)

  // SineMa platform puanı
  const ratedReviews = (reviews ?? []).filter(r => r.rating > 0)
  const sinemaPuan = ratedReviews.length > 0
    ? ratedReviews.reduce((s: number, r: Review) => s + r.rating, 0) / ratedReviews.length
    : null

  // Watchlist topluluk istatistikleri (kullanıcıya özel değil, genel sayım)
  const { data: watchlistEntries } = await supabase
    .from('watchlist')
    .select('status')
    .eq('media_id', movieId)
    .eq('media_type', 'film')
  const watchedCount = (watchlistEntries ?? []).filter(w => w.status === 'izledim').length
  const wantCount    = (watchlistEntries ?? []).filter(w => w.status === 'izlemek-istiyorum').length

  const reviewIds = (reviews ?? []).map(r => r.id)
  let likeData: Record<string, { count: number; liked: boolean }> = {}
  let replyCount: Record<string, number> = {}
  let helpfulData: Record<string, { count: number; marked: boolean }> = {}
  if (reviewIds.length > 0) {
    const [{ data: likes }, { data: repliesRaw }, { data: helpfulRows }] = await Promise.all([
      supabase.from('review_likes').select('review_id, user_id').in('review_id', reviewIds),
      supabase.from('review_replies').select('review_id').in('review_id', reviewIds),
      supabase.from('review_helpful').select('review_id, user_id').in('review_id', reviewIds),
    ])

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

  let watchlistStatus: 'izlemek-istiyorum' | 'izledim' | null = null
  let friendsRatings: { username: string; avatar_url: string | null; rating: number }[] = []
  let privateNote = ''
  let inCollection = false
  let collectionFormat = 'dijital'

  if (user) {
    const [{ data: wl }, { data: follows }, { data: noteRow }, { data: colRow }] = await Promise.all([
      supabase.from('watchlist').select('status').eq('user_id', user.id).eq('media_id', movieId).eq('media_type', 'film').maybeSingle(),
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('private_notes').select('note').eq('user_id', user.id).eq('media_id', movieId).eq('media_type', 'film').maybeSingle(),
      supabase.from('collection').select('format').eq('user_id', user.id).eq('media_id', movieId).eq('media_type', 'film').maybeSingle(),
    ])
    watchlistStatus = (wl?.status as typeof watchlistStatus) ?? null
    privateNote = noteRow?.note ?? ''
    inCollection = !!colRow
    collectionFormat = colRow?.format ?? 'dijital'

    if (follows && follows.length > 0) {
      const followingIds = follows.map(f => f.following_id)
      const { data: friendReviews } = await supabase
        .from('reviews')
        .select('rating, profiles(username, avatar_url)')
        .eq('media_id', movieId)
        .eq('media_type', 'film')
        .in('user_id', followingIds)
      friendsRatings = (friendReviews ?? []).map(r => ({
        username: (r.profiles as unknown as { username: string; avatar_url: string | null })?.username ?? '',
        avatar_url: (r.profiles as unknown as { username: string; avatar_url: string | null })?.avatar_url ?? null,
        rating: r.rating,
      }))
    }
  }

  // Trivia & Goofs
  const { data: triviaItems } = await supabase
    .from('trivia')
    .select('id, content, type, created_at, profiles(username)')
    .eq('media_id', movieId).eq('media_type', 'film').eq('approved', true)
    .order('created_at', { ascending: true })

  // Bu filmin yer aldığı editöryal listeler (ödüller için)
  const { data: editorialMemberships } = await supabase
    .from('list_items')
    .select('list_id')
    .eq('media_id', movieId)
    .eq('media_type', 'film')
  const editorialListIds = (editorialMemberships ?? []).map((m: any) => m.list_id)

  // Konular
  const { data: topics } = await supabase.from('topics').select('id, name, slug, emoji').order('id')
  const { data: allVotes } = await supabase
    .from('topic_votes')
    .select('topic_id, user_id')
    .eq('media_id', movieId)
    .eq('media_type', 'film')
  const voteCounts: Record<number, number> = {}
  for (const v of allVotes ?? []) voteCounts[v.topic_id] = (voteCounts[v.topic_id] ?? 0) + 1
  const userVotedTopicIds = user ? (allVotes ?? []).filter(v => v.user_id === user.id).map(v => v.topic_id) : []
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const backdrop = getBackdropUrl(movie.backdrop_path)
  const poster = getPosterUrl(movie.poster_path, 'w500')
  const title = getMediaTitle(movie)
  const director = movie.credits?.crew?.find((c) => c.job === 'Director')
  const cast = movie.credits?.cast?.slice(0, 12) ?? []
  const trailer = movie.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
  const imdbId = (movie as any).external_ids?.imdb_id as string | null | undefined

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
        name: `${title} — Fragman`,
        embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
        thumbnailUrl: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
      }
    }),
    ...(imdbId && { sameAs: `https://www.imdb.com/title/${imdbId}/` }),
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                  Afiş yok
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
                  <span>{movie.runtime} dk</span>
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
                  <a key={g.id} href={`/tur/${slug}`} className="px-3 py-1 rounded-full bg-[--bg-card] border border-[--border] text-xs text-[--text-secondary] hover:border-[--accent]/60 hover:text-white transition-colors">
                    {g.name}
                  </a>
                ) : (
                  <span key={g.id} className="px-3 py-1 rounded-full bg-[--bg-card] border border-[--border] text-xs text-[--text-secondary]">
                    {g.name}
                  </span>
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
              <ShareButtons path={`/film/${movieId}`} title={`${title} — SineMa'da izle`} />
              <a
                href={`/karsilastir?a=${movieId}&ta=film`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[--bg-secondary] border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/20 transition-colors"
              >
                ⚖️ Karşılaştır
              </a>
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

            {/* ── Bilgi Kartları ── */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 rounded-2xl p-5 max-w-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {movie.release_date && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Yayın Tarihi</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Date(movie.release_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
              {movie.runtime && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Süre</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {movie.runtime >= 60 ? `${Math.floor(movie.runtime / 60)}s ${movie.runtime % 60}dk` : `${movie.runtime} dk`}
                  </p>
                </div>
              )}
              {(movie as any).spoken_languages?.[0] && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Orijinal Dil</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {((movie as any).spoken_languages as Array<{ english_name?: string; name: string }>)
                      .slice(0, 2).map((l) => l.english_name || l.name).join(', ')}
                  </p>
                </div>
              )}
              {(movie as any).production_countries?.[0] && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Ülke</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {((movie as any).production_countries as Array<{ name: string }>)
                      .slice(0, 2).map((c) => c.name).join(', ')}
                  </p>
                </div>
              )}
              {director && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Yönetmen</p>
                  <a href={`/oyuncu/${director.id}`} className="text-[13px] font-medium hover:text-[--accent] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {director.name}
                  </a>
                </div>
              )}
              {(movie as any).production_companies?.[0] && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Yapımcı</p>
                  <p className="text-[13px] font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {((movie as any).production_companies as Array<{ name: string }>)
                      .slice(0, 2).map((c) => c.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            <WatchProviders allProviders={watchProviders} mediaType="film" />
            <AffiliateLinks title={title} year={getMediaYear(movie)} />

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
              <div className="mt-3">
                <span className="text-sm text-[--text-secondary]">Yapım: </span>
                <span className="text-sm">
                  {movie.production_companies.slice(0, 4).map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && ', '}
                      <a href={`/sirket/${c.id}`} className="text-white hover:text-[--accent] transition-colors">{c.name}</a>
                    </span>
                  ))}
                </span>
              </div>
            )}

            {/* Koleksiyon */}
            {movie.belongs_to_collection && (
              <div className="mt-3">
                <a href={`/koleksiyon/${movie.belongs_to_collection.id}`}
                  className="inline-flex items-center gap-2 text-sm text-[--accent] hover:underline">
                  🎬 {movie.belongs_to_collection.name} →
                </a>
              </div>
            )}

            {/* Keywords */}
            <Keywords keywords={keywords} mediaType="film" />

            {/* Parents Guide / İçerik Uyarısı */}
            <ParentsGuide certification={certification} genres={movie.genres ?? []} runtime={movie.runtime} />

            {/* Filming Locations / Çekim Yerleri */}
            {movie.production_countries && movie.production_countries.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider mb-2">Çekim Ülkeleri</h3>
                <div className="flex flex-wrap gap-2">
                  {(movie.production_countries as any[]).map((c, i) => (
                    <a key={c.iso_3166_1 ?? i} href={c.iso_3166_1 ? `/ulke/${c.iso_3166_1.toLowerCase()}` : '#'}
                      className="px-2.5 py-1 rounded-lg bg-[--bg-card] border border-[--border] text-xs text-[--text-secondary] hover:text-white hover:border-[--accent]/40 transition-colors">
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
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
              Fragman
            </h2>
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%', background: 'var(--bg-card)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?modestbranding=1&rel=0`}
                title={`${title} — Fragman`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Sayfa içi navigasyon */}
        <PageNav sections={[
          { id: 'oyuncular', label: '🎭 Oyuncular' },
          { id: 'odüller', label: '🏆 Ödüller' },
          { id: 'puan-dagilimi', label: '📊 Puanlar' },
          ...(videos.length > 0 ? [{ id: 'videolar', label: '🎬 Videolar' }] : []),
          { id: 'galeri', label: '🖼 Galeri' },
          { id: 'trivia', label: '💡 Trivia' },
          { id: 'yorumlar', label: '💬 Yorumlar' },
          { id: 'benzer', label: '🎞 Benzer' },
        ]} />

        {/* Cast & Crew */}
        <div id="oyuncular">
          <CastRow cast={cast} director={director} />
        </div>

        {/* Ödüller */}
        <div id="odüller">
          <AwardsSection editorialListIds={editorialListIds} />
        </div>

        {/* Box Office */}
        {((movie.budget ?? 0) > 0 || (movie.revenue ?? 0) > 0 || movie.external_ids?.imdb_id) && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-white mb-4" style={{ borderLeft: '3px solid var(--gold)', paddingLeft: '10px' }}>Gişe & İstatistikler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(movie.budget ?? 0) > 0 && (
              <div className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center">
                <p className="text-xs text-[--text-secondary] mb-1">Bütçe</p>
                <p className="text-base font-bold text-white">${((movie.budget ?? 0) / 1_000_000).toFixed(1)}M</p>
              </div>
            )}
            {(movie.revenue ?? 0) > 0 && (
              <div className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center">
                <p className="text-xs text-[--text-secondary] mb-1">Gişe</p>
                <p className="text-base font-bold text-green-400">${((movie.revenue ?? 0) / 1_000_000).toFixed(1)}M</p>
              </div>
            )}
            {(movie.budget ?? 0) > 0 && (movie.revenue ?? 0) > 0 && (
              <div className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center">
                <p className="text-xs text-[--text-secondary] mb-1">Kâr/Zarar</p>
                <p className={`text-base font-bold ${(movie.revenue ?? 0) >= (movie.budget ?? 0) ? 'text-green-400' : 'text-red-400'}`}>
                  {(movie.revenue ?? 0) >= (movie.budget ?? 0) ? '+' : '-'}${Math.abs(((movie.revenue ?? 0) - (movie.budget ?? 0)) / 1_000_000).toFixed(1)}M
                </p>
              </div>
            )}
            {movie.external_ids?.imdb_id && (
              <a href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`} target="_blank" rel="noopener noreferrer"
                className="rounded-xl bg-[--gold]/10 border border-[--gold]/30 p-4 text-center hover:bg-[--gold]/20 transition-colors">
                <p className="text-xs text-[--gold] mb-1">IMDb</p>
                <p className="text-base font-bold text-[--gold]">Sayfaya Git →</p>
              </a>
            )}
            </div>
          </div>
        )}

        {/* Puan Dağılımı */}
        <RatingDistribution reviews={reviews ?? []} />

        {/* Demografiye Göre Puan */}
        <DemoRatings mediaId={movieId} mediaType="film" />

        {/* Video Galerisi */}
        <div id="videolar">
          <VideoGallery videos={videos} title={title} />
        </div>

        {/* Arkadaşların Puanları */}
        {friendsRatings.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-white mb-3">👥 Takip Ettiklerinin Puanları</h2>
            <div className="flex flex-wrap gap-3">
              {friendsRatings.map(fr => (
                <a key={fr.username} href={`/profil/${fr.username}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/50 transition-colors">
                  <div className="h-7 w-7 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                    {fr.avatar_url
                      ? <img src={fr.avatar_url} alt={fr.username} className="w-full h-full object-cover" />
                      : fr.username[0]?.toUpperCase()
                    }
                  </div>
                  <span className="text-sm text-[--text-secondary]">{fr.username}</span>
                  <span className="text-sm font-bold text-[--gold]">★ {fr.rating}/10</span>
                </a>
              ))}
            </div>
            {friendsRatings.length > 1 && (
              <p className="text-xs text-[--text-secondary] mt-2">
                Takip ettiklerin ortalaması: <span className="font-bold text-white">
                  {(friendsRatings.reduce((s, r) => s + r.rating, 0) / friendsRatings.length).toFixed(1)}/10
                </span>
              </p>
            )}
          </div>
        )}

        {/* Fotoğraf Galerisi */}
        {backdrops.length > 0 && (
          <div className="mt-10" id="galeri">
            <BackdropGallery backdrops={backdrops} title={title} />
          </div>
        )}

        {/* Alıntılar */}
        <QuotesSection mediaId={movieId} mediaType="film" isLoggedIn={!!user} title={title} />

        {/* Soundtrack */}
        <SoundtrackSection mediaId={movieId} mediaType="film" isLoggedIn={!!user} />

        {/* Trivia & Goofs */}
        <TriviaSection
          items={(triviaItems ?? []) as any}
          mediaId={movieId}
          mediaType="film"
          isLoggedIn={!!user}
        />

        {/* Reviews */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8" id="yorumlar">
          {/* Write review */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-5">
              {userReview ? 'Yorumunu Düzenle' : 'Yorum Yaz'}
            </h2>
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
              <div className="rounded-lg bg-[--bg-card] border border-[--border] p-6 text-center">
                <p className="text-[--text-secondary] text-sm mb-4">
                  Yorum yapmak için giriş yapman gerekiyor.
                </p>
                <a
                  href="/auth/giris"
                  className="inline-block bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors"
                >
                  Giriş Yap
                </a>
              </div>
            )}
          </div>

          {/* Review list */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-5">
              Yorumlar <span className="text-[--text-secondary] font-normal text-base">({reviews?.length ?? 0})</span>
            </h2>
            <ReviewList reviews={reviews ?? []} currentUserId={user?.id} likeData={likeData} replyCount={replyCount} helpfulData={helpfulData} />
          </div>
        </div>

        {/* Bunu İzleyenler */}
        <SimilarWatchers mediaId={movieId} mediaType="film" />

        {/* Benzer Filmler */}
        {similar.length > 0 && (
          <div className="mt-12" id="benzer">
            <h2 className="text-xl font-bold text-white mb-5" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>Benzer Filmler</h2>
            <div className="home-carousel-scroll flex gap-3 overflow-x-auto pb-3">
              {similar.map((item) => (
                <a key={item.id} href={`/film/${item.id}`} className="group shrink-0 w-[128px]" style={{ scrollSnapAlign: 'start' }}>
                  <div
                    className="aspect-[2/3] rounded-xl overflow-hidden transition-all duration-200 group-hover:-translate-y-1.5 movie-card-grid"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    {getPosterUrl(item.poster_path, 'w342') ? (
                      <img
                        src={getPosterUrl(item.poster_path, 'w342')!}
                        alt={getMediaTitle(item)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center">
                        {getMediaTitle(item)}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] leading-tight text-[--text-secondary] line-clamp-2 group-hover:text-white transition-colors">
                    {getMediaTitle(item)}
                  </p>
                  {getMediaYear(item) && (
                    <p className="text-[11px] mt-0.5 text-[--text-secondary]/50">{getMediaYear(item)}</p>
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
