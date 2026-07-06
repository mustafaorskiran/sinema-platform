import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl, getMediaTitle, getMovieDetail, getSeriesDetail } from '@/lib/tmdb'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconUsers, IconFilm, IconTv, IconStarFilled } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Arkadaşlarım Ne Beğendi? | Sinezon',
  description: 'Takip ettiğin kişilerin son dönemde yüksek puan verdiği filmler ve diziler.',
}

export default async function SosyalOneriPage() {
  const { t } = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris?next=/sosyal-oneri')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()

  // Takip edilen kullanıcılar
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = (following ?? []).map(f => f.following_id)

  if (followingIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="mb-4 flex justify-center"><IconUsers size={40} /></p>
        <h1 className="text-2xl font-bold text-white mb-2">{t('social.noFollowingTitle')}</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('social.noFollowingDesc')}
        </p>
        <Link href="/benzer-kullanicilar"
          className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>
          {t('social.findUsers')}
        </Link>
      </div>
    )
  }

  // Takip edilenlerin son 30 günde 8+ puan verdiği içerikler
  const { data: highRatedReviews } = await supabase
    .from('reviews')
    .select('media_id, media_type, rating, created_at, profiles(username, avatar_url)')
    .in('user_id', followingIds)
    .gte('rating', 8)
    .gte('created_at', thirtyDaysAgo)
    .order('rating', { ascending: false })
    .limit(100)

  // Kendi izlediklerimi çıkar
  const { data: myWatched } = await supabase
    .from('watchlist')
    .select('media_id, media_type')
    .eq('user_id', user.id)
    .eq('status', 'izledim')

  const myWatchedSet = new Set((myWatched ?? []).map(w => `${w.media_type}-${w.media_id}`))

  // Aynı içeriğe birden fazla puan gelirse birleştir
  const mediaMap = new Map<string, {
    media_id: number
    media_type: string
    ratings: number[]
    recommenders: Array<{ username: string; avatar_url: string | null; rating: number }>
  }>()

  for (const r of highRatedReviews ?? []) {
    const key = `${r.media_type}-${r.media_id}`
    if (myWatchedSet.has(key)) continue
    const p = r.profiles as any
    if (!mediaMap.has(key)) {
      mediaMap.set(key, { media_id: r.media_id, media_type: r.media_type, ratings: [], recommenders: [] })
    }
    const entry = mediaMap.get(key)!
    entry.ratings.push(r.rating)
    if (entry.recommenders.length < 3) {
      entry.recommenders.push({ username: p?.username ?? '?', avatar_url: p?.avatar_url ?? null, rating: r.rating })
    }
  }

  const sorted = Array.from(mediaMap.values())
    .sort((a, b) => {
      const avgA = a.ratings.reduce((s, v) => s + v, 0) / a.ratings.length
      const avgB = b.ratings.reduce((s, v) => s + v, 0) / b.ratings.length
      return b.ratings.length !== a.ratings.length
        ? b.ratings.length - a.ratings.length
        : avgB - avgA
    })
    .slice(0, 20)

  const enriched = await Promise.all(
    sorted.map(async item => {
      try {
        const detail = item.media_type === 'film' ? await getMovieDetail(item.media_id) : await getSeriesDetail(item.media_id)
        return {
          ...item,
          title: getMediaTitle(detail),
          poster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null,
          avgRating: (item.ratings.reduce((s, v) => s + v, 0) / item.ratings.length).toFixed(1),
        }
      } catch {
        return { ...item, title: `#${item.media_id}`, poster: null, avgRating: '?' }
      }
    })
  )

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2"><IconUsers size={28} /> {t('social.pageTitle')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('social.pageDesc')}
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="mb-3 flex justify-center"><IconFilm size={40} /></p>
          <p className="text-white font-medium mb-1">{t('social.noRecsTitle')}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('social.noRecsDesc')}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {enriched.map(item => (
            <Link key={`${item.media_type}-${item.media_id}`} href={`/${item.media_type}/${item.media_id}`} prefetch={false}
              className="flex gap-4 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group"
              style={card}>
              <div className="shrink-0 w-16 h-24 rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {item.poster && (
                  <img src={item.poster} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-white text-sm group-hover:text-[--accent] transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  <span className="shrink-0 text-xs font-black px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                    style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843' }}>
                    <IconStarFilled size={11} /> {item.avgRating}
                  </span>
                </div>
                <p className="text-[11px] mb-2 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {item.media_type === 'film'
                    ? <span className="inline-flex items-center gap-1"><IconFilm size={12} /> {t('film.badge')}</span>
                    : <span className="inline-flex items-center gap-1"><IconTv size={12} /> {t('series.badge')}</span>}
                  {item.ratings.length > 1 && ` ${t('social.likedByCount', { count: item.ratings.length })}`}
                </p>
                {/* Öneren avatarlar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.recommenders.map(rec => (
                    <div key={rec.username} className="flex items-center gap-1">
                      <div className="h-5 w-5 rounded-full overflow-hidden flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: rec.avatar_url ? 'transparent' : 'linear-gradient(135deg, #E11D48, #be123c)' }}>
                        {rec.avatar_url
                          ? <img src={rec.avatar_url} alt={rec.username} className="w-full h-full object-cover" />
                          : rec.username[0]?.toUpperCase()
                        }
                      </div>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        @{rec.username} <span style={{ color: '#D4A843' }}>{rec.rating}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
