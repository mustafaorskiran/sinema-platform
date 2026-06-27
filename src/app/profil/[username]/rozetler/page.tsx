import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeBadges, ALL_BADGE_COUNT } from '@/lib/badges'
import type { Metadata } from 'next'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, created_at, follower_count')
    .eq('username', username)
    .single()

  if (!profile) notFound()

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

  const badges = computeBadges({
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
  })

  const earned = badges.filter(b => b.earned)
  const unearned = badges.filter(b => !b.earned)
  const pct = Math.round((earned.length / ALL_BADGE_COUNT) * 100)

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

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
            {profile.full_name ?? `@${username}`} — Rozetler
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {earned.length}/{ALL_BADGE_COUNT} rozet kazanıldı ({pct}%)
          </p>
        </div>
      </div>

      {/* İlerleme barı */}
      <div className="mb-8 p-5 rounded-2xl" style={card}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Genel İlerleme</span>
          <span className="text-sm font-bold" style={{ color: '#D4A843' }}>{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(90deg, #D4A843, #F0C060)'
                : 'linear-gradient(90deg, #E11D48, #be123c)',
            }} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {ALL_BADGE_COUNT - earned.length} rozet daha kazanabilirsin
        </p>
      </div>

      {/* Kazanılan Rozetler */}
      {earned.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>🏅</span> Kazanılan Rozetler
            <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>({earned.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.2)' }}>
                <span className="text-2xl shrink-0">{b.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                  <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kazanılmayan Rozetler */}
      {unearned.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span>🔒</span> Kilitli Rozetler
            <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>({unearned.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unearned.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl opacity-50"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-2xl shrink-0 grayscale">{b.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                  <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
