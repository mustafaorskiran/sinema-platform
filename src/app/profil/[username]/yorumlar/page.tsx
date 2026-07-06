import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl, getMediaTitle, getMovieDetail, getSeriesDetail } from '@/lib/tmdb'
import type { Metadata } from 'next'
import { getTranslations, createT } from '@/lib/i18n'
import { IconArrowLeft, IconFilm, IconTv, IconStarFilled, IconHeartFilled, IconPencil, IconAlertTriangle, IconChevronLeft, IconChevronRight } from '@/components/icons'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ sirala?: string; tip?: string; sayfa?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — Yorumları | Sinezon`,
    description: `${username} kullanıcısının film ve dizi yorumları.`,
  }
}

const PAGE_SIZE = 12

function timeAgo(date: string, t: ReturnType<typeof createT>) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return t('profile.reviewsTab.justNow')
  if (diff < 3600) return t('profile.reviewsTab.minutesAgo', { count: Math.floor(diff / 60) })
  if (diff < 86400) return t('profile.reviewsTab.hoursAgo', { count: Math.floor(diff / 3600) })
  if (diff < 604800) return t('profile.reviewsTab.daysAgo', { count: Math.floor(diff / 86400) })
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ProfilYorumlarPage({ params, searchParams }: Props) {
  const { username } = await params
  const { sirala = 'yeni', tip = 'hepsi', sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { t } = await getTranslations()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('user_id', profile.id)

  if (tip !== 'hepsi') query = query.eq('media_type', tip)

  if (sirala === 'puan-yuksek') query = query.order('rating', { ascending: false })
  else if (sirala === 'puan-dusuk') query = query.order('rating', { ascending: true })
  else if (sirala === 'begeni') query = query.order('likes_count', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: reviews, count } = await query.range(offset, offset + PAGE_SIZE - 1)

  const enriched = await Promise.all(
    (reviews ?? []).map(async (r: any) => {
      try {
        const detail = r.media_type === 'film' ? await getMovieDetail(r.media_id) : await getSeriesDetail(r.media_id)
        return { ...r, title: getMediaTitle(detail), poster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null }
      } catch {
        return { ...r, title: `#${r.media_id}`, poster: null }
      }
    })
  )

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1
  const card = { background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }

  const buildHref = (params: Record<string, string>) => {
    const base = new URLSearchParams({ sirala, tip, ...params })
    return `/profil/${username}/yorumlar?${base}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Geri */}
      <Link href={`/profil/${username}`} className="text-sm hover:text-white transition-colors mb-6 inline-flex items-center gap-1"
        style={{ color: 'rgba(255,255,255,0.4)' }}>
        <IconArrowLeft size={14} /> @{username}
      </Link>

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt={username} className="h-10 w-10 rounded-full object-cover" />
          : <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>
              {username[0]?.toUpperCase()}
            </div>
        }
        <div>
          <h1 className="text-xl font-bold text-white">
            {t('profile.reviewsTab.title', { name: profile.full_name ? `${profile.full_name}'in` : `@${username}'in` })}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('profile.reviewsTab.reviewCount', { count: count ?? 0 })}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'hepsi', label: t('common.all'), icon: null },
          { id: 'film', label: t('film.badge'), icon: IconFilm },
          { id: 'dizi', label: t('series.badge'), icon: IconTv },
        ].map(f => (
          <Link key={f.id} href={buildHref({ tip: f.id, sayfa: '1' })}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5"
            style={f.id === tip
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: 'white' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
            {f.icon && <f.icon size={12} />} {f.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'yeni', label: t('list.sortNewest'), icon: null },
          { id: 'puan-yuksek', label: t('profile.reviewsTab.highRating'), icon: IconStarFilled },
          { id: 'puan-dusuk', label: t('profile.reviewsTab.lowRating'), icon: IconStarFilled },
          { id: 'begeni', label: t('profile.reviewsTab.mostLiked'), icon: IconHeartFilled },
        ].map(s => (
          <Link key={s.id} href={buildHref({ sirala: s.id, sayfa: '1' })}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all inline-flex items-center gap-1.5"
            style={s.id === sirala
              ? { background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
            {s.icon && <s.icon size={12} />} {s.label}
          </Link>
        ))}
      </div>

      {/* Yorumlar */}
      {enriched.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="flex justify-center mb-3"><IconPencil size={32} /></p>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>{t('profile.reviewsTab.empty')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {enriched.map((r: any) => (
              <div key={r.id} className="flex gap-4 p-4 rounded-2xl" style={card}>
                <Link href={`/${r.media_type}/${r.media_id}`} prefetch={false}
                  className="shrink-0 w-14 h-[84px] rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {r.poster
                    ? <img src={r.poster} alt={r.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center">
                        {r.media_type === 'film' ? <IconFilm size={20} /> : <IconTv size={20} />}
                      </div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/${r.media_type}/${r.media_id}`} prefetch={false}
                      className="font-bold text-sm text-white hover:text-[--accent] transition-colors line-clamp-1">
                      {r.title}
                    </Link>
                    <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)' }}>
                      <span className="text-xs font-black" style={{ color: '#D4A843' }}>{r.rating}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(212,168,67,0.5)' }}>/10</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${r.media_type === 'film' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                      {r.media_type === 'film' ? t('film.badge') : t('series.badge')}
                    </span>
                    {r.has_spoiler && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
                        style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                        <IconAlertTriangle size={10} /> {t('profile.reviewsTab.spoiler')}
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {timeAgo(r.created_at, t)}
                    </span>
                    {(r.likes_count ?? 0) > 0 && (
                      <span className="text-[11px] inline-flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <IconHeartFilled size={11} /> {r.likes_count}
                      </span>
                    )}
                  </div>
                  {r.content && (
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {r.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link href={buildHref({ sayfa: String(page - 1) })}
                  className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/5 inline-flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <IconChevronLeft size={14} /> {t('common.prev')}
                </Link>
              )}
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{page} / {totalPages}</span>
              {page < totalPages && (
                <Link href={buildHref({ sayfa: String(page + 1) })}
                  className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/5 inline-flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {t('common.next')} <IconChevronRight size={14} />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
