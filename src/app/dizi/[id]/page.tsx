import { notFound } from 'next/navigation'
import SinezonStats from '@/components/SinezonStats'
import { getSeriesDetail, getSimilarSeries, getBackdropUrl, getPosterUrl, getMediaTitle, getMediaYear, getTVWatchProviders, getSeriesImages, getSeriesKeywords, getSeriesCertification, getTVVideos } from '@/lib/tmdb'
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
import type { Review } from '@/lib/types'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const series = await getSeriesDetail(Number(id))
    const title = getMediaTitle(series)
    const year = series.first_air_date?.split('-')[0] ?? ''
    const genreNames = (series.genres ?? []).slice(0, 2).map((g: { name: string }) => g.name).join(', ')
    const description = series.overview
      ? series.overview.slice(0, 155)
      : `${title}${year ? ` (${year})` : ''}${genreNames ? ' — ' + genreNames : ''} · Sinezon'da puan ver ve yorum yap.`
    const ogImage = series.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${series.backdrop_path}`
      : series.poster_path
        ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
        : undefined
    return {
      title,
      description,
      alternates: { canonical: `/dizi/${id}` },
      openGraph: {
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: ogImage ? [{ url: ogImage, width: 1280, height: 720, alt: title }] : [],
        type: 'video.tv_show',
        url: `/dizi/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title}${year ? ` (${year})` : ''} | Sinezon`,
        description,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch {
    return { title: 'Dizi bulunamadı' }
  }
}

export default async function DiziPage({ params }: Props) {
  const { id } = await params
  const seriesId = Number(id)

  const [series, similarData, imagesData, keywordsData, certification, videosData, watchProviders] = await Promise.all([
    getSeriesDetail(seriesId).catch(() => null),
    getSimilarSeries(seriesId).catch(() => ({ results: [] })),
    getSeriesImages(seriesId).catch(() => ({ backdrops: [], posters: [] })),
    getSeriesKeywords(seriesId),
    getSeriesCertification(seriesId),
    getTVVideos(seriesId),
    getTVWatchProviders(seriesId).catch(() => null),
  ])
  if (!series) notFound()
  const backdrops = imagesData.backdrops.slice(0, 18)
  const posters   = [...imagesData.posters]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 10)
  const keywords  = keywordsData.results ?? []
  const videos    = videosData.results.filter(v => v.site === 'YouTube')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Benzer diziler: lokal katalogdan genre eşleşmesi
  let similar = similarData.results.slice(0, 12)
  const seriesGenreIds = (series.genres ?? []).map((g: { id: number }) => g.id)
  if (seriesGenreIds.length > 0) {
    const { data: localSimilar } = await supabase
      .from('series')
      .select('tmdb_id, name, poster_path, vote_average, first_air_year, genre_ids')
      .contains('genre_ids', [seriesGenreIds[0]])
      .neq('tmdb_id', seriesId)
      .gte('vote_count', 50)
      .order('popularity', { ascending: false })
      .limit(12)
    if ((localSimilar ?? []).length >= 6) {
      similar = (localSimilar ?? []).map((s: any) => ({
        id: s.tmdb_id, name: s.name, title: s.name, poster_path: s.poster_path,
        vote_average: s.vote_average, first_air_date: s.first_air_year ? `${s.first_air_year}-01-01` : '',
        genre_ids: s.genre_ids ?? [], overview: '', popularity: 0, backdrop_path: null, vote_count: 0, media_type: 'tv',
      }))
    }
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(username, avatar_url)')
    .eq('media_id', seriesId)
    .eq('media_type', 'dizi')
    .order('created_at', { ascending: false })

  const userReview = reviews?.find((r: Review) => r.user_id === user?.id)

  const ratedReviews = (reviews ?? []).filter(r => r.rating > 0)
  const sinemaPuan = ratedReviews.length > 0
    ? ratedReviews.reduce((s: number, r: Review) => s + r.rating, 0) / ratedReviews.length
    : null

  // Watchlist topluluk istatistikleri
  const { data: watchlistEntries } = await supabase
    .from('watchlist')
    .select('status')
    .eq('media_id', seriesId)
    .eq('media_type', 'dizi')
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
      supabase.from('watchlist').select('status').eq('user_id', user.id).eq('media_id', seriesId).eq('media_type', 'dizi').maybeSingle(),
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('private_notes').select('note').eq('user_id', user.id).eq('media_id', seriesId).eq('media_type', 'dizi').maybeSingle(),
      supabase.from('collection').select('format').eq('user_id', user.id).eq('media_id', seriesId).eq('media_type', 'dizi').maybeSingle(),
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
        .eq('media_id', seriesId)
        .eq('media_type', 'dizi')
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
    .eq('media_id', seriesId).eq('media_type', 'dizi').eq('approved', true)
    .order('created_at', { ascending: true })

  // Editöryal liste üyeliği (ödüller)
  const { data: editorialMemberships } = await supabase
    .from('list_items').select('list_id')
    .eq('media_id', seriesId).eq('media_type', 'dizi')
  const editorialListIds = (editorialMemberships ?? []).map((m: any) => m.list_id)

  // Konular
  const { data: topics } = await supabase.from('topics').select('id, name, slug, emoji').order('id')
  const { data: allVotes } = await supabase
    .from('topic_votes')
    .select('topic_id, user_id')
    .eq('media_id', seriesId)
    .eq('media_type', 'dizi')
  const voteCounts: Record<number, number> = {}
  for (const v of allVotes ?? []) voteCounts[v.topic_id] = (voteCounts[v.topic_id] ?? 0) + 1
  const userVotedTopicIds = user ? (allVotes ?? []).filter(v => v.user_id === user.id).map(v => v.topic_id) : []

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const backdrop = getBackdropUrl(series.backdrop_path)
  const poster = getPosterUrl(series.poster_path, 'w500')
  const title = getMediaTitle(series)
  const cast = series.credits?.cast?.slice(0, 12) ?? []
  const director = series.credits?.crew?.find((c) => c.job === 'Director' || c.job === 'Series Director' || c.job === 'Creator')
  const trailer = series.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'
  const imdbId = (series as any).external_ids?.imdb_id as string | null | undefined

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
                  <span>{series.number_of_seasons} sezon</span>
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

            <div className="flex flex-wrap gap-2 mt-4">
              {series.genres?.map((g) => {
                const slug = tvGenreToSlug(g.id)
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

            {/* Yayın Ağı */}
            {(series as { networks?: { id: number; name: string; logo_path: string | null }[] }).networks?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {(series as { networks?: { id: number; name: string; logo_path: string | null }[] }).networks!.map(n => (
                  <div key={n.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[--bg-card] border border-[--border]">
                    {n.logo_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w45${n.logo_path}`}
                        alt={n.name}
                        className="h-4 object-contain"
                      />
                    )}
                    <span className="text-xs text-[--text-secondary]">{n.name}</span>
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
              <ShareButtons path={`/dizi/${seriesId}`} title={`${title} — SineMa'da izle`} />
              <a
                href={`/karsilastir?a=${seriesId}&ta=dizi`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[--bg-secondary] border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/20 transition-colors"
              >
                ⚖️ Karşılaştır
              </a>
            </div>

            {series.overview && (
              <p className="mt-6 text-[15px] leading-[1.75] max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                {series.overview}
              </p>
            )}

            {/* ── Bilgi Kartları ── */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 rounded-2xl p-5 max-w-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {series.first_air_date && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>İlk Yayın</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Date(series.first_air_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
              {series.number_of_seasons && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Sezon / Bölüm</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {series.number_of_seasons} sezon{series.number_of_episodes ? ` · ${series.number_of_episodes} bölüm` : ''}
                  </p>
                </div>
              )}
              {(series as any).spoken_languages?.[0] && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Orijinal Dil</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {((series as any).spoken_languages as Array<{ english_name?: string; name: string }>)
                      .slice(0, 2).map((l) => l.english_name || l.name).join(', ')}
                  </p>
                </div>
              )}
              {(series as any).production_countries?.[0] && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Ülke</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {((series as any).production_countries as Array<{ name: string }>)
                      .slice(0, 2).map((c) => c.name).join(', ')}
                  </p>
                </div>
              )}
              {director && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>
                    {director.job === 'Creator' ? 'Yaratıcı' : 'Yönetmen'}
                  </p>
                  <a href={`/oyuncu/${director.id}`} className="text-[13px] font-medium hover:text-[--accent] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {director.name}
                  </a>
                </div>
              )}
              {(series as any).networks?.[0] && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Yayın Ağı</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {(series as any).networks[0].name}
                  </p>
                </div>
              )}
            </div>

            <WatchProviders allProviders={watchProviders} mediaType="dizi" />
            <AffiliateLinks title={title} year={getMediaYear(series)} />

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
          { id: 'benzer', label: '📺 Benzer' },
        ]} />

        {/* Cast & Crew */}
        <div id="oyuncular">
          <CastRow cast={cast} director={director} />
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
                    {fr.avatar_url ? <img src={fr.avatar_url} alt={fr.username} className="w-full h-full object-cover" /> : fr.username[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-[--text-secondary]">{fr.username}</span>
                  <span className="text-sm font-bold text-[--gold]">★ {fr.rating}/10</span>
                </a>
              ))}
            </div>
            {friendsRatings.length > 1 && (
              <p className="text-xs text-[--text-secondary] mt-2">
                Takip ettiklerin ortalaması: <span className="font-bold text-white">{(friendsRatings.reduce((s, r) => s + r.rating, 0) / friendsRatings.length).toFixed(1)}/10</span>
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
        {backdrops.length > 0 && (
          <div className="mt-10" id="galeri">
            <BackdropGallery backdrops={backdrops} posters={posters} title={series ? getMediaTitle(series) : ''} />
          </div>
        )}

        {/* Alıntılar */}
        <QuotesSection mediaId={seriesId} mediaType="dizi" isLoggedIn={!!user} title={title} />

        {/* Soundtrack */}
        <SoundtrackSection mediaId={seriesId} mediaType="dizi" isLoggedIn={!!user} />

        {/* Trivia & Goofs */}
        <div id="trivia">
          <TriviaSection
            items={(triviaItems ?? []) as any}
            mediaId={seriesId}
            mediaType="dizi"
            isLoggedIn={!!user}
          />
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8" id="yorumlar">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-5">
              {userReview ? 'Yorumunu Düzenle' : 'Yorum Yaz'}
            </h2>
            {user && (
              <div className="mb-5">
                <PrivateNoteWidget mediaId={seriesId} mediaType="dizi" initialNote={privateNote} />
              </div>
            )}
            {user ? (
              <ReviewForm mediaId={seriesId} mediaType="dizi" existingReview={userReview} />
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

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-5">
              Yorumlar <span className="text-[--text-secondary] font-normal text-base">({reviews?.length ?? 0})</span>
            </h2>
            <ReviewList reviews={reviews ?? []} currentUserId={user?.id} likeData={likeData} replyCount={replyCount} helpfulData={helpfulData} />
          </div>
        </div>

        {/* Bunu İzleyenler */}
        <SimilarWatchers mediaId={seriesId} mediaType="dizi" />

        {/* Benzer Diziler */}
        {similar.length > 0 && (
          <div className="mt-12" id="benzer">
            <h2 className="text-xl font-bold text-white mb-5" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>Benzer Diziler</h2>
            <div className="home-carousel-scroll flex gap-3 overflow-x-auto pb-3">
              {similar.map((item) => (
                <a key={item.id} href={`/dizi/${item.id}`} className="group shrink-0 w-[128px]" style={{ scrollSnapAlign: 'start' }}>
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
