import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BadgesSection from '@/components/BadgesSection'
import { computeBadges, ALL_BADGE_COUNT } from '@/lib/badges'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — Rozetler | Sinezon`,
    description: `${username} kullanıcısının kazandığı rozetler ve başarılar.`,
  }
}

export default async function ProfilRozetlerPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()
  const { t } = await getTranslations()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, created_at, follower_count, pinned_badges')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  const [
    { count: reviewCount },
    { count: filmCount },
    { count: diziCount },
    { data: reviewsForAvg },
    { count: listCount },
    { count: diaryCount },
    { count: threadCount },
    { count: topicVoteCount },
  ] = await Promise.all([
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('media_type', 'film'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('media_type', 'dizi'),
    supabase.from('reviews').select('rating').eq('user_id', profile.id),
    supabase.from('lists').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('diary_entries').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('topic_votes').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
  ])

  const avgRating = reviewsForAvg && reviewsForAvg.length > 0
    ? reviewsForAvg.reduce((s, r) => s + r.rating, 0) / reviewsForAvg.length
    : 0

  const stats = {
    reviewCount: reviewCount ?? 0,
    filmCount: filmCount ?? 0,
    diziCount: diziCount ?? 0,
    avgRating,
    followerCount: profile.follower_count ?? 0,
    listCount: listCount ?? 0,
    diaryCount: diaryCount ?? 0,
    threadCount: threadCount ?? 0,
    topicVoteCount: topicVoteCount ?? 0,
    joinedAt: profile.created_at,
  }
  const earnedCount = computeBadges(stats, t).filter(b => b.earned).length
  const pct = Math.round((earnedCount / ALL_BADGE_COUNT) * 100)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href={`/profil/${username}`} className="text-sm hover:text-white transition-colors mb-6 block"
        style={{ color: 'rgba(255,255,255,0.4)' }}>
        ← @{username}
      </Link>

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-8">
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt={username} className="h-10 w-10 rounded-full object-cover" />
          : <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>
              {username[0]?.toUpperCase()}
            </div>
        }
        <div>
          <h1 className="text-xl font-bold text-white">
            {t('profile.badgesTab.title', { name: profile.full_name ?? `@${username}` })}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('profile.badgesTab.earnedCount', { earned: earnedCount, total: ALL_BADGE_COUNT, pct })}
          </p>
        </div>
      </div>

      <BadgesSection stats={stats} initialPinned={profile.pinned_badges ?? []} isOwnProfile={isOwnProfile} />
    </div>
  )
}
