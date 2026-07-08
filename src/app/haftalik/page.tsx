import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl, getMediaTitle, getMediaYear, getMovieDetail, getSeriesDetail, getActiveTMDbLanguage } from '@/lib/tmdb'
import { getTranslations, getLocaleInfo, type Locale } from '@/lib/i18n'
import {
  IconNewspaper, IconFire, IconFilm, IconTv, IconStarFilled, IconMessageSquare,
  IconHeartFilled, IconClipboard, IconPencil, IconLink, IconCalendar, IconTrophy,
  IconDice, IconRobot,
} from '@/components/icons'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return {
    title: t('haftalik.metaTitle'),
    description: t('haftalik.metaDesc'),
  }
}

function weekRange(locale: Locale) {
  const bcp47 = getLocaleInfo(locale).tmdb
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return {
    start: monday.toISOString(),
    end: sunday.toISOString(),
    label: `${monday.toLocaleDateString(bcp47, { day: 'numeric', month: 'long' })} – ${sunday.toLocaleDateString(bcp47, { day: 'numeric', month: 'long', year: 'numeric' })}`,
  }
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function fetchTrendingWeek(apiKey: string, lang: string) {
  try {
    const r = await fetch(`${TMDB_BASE}/trending/all/week?language=${lang}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    })
    if (!r.ok) return []
    const d = await r.json()
    return (d.results ?? []).slice(0, 5)
  } catch { return [] }
}

export default async function HaftalikPage() {
  const supabase = await createClient()
  const { t, locale } = await getTranslations()
  const { start, label } = weekRange(locale)
  const tmdbLang = await getActiveTMDbLanguage()
  const apiKey = process.env.TMDB_BEARER_TOKEN ?? ''

  const [
    { data: topReviewsRaw },
    { data: activeUsersRaw },
    { data: newListsRaw },
    trendingAll,
  ] = await Promise.all([
    // En beğenilen yorumlar bu hafta
    supabase
      .from('reviews')
      .select('id, media_id, media_type, content, rating, likes_count, created_at, profiles(username, avatar_url)')
      .gte('created_at', start)
      .not('content', 'is', null)
      .neq('content', '')
      .order('likes_count', { ascending: false })
      .limit(5),
    // En aktif yorumcular bu hafta
    supabase
      .from('reviews')
      .select('user_id, profiles(username, avatar_url)')
      .gte('created_at', start)
      .limit(500),
    // Yeni oluşturulan listeler bu hafta
    supabase
      .from('lists')
      .select('id, title, created_at, profiles(username)')
      .gte('created_at', start)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5),
    fetchTrendingWeek(apiKey, tmdbLang),
  ])

  // Aktif kullanıcı sıralaması
  const userCountMap: Record<string, { username: string; avatar_url: string | null; count: number }> = {}
  for (const r of activeUsersRaw ?? []) {
    const p = r.profiles as any
    const uid = (r as any).user_id
    if (!p?.username || !uid) continue
    if (!userCountMap[uid]) userCountMap[uid] = { username: p.username, avatar_url: p.avatar_url, count: 0 }
    userCountMap[uid].count++
  }
  const activeUsers = Object.values(userCountMap).sort((a, b) => b.count - a.count).slice(0, 5)

  // Top yorum TMDB detay
  const topReviews = await Promise.all(
    (topReviewsRaw ?? []).map(async (r: any) => {
      try {
        const detail = r.media_type === 'film' ? await getMovieDetail(r.media_id) : await getSeriesDetail(r.media_id)
        return { ...r, mediaTitle: getMediaTitle(detail), mediaPoster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null }
      } catch { return { ...r, mediaTitle: `#${r.media_id}`, mediaPoster: null } }
    })
  )

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(212,168,67,0.6)' }}>
          {t('haftalik.eyebrow')}
        </p>
        <h1 className="text-3xl font-black text-white mb-1 inline-flex items-center gap-2"><IconNewspaper size={28} /> {t('haftalik.title')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol kolon: trend + listeler */}
        <div className="lg:col-span-2 space-y-6">

          {/* TMDb Trendleri */}
          {trendingAll.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <IconFire size={14} /> {t('haftalik.trending')}
              </h2>
              <div className="space-y-2">
                {trendingAll.map((item: any, i: number) => {
                  const type = item.media_type === 'tv' ? 'dizi' : 'film'
                  const title = item.title ?? item.name ?? ''
                  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
                  return (
                    <Link key={item.id} href={`/${type}/${item.id}`} prefetch={false}
                      className="flex items-center gap-4 p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
                      style={card}>
                      <span className="w-7 text-center font-black tabular-nums text-sm shrink-0"
                        style={{ color: i < 3 ? '#D4A843' : 'rgba(255,255,255,0.25)' }}>
                        {i + 1}
                      </span>
                      <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {item.poster_path && (
                          <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={title}
                            className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm group-hover:text-[--accent] transition-colors line-clamp-1">
                          {title}
                        </p>
                        <p className="text-xs mt-0.5 inline-flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {type === 'film' ? <IconFilm size={12} /> : <IconTv size={12} />} {year}
                          {item.vote_average > 0 && (
                            <span className="inline-flex items-center gap-0.5">· <IconStarFilled size={11} /> {item.vote_average.toFixed(1)}</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <Link href="/top10" className="inline-block mt-3 text-xs hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('haftalik.allTop10')} →
              </Link>
            </section>
          )}

          {/* En Beğenilen Yorumlar */}
          {topReviews.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <IconMessageSquare size={14} /> {t('haftalik.topReviews')}
              </h2>
              <div className="space-y-3">
                {topReviews.map((r: any) => (
                  <div key={r.id} className="flex gap-3 p-4 rounded-xl" style={card}>
                    {r.mediaPoster && (
                      <img src={r.mediaPoster} alt={r.mediaTitle}
                        className="w-10 h-14 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/profil/${(r.profiles as any)?.username}`}
                          className="text-xs font-bold text-white hover:text-[--accent] transition-colors">
                          @{(r.profiles as any)?.username}
                        </Link>
                        <span className="text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-0.5" style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843' }}>
                          <IconStarFilled size={10} /> {r.rating}/10
                        </span>
                        {r.likes_count > 0 && (
                          <span className="text-[10px] inline-flex items-center gap-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            <IconHeartFilled size={10} /> {r.likes_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {r.content}
                      </p>
                      <Link href={`/${r.media_type}/${r.media_id}`} prefetch={false}
                        className="text-[10px] mt-1 hover:text-white transition-colors block"
                        style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {r.mediaTitle} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Yeni Listeler */}
          {(newListsRaw ?? []).length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <IconClipboard size={14} /> {t('haftalik.newLists')}
              </h2>
              <div className="space-y-2">
                {(newListsRaw ?? []).map((l: any) => (
                  <Link key={l.id} href={`/liste/${l.id}`}
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
                    style={card}>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-[--accent] transition-colors">
                        {l.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        @{(l.profiles as any)?.username}
                      </p>
                    </div>
                    <span className="text-white/20 text-xs">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sağ kolon: aktif kullanıcılar + hızlı linkler */}
        <div className="space-y-6">

          {/* En Aktif Kullanıcılar */}
          {activeUsers.length > 0 && (
            <section className="p-5 rounded-2xl" style={card}>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <IconPencil size={14} /> {t('haftalik.topReviewers')}
              </h2>
              <div className="space-y-3">
                {activeUsers.map((u, i) => (
                  <Link key={u.username} href={`/profil/${u.username}`}
                    className="flex items-center gap-3 group">
                    <span className="w-5 text-center text-xs font-black shrink-0"
                      style={{ color: i < 3 ? '#D4A843' : 'rgba(255,255,255,0.2)' }}>
                      {i + 1}
                    </span>
                    <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: u.avatar_url ? 'transparent' : 'linear-gradient(135deg, #E11D48, #be123c)' }}>
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                        : u.username[0]?.toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-[--accent] transition-colors truncate">
                        @{u.username}
                      </p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {t('haftalik.reviewCount', { count: u.count })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/liderlik" className="block mt-4 text-xs text-center hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                {t('haftalik.leaderboard')} →
              </Link>
            </section>
          )}

          {/* Hızlı Bağlantılar */}
          <section className="p-5 rounded-2xl" style={card}>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <IconLink size={14} /> {t('haftalik.explore')}
            </h2>
            <div className="space-y-2">
              {[
                { href: '/yakinda', label: t('haftalik.upcoming'), icon: IconCalendar },
                { href: '/top10', label: t('haftalik.weeklyTop10'), icon: IconFire },
                { href: '/liderlik', label: t('haftalik.leaderboard'), icon: IconTrophy },
                { href: '/ne-izlesem', label: t('haftalik.whatToWatch'), icon: IconDice },
                { href: '/forum', label: t('haftalik.discussionForum'), icon: IconMessageSquare },
                { href: '/oneri', label: t('haftalik.aiRecommendation'), icon: IconRobot },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <link.icon size={14} /> {link.label}
                </Link>
              ))}
            </div>
          </section>

          {/* Özet Bilgisi */}
          <div className="text-center">
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
              {t('haftalik.hourlyUpdate')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
