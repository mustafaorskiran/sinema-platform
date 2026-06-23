import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IconStar, IconFilm, IconTv, IconCalendarDays, IconBookmark, IconCheck, IconPencil, IconList, IconGlobe, IconLock, IconMapPin, IconTrendingUp, IconClapperboard, IconMessageSquare } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import FollowButton from '@/components/FollowButton'
import MessageButton from '@/components/MessageButton'
import { computeBadges } from '@/lib/badges'
import FavoritesEditor from '@/components/FavoritesEditor'
import ActivityHeatmap from '@/components/ActivityHeatmap'
import PinReviewButton from '@/components/PinReviewButton'
import WatchGoalWidget from '@/components/WatchGoalWidget'
import YearlyChallenge from '@/components/YearlyChallenge'
import InviteSection from '@/components/InviteSection'
import type { Metadata } from 'next'
import type { Review } from '@/lib/types'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('bio, avatar_url')
    .eq('username', username)
    .single()
  const description = profile?.bio
    ? profile.bio.slice(0, 155)
    : `${username} adlı kullanıcının Sinezon profili. Film ve dizi yorumlarını keşfet.`
  return {
    title: `${username} — Profil`,
    description,
    alternates: { canonical: `/profil/${username}` },
    openGraph: {
      title: `${username} | Sinezon`,
      description,
      type: 'profile',
      url: `/profil/${username}`,
      ...(profile?.avatar_url && {
        images: [{ url: profile.avatar_url, width: 400, height: 400, alt: username }],
      }),
    },
  }
}

