import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl, getMediaTitle, getSeriesDetail } from '@/lib/tmdb'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconArrowLeft, IconTv, IconCalendarDays, IconChevronLeft, IconChevronRight } from '@/components/icons'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ sayfa?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — Bölümler | Sinezon`,
    description: `${username} kullanıcısının izlediği dizi bölümleri.`,
  }
}

const PAGE_SIZE = 20

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ProfilBolumlerPage({ params, searchParams }: Props) {
  const { username } = await params
  const { sayfa } = await searchParams
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

  const { data: watches, count } = await supabase
    .from('episode_watches')
    .select('*', { count: 'exact' })
    .eq('user_id', profile.id)
    .order('watched_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const enriched = await Promise.all(
    (watches ?? []).map(async (w: any) => {
      try {
        const detail = await getSeriesDetail(w.series_id)
        return {
          ...w,
          title: getMediaTitle(detail),
          poster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null,
        }
      } catch {
        return { ...w, title: `#${w.series_id}`, poster: null }
      }
    })
  )

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1
  const name = profile.full_name ?? `@${username}`

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Geri */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profil/${username}`} className="text-sm hover:text-white transition-colors inline-flex items-center gap-1"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <IconArrowLeft size={14} /> @{username}
        </Link>
      </div>

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
            {t('profile.episodesTab.title', { name })}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('profile.episodesTab.recordCount', { count: count ?? 0 })}
          </p>
        </div>
      </div>

      {enriched.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl text-center" style={card}>
          <p className="mb-4 flex justify-center" style={{ color: 'rgba(255,255,255,0.3)' }}><IconTv size={48} /></p>
          <p className="text-base font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('profile.episodesTab.empty')}
          </p>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {t('profile.episodesTab.emptyHint')}
          </p>
          <Link href="/diziler"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 14px rgba(225,29,72,0.25)' }}>
            <IconTv size={16} /> {t('profile.episodesTab.exploreSeries')}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {enriched.map((w: any) => (
              <Link key={`${w.series_id}-${w.season_number}-${w.episode_number}`}
                href={`/dizi/${w.series_id}/sezon/${w.season_number}`} prefetch={false}
                className="flex gap-4 p-4 rounded-xl transition-transform duration-150 hover:-translate-y-0.5" style={card}>
                <div className="shrink-0 w-12 h-[72px] rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {w.poster
                    ? <img src={w.poster} alt={w.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><IconTv size={20} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-white line-clamp-1">{w.title}</span>
                    {w.rating && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-black" style={{ color: '#D4A843' }}>{w.rating}</span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/10</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {t('profile.episodesTab.seasonEpisode', { season: w.season_number, episode: w.episode_number })}
                    </span>
                    {w.watched_at && (
                      <span className="text-[11px] inline-flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <IconCalendarDays size={12} /> {formatDate(w.watched_at)}
                      </span>
                    )}
                  </div>
                  {w.review && (
                    <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      &ldquo;{w.review}&rdquo;
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link href={`/profil/${username}/bolumler?sayfa=${page - 1}`}
                  className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/5 inline-flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <IconChevronLeft size={14} /> {t('common.prev')}
                </Link>
              )}
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/profil/${username}/bolumler?sayfa=${page + 1}`}
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
