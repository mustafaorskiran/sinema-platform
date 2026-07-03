import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSeriesDetail, getSeasonDetail, getMediaTitle, getPosterUrl } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import EpisodeRow from './EpisodeRow'
import { IconTv } from '@/components/icons'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string; sezon: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, sezon } = await params
  const { t } = await getTranslations()
  try {
    const series = await getSeriesDetail(Number(id))
    const title = getMediaTitle(series)
    return { title: `${title} — ${t('series.seasonNumber', { n: sezon })} | Sinezon` }
  } catch {
    return { title: `${t('series.seasonNumber', { n: sezon })} | Sinezon` }
  }
}

export default async function SezonPage({ params }: Props) {
  const { id, sezon } = await params
  const { t } = await getTranslations()
  const seriesId = Number(id)
  const seasonNumber = Number(sezon)

  if (isNaN(seriesId) || isNaN(seasonNumber)) notFound()

  const [series, season] = await Promise.all([
    getSeriesDetail(seriesId).catch(() => null),
    getSeasonDetail(seriesId, seasonNumber).catch(() => null),
  ])

  if (!series || !season) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Kullanıcının bu sezondaki izleme kayıtları
  let watchedSet = new Set<number>()
  if (user) {
    const { data: watched } = await supabase
      .from('episode_watches')
      .select('episode_number')
      .eq('user_id', user.id)
      .eq('series_id', seriesId)
      .eq('season_number', seasonNumber)
    for (const row of watched ?? []) {
      watchedSet.add(row.episode_number)
    }
  }

  const title = getMediaTitle(series)
  const episodes: any[] = season.episodes ?? []
  const watchedCount = episodes.filter(e => watchedSet.has(e.episode_number)).length

  const totalSeasons = (series.seasons ?? []).filter((s: any) => s.season_number > 0).length

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <Link href={`/dizi/${seriesId}`} className="hover:text-white transition-colors">{title}</Link>
        <span>/</span>
        <span className="text-white">{t('series.seasonNumber', { n: seasonNumber })}</span>
      </nav>

      {/* Sezon başlığı */}
      <div className="flex gap-4 mb-8">
        {season.poster_path && (
          <img
            src={getPosterUrl(season.poster_path, 'w342') ?? ''}
            alt={t('series.seasonNumber', { n: seasonNumber })}
            className="w-24 h-36 rounded-xl object-cover shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          />
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white mb-1 leading-tight">{title}</h1>
          <p className="text-sm sm:text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('series.seasonNumber', { n: seasonNumber })} — {episodes.length} {t('series.episodes')}
          </p>
          {user && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 rounded-full overflow-hidden flex-1 max-w-[160px]"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${episodes.length > 0 ? (watchedCount / episodes.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #E11D48, #be123c)' }} />
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {watchedCount}/{episodes.length} {t('series.watchedLabel')}
              </span>
            </div>
          )}
          {(season as any).overview && (
            <p className="text-sm mt-3 leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {(season as any).overview}
            </p>
          )}
        </div>
      </div>

      {/* Sezon navigasyonu */}
      {totalSeasons > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
            <Link key={s} href={`/dizi/${seriesId}/sezon/${s}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={s === seasonNumber
                ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
              {t('series.seasonNumber', { n: s })}
            </Link>
          ))}
        </div>
      )}

      {/* Bölüm listesi */}
      <div className="space-y-2">
        {episodes.map((ep: any) => (
          <EpisodeRow
            key={ep.episode_number}
            episode={ep}
            seriesId={seriesId}
            seasonNumber={seasonNumber}
            isWatched={watchedSet.has(ep.episode_number)}
            isLoggedIn={!!user}
          />
        ))}
      </div>

      {episodes.length === 0 && (
        <div className="text-center py-12 rounded-2xl" style={card}>
          <p className="mb-2 flex justify-center" style={{ color: 'rgba(255,255,255,0.35)' }}><IconTv size={32} /></p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('series.noEpisodesInfo')}</p>
        </div>
      )}

      {/* Sezon navigasyon okları */}
      <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {seasonNumber > 1 ? (
          <Link href={`/dizi/${seriesId}/sezon/${seasonNumber - 1}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 hover:-translate-x-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            ← {t('series.seasonNumber', { n: seasonNumber - 1 })}
          </Link>
        ) : (
          <div />
        )}

        {seasonNumber < totalSeasons ? (
          <Link href={`/dizi/${seriesId}/sezon/${seasonNumber + 1}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 hover:translate-x-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            {t('series.seasonNumber', { n: seasonNumber + 1 })} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