export default async function ProfilPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  // Tüm verileri paralel çek
  const [
    { data: reviews },
    { data: watchlist },
    { count: followerCount },
    { count: followingCount },
    { data: followCheck },
    { data: userLists },
    { data: recentDiary },
    { count: diaryCount },
    { count: threadCount },
    { count: topicVoteCount },
    { data: favoritesRaw },
    { count: episodeCount },
    { data: pinnedReviewRaw },
    { data: allDiaryDates },
  ] = await Promise.all([
    supabase.from('reviews').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('watchlist').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user && !isOwnProfile
      ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('lists')
      .select('id, title, public, list_items(count)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase.from('diary_entries')
      .select('id, media_id, media_type, watched_at, rating, note')
      .eq('user_id', profile.id)
      .order('watched_at', { ascending: false })
      .limit(12),
    supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('topic_votes').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('profile_favorites').select('*').eq('user_id', profile.id).order('position'),
    supabase.from('episode_watches').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('reviews').select('id, media_id, media_type, rating, content, created_at').eq('user_id', profile.id).eq('is_pinned', true).maybeSingle(),
    supabase.from('diary_entries').select('watched_at').eq('user_id', profile.id),
  ])

  const isFollowing = !!followCheck

  // Aktivite haritası verileri
  const heatmapEntries = [
    ...(allDiaryDates ?? []).map((e: any) => ({ date: e.watched_at })),
    ...(reviews ?? []).map(r => ({ date: r.created_at })),
  ]

  // Favori medya bilgileri
  const favoritesWithMedia = await Promise.all(
    (favoritesRaw ?? []).map(async (fav) => {
      try {
        const media = fav.media_type === 'film'
          ? await getMovieDetail(fav.media_id)
          : await getSeriesDetail(fav.media_id)
        return { ...fav, title: getMediaTitle(media), poster: getPosterUrl(media.poster_path, 'w342') }
      } catch {
        return { ...fav, title: `#${fav.media_id}`, poster: null }
      }
    })
  )

  // Rozetler
  const badges = computeBadges({
    reviewCount: reviews?.length ?? 0,
    filmCount: reviews?.filter(r => r.media_type === 'film').length ?? 0,
    diziCount: reviews?.filter(r => r.media_type === 'dizi').length ?? 0,
    avgRating: reviews && reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0,
    followerCount: followerCount ?? 0,
    listCount: userLists?.length ?? 0,
    diaryCount: diaryCount ?? 0,
    threadCount: threadCount ?? 0,
    topicVoteCount: topicVoteCount ?? 0,
    joinedAt: profile.created_at,
  })
  const earnedBadges = badges.filter(b => b.earned)

  // Pinlenmiş yorum medya bilgisi
  let pinnedReviewWithMedia: { id: string; media_id: number; media_type: string; rating: number; content: string | null; created_at: string; title: string; poster: string | null } | null = null
  if (pinnedReviewRaw) {
    try {
      const m = pinnedReviewRaw.media_type === 'film'
        ? await getMovieDetail(pinnedReviewRaw.media_id)
        : await getSeriesDetail(pinnedReviewRaw.media_id)
      pinnedReviewWithMedia = { ...(pinnedReviewRaw as any), title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342') }
    } catch {
      pinnedReviewWithMedia = { ...(pinnedReviewRaw as any), title: `#${pinnedReviewRaw.media_id}`, poster: null }
    }
  }

  // Günlük medya bilgileri
  const diaryWithMedia = await Promise.all(
    (recentDiary ?? []).map(async (entry) => {
      try {
        const media = entry.media_type === 'film'
          ? await getMovieDetail(entry.media_id)
          : await getSeriesDetail(entry.media_id)
        return { ...entry, title: getMediaTitle(media), poster: getPosterUrl(media.poster_path, 'w342') }
      } catch {
        return { ...entry, title: `#${entry.media_id}`, poster: null }
      }
    })
  )

  // Watchlist medya bilgileri
  const watchlistWithMedia = await Promise.all(
    (watchlist ?? []).map(async (item) => {
      try {
        const media = item.media_type === 'film'
          ? await getMovieDetail(item.media_id)
          : await getSeriesDetail(item.media_id)
        return { ...item, media }
      } catch {
        return { ...item, media: null }
      }
    })
  )

  const izlemekIstiyorum = watchlistWithMedia.filter(w => w.status === 'izlemek-istiyorum')
  const izledim = watchlistWithMedia.filter(w => w.status === 'izledim')

  // Review medya bilgileri
  const reviewsWithMedia = await Promise.all(
    (reviews ?? []).map(async (review: Review) => {
      try {
        const media = review.media_type === 'film'
          ? await getMovieDetail(review.media_id)
          : await getSeriesDetail(review.media_id)
        return { ...review, media }
      } catch {
        return { ...review, media: null }
      }
    })
  )

  const totalReviews = reviews?.length ?? 0
  const avgRating = totalReviews > 0
    ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : null
  const filmCount = reviews?.filter(r => r.media_type === 'film').length ?? 0
  const diziCount = reviews?.filter(r => r.media_type === 'dizi').length ?? 0

  const joinDate = new Date(profile.created_at).toLocaleDateString('tr-TR', {
    month: 'long', year: 'numeric',
  })

  const themeStyle = profile.theme_color && profile.theme_color !== '#e50914'
    ? { '--accent': profile.theme_color, '--accent-hover': profile.theme_color + 'cc' } as React.CSSProperties
    : undefined

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={themeStyle}>

      {/* Banner */}
      {profile.banner_url && (
        <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-0 -mt-4 relative">
          <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[--bg-primary] via-[--bg-primary]/40 to-transparent" />
        </div>
      )}

      {/* Profil başlığı */}
      <div className={`flex items-start gap-5 sm:gap-6 mb-8 ${profile.banner_url ? '-mt-10 sm:-mt-14' : ''}`}>
        <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-[--accent] flex items-center justify-center text-3xl font-bold text-white shrink-0 select-none overflow-hidden shadow-xl ${profile.banner_url ? 'ring-4 ring-[--bg-primary]' : 'ring-2 ring-[--border]'}`}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
            : username[0].toUpperCase()
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold text-white">{username}</h1>
            {isOwnProfile ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/profil/duzenle"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors"
                >
                  <IconPencil className="h-3.5 w-3.5" />
                  Düzenle
                </Link>
                <Link
                  href={`/profil/${username}/istatistikler`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors"
                >
                  <IconTrendingUp className="h-3.5 w-3.5" />
                  İstatistikler
                </Link>
                <Link
                  href={`/profil/${username}/yil-ozeti`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors"
                >
                  <IconClapperboard className="h-3.5 w-3.5" />
                  Yıl Özeti
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <FollowButton
                  targetUserId={profile.id}
                  initialFollowing={isFollowing}
                  isLoggedIn={!!user}
                />
                {user && (
                  <MessageButton targetUserId={profile.id} />
                )}
                <Link
                  href={`/profil/${username}/istatistikler`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors"
                >
                  <IconTrendingUp className="h-3.5 w-3.5" />
                  İstatistikler
                </Link>
                <Link
                  href={`/profil/${username}/yil-ozeti`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors"
                >
                  <IconClapperboard className="h-3.5 w-3.5" />
                  Yıl Özeti
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-[--text-secondary]">
            <IconCalendarDays className="h-3.5 w-3.5" />
            <span>{joinDate} tarihinde katıldı</span>
          </div>

          {/* Takipçi / Takip sayıları */}
          <div className="flex gap-5 mt-3">
            <span className="text-sm">
              <span className="font-bold text-white">{followerCount ?? 0}</span>
              <span className="text-[--text-secondary] ml-1">Takipçi</span>
            </span>
            <span className="text-sm">
              <span className="font-bold text-white">{followingCount ?? 0}</span>
              <span className="text-[--text-secondary] ml-1">Takip</span>
            </span>
          </div>

          {/* Bio & konum & website */}
          {profile.bio && (
            <p className="mt-3 text-sm text-[--text-secondary] leading-relaxed max-w-md">{profile.bio}</p>
          )}
          {(profile.location || profile.website) && (
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[--text-secondary]">
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <IconMapPin className="h-3 w-3 shrink-0" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[--accent] transition-colors">
                  <IconGlobe className="h-3 w-3 shrink-0" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4 Favori */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-wider">Favoriler</h2>
          {isOwnProfile && <span className="text-xs text-[--text-secondary]">Düzenlemek için posteri tıkla</span>}
        </div>
        <FavoritesEditor
          favorites={favoritesWithMedia}
          isOwnProfile={isOwnProfile}
        />
      </div>

      {/* Pinlenmiş Yorum */}
      {pinnedReviewWithMedia && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-[--accent] uppercase tracking-wider">📌 Sabitlenmiş Yorum</span>
          </div>
          <div className="flex gap-4 rounded-xl bg-gradient-to-br from-[--accent]/10 via-[--bg-card] to-[--bg-card] border border-[--accent]/25 p-4">
            <Link href={`/${pinnedReviewWithMedia.media_type}/${pinnedReviewWithMedia.media_id}`} className="shrink-0">
              <div className="w-14 aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-secondary]">
                {pinnedReviewWithMedia.poster
                  ? <img src={pinnedReviewWithMedia.poster} alt={pinnedReviewWithMedia.title} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                  : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs">?</div>
                }
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/${pinnedReviewWithMedia.media_type}/${pinnedReviewWithMedia.media_id}`} className="hover:text-[--accent] transition-colors">
                  <h3 className="font-semibold text-white leading-snug">{pinnedReviewWithMedia.title}</h3>
                </Link>
                <div className="flex items-center gap-1 shrink-0 bg-[--bg-secondary] rounded-md px-2 py-0.5">
                  <IconStar className="h-3.5 w-3.5 fill-[--gold] text-[--gold]" />
                  <span className="text-[--gold] font-bold text-sm">{pinnedReviewWithMedia.rating}/10</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${pinnedReviewWithMedia.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {pinnedReviewWithMedia.media_type === 'film' ? 'Film' : 'Dizi'}
                </span>
                <span className="text-xs text-[--text-secondary]">{new Date(pinnedReviewWithMedia.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              {pinnedReviewWithMedia.content && (
                <p className="mt-2 text-sm text-[--text-secondary] line-clamp-3 leading-relaxed">{pinnedReviewWithMedia.content}</p>
              )}
              {isOwnProfile && (
                <div className="mt-3">
                  <PinReviewButton reviewId={pinnedReviewWithMedia.id} isPinned={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* İzleme Hedefi — sadece kendi profilinde */}
      {isOwnProfile && (
        <div className="mb-10 grid sm:grid-cols-2 gap-4">
          <WatchGoalWidget />
          <YearlyChallenge />
        </div>
      )}

      {/* Veri dışa aktarma (sadece kendi profilinde) */}
      {isOwnProfile && (
        <div className="mb-8 p-4 rounded-xl bg-[--bg-card] border border-[--border]">
          <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider mb-3">Verilerimi İndir</p>
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'watchlist', label: '📋 İzleme Listesi' },
              { type: 'diary', label: '📅 Günlük' },
              { type: 'reviews', label: '💬 Yorumlar' },
              { type: 'collection', label: '📦 Koleksiyon' },
            ].map(({ type, label }) => (
              <a
                key={type}
                href={`/api/export?type=${type}`}
                download
                className="px-3 py-1.5 rounded-lg border border-[--border] text-xs text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors"
              >
                {label} CSV
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Arkadaşlarını Davet Et (sadece kendi profilinde) */}
      {isOwnProfile && <InviteSection />}

      {/* İstatistikler */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
        <StatCard label="Film" value={filmCount} icon={<IconFilm className="h-4 w-4" />} accentColor="#60a5fa" />
        <StatCard label="Dizi" value={diziCount} icon={<IconTv className="h-4 w-4" />} accentColor="#a78bfa" />
        <StatCard label="Bölüm" value={episodeCount ?? 0} icon={<IconTv className="h-3.5 w-3.5" />} accentColor="#34d399" />
        <StatCard label="Yorum" value={totalReviews} icon={<IconMessageSquare className="h-4 w-4" />} accentColor="var(--accent)" />
        <StatCard label="Ort. Puan" value={avgRating ?? '—'} gold={!!avgRating} icon={<IconStar className="h-4 w-4" />} accentColor="var(--gold)" />
        <StatCard label="Günlük" value={diaryCount ?? 0} icon={<IconCalendarDays className="h-4 w-4" />} accentColor="#38bdf8" />
      </div>

      {/* İzleme Listeleri */}
      {(izlemekIstiyorum.length > 0 || izledim.length > 0) && (
        <div className="mb-12 space-y-8">
          {izlemekIstiyorum.length > 0 && (
            <WatchlistSection
              title="İzlemek İstiyorum"
              icon={<IconBookmark className="h-5 w-5 text-blue-400" />}
              items={izlemekIstiyorum}
              hoverColor="border-blue-500/50"
            />
          )}
          {izledim.length > 0 && (
            <WatchlistSection
              title="İzledim"
              icon={<IconCheck className="h-5 w-5 text-green-400" />}
              items={izledim}
              hoverColor="border-green-500/50"
            />
          )}
        </div>
      )}

      {/* Kullanıcı Listeleri */}
      {userLists && userLists.filter(l => l.public || isOwnProfile).length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <IconList className="h-5 w-5 text-[--accent]" />
              Listeler
            </h2>
            {isOwnProfile && (
              <Link href="/liste/yeni" className="text-sm text-[--accent] hover:underline">+ Yeni Liste</Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userLists.filter(l => l.public || isOwnProfile).map((list: any) => (
              <Link key={list.id} href={`/liste/${list.id}`}
                className="group rounded-xl bg-[--bg-card] border border-[--border] p-4 hover:border-[--accent]/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white group-hover:text-[--accent] transition-colors line-clamp-2 flex-1">{list.title}</p>
                  {list.public ? <IconGlobe className="h-3.5 w-3.5 text-[--text-secondary] shrink-0 mt-0.5" /> : <IconLock className="h-3.5 w-3.5 text-[--text-secondary] shrink-0 mt-0.5" />}
                </div>
                <p className="text-xs text-[--text-secondary] mt-1">{list.list_items?.[0]?.count ?? 0} içerik</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Rozetler */}
      {earnedBadges.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[--accent]">🏅</span>
              Rozetler
              <span className="text-sm font-normal text-[--text-secondary]">{earnedBadges.length}/{badges.length}</span>
            </h2>
            <Link href={`/profil/${username}/istatistikler`} className="text-sm text-[--accent] hover:underline">
              Tüm başarımlar →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map(badge => (
              <div
                key={badge.id}
                title={badge.desc}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors cursor-default group"
              >
                <span className="text-xl">{badge.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-white leading-none">{badge.name}</p>
                  <p className="text-[10px] text-[--text-secondary] mt-0.5 hidden group-hover:block">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Film Günlüğü */}
      {diaryWithMedia.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <IconCalendarDays className="h-5 w-5 text-[--accent]" />
              Son İzlemeler
            </h2>
            {isOwnProfile && (
              <Link href="/gunluk" className="text-sm text-[--accent] hover:underline">Tüm Günlük →</Link>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {diaryWithMedia.map(entry => (
              <Link key={entry.id} href={`/${entry.media_type}/${entry.media_id}`} className="group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/40 transition-all relative group-hover:shadow-lg group-hover:shadow-black/40 group-hover:scale-[1.04]">
                  {entry.poster
                    ? <img src={entry.poster} alt={entry.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-1 text-center leading-tight">{entry.title}</div>
                  }
                  {entry.rating && (
                    <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1 text-[9px] font-bold text-[--gold]">
                      ★{entry.rating}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-[--text-secondary] text-center">
                  {new Date(entry.watched_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Aktivite Haritası */}
      {heatmapEntries.length > 0 && (
        <div className="mb-10">
          <ActivityHeatmap entries={heatmapEntries} />
        </div>
      )}

      {/* Yorumlar */}
      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <IconMessageSquare className="h-5 w-5 text-[--accent]" />
        Yorumlar
        <span className="text-base font-normal text-[--text-secondary]">({totalReviews})</span>
      </h2>

      {reviewsWithMedia.length === 0 ? (
        <div className="rounded-xl bg-[--bg-card] border border-[--border] py-16 text-center text-[--text-secondary]">
          {isOwnProfile
            ? 'Henüz yorum yapmadın. Bir film veya dizi sayfasına gidip yorum yaz!'
            : 'Bu kullanıcı henüz yorum yapmamış.'}
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsWithMedia.map(({ media, ...review }) => {
            const poster = media ? getPosterUrl(media.poster_path, 'w342') : null
            const title = media ? getMediaTitle(media) : `İçerik #${review.media_id}`
            const href = `/${review.media_type}/${review.media_id}`
            const date = new Date(review.created_at).toLocaleDateString('tr-TR')

            return (
              <div key={review.id} className="flex gap-4 rounded-xl bg-[--bg-card] border border-[--border] p-4 hover:border-[--accent]/40 transition-colors">
                <Link href={href} className="shrink-0">
                  <div className="w-14 aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-secondary]">
                    {poster
                      ? <img src={poster} alt={title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs">?</div>
                    }
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={href} className="hover:text-[--accent] transition-colors">
                      <h3 className="font-semibold text-white leading-snug">{title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-[--bg-secondary] rounded-md px-2 py-0.5">
                        <IconStar className="h-3.5 w-3.5 fill-[--gold] text-[--gold]" />
                        <span className="text-[--gold] font-bold text-sm">{review.rating}/10</span>
                      </div>
                      {isOwnProfile && (
                        <PinReviewButton reviewId={review.id} isPinned={!!(review as any).is_pinned} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      review.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {review.media_type === 'film' ? 'Film' : 'Dizi'}
                    </span>
                    <span className="text-xs text-[--text-secondary]">{date}</span>
                  </div>
                  <p className="mt-2 text-sm text-[--text-secondary] line-clamp-2 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function WatchlistSection({ title, icon, items, hoverColor }: {
  title: string
  icon: React.ReactNode
  items: { id: string; media_id: number; media_type: string; media: any }[]
  hoverColor: string
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
        {icon}
        {title}
        <span className="text-base font-normal text-[--text-secondary]">({items.length})</span>
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {items.map((item) => {
          const poster = item.media ? getPosterUrl(item.media.poster_path, 'w342') : null
          const title = item.media ? getMediaTitle(item.media) : `#${item.media_id}`
          return (
            <Link key={item.id} href={`/${item.media_type}/${item.media_id}`} className="group">
              <div className={`aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-card] border border-[--border] group-hover:${hoverColor} transition-colors`}>
                {poster
                  ? <img src={poster} alt={title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-1 text-center">{title}</div>
                }
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, gold, icon, accentColor }: {
  label: string
  value: string | number
  gold?: boolean
  icon?: React.ReactNode
  accentColor?: string
}) {
  return (
    <div
      className="rounded-xl bg-[--bg-card] border border-[--border] p-4 text-center"
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : undefined}
    >
      {icon && (
        <div className="flex justify-center mb-1.5" style={{ color: accentColor ?? 'var(--text-secondary)' }}>
          {icon}
        </div>
      )}
      <div className={`text-2xl font-bold ${gold ? 'text-[--gold]' : 'text-white'}`}>{value}</div>
      <div className="text-[11px] text-[--text-secondary] mt-0.5">{label}</div>
    </div>
  )
}
