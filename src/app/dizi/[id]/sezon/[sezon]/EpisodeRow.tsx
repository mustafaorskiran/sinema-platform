'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/context/LocaleContext'

interface Episode {
  episode_number: number
  name: string
  overview?: string
  air_date?: string
  runtime?: number
  still_path?: string
}

interface Props {
  episode: Episode
  seriesId: number
  seasonNumber: number
  isWatched: boolean
  isLoggedIn: boolean
}

export default function EpisodeRow({ episode, seriesId, seasonNumber, isWatched: initialWatched, isLoggedIn }: Props) {
  const { t } = useLocale()
  const [watched, setWatched] = useState(initialWatched)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function toggle() {
    if (!isLoggedIn || loading) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    if (watched) {
      await supabase.from('episode_watches')
        .delete()
        .eq('user_id', user.id)
        .eq('series_id', seriesId)
        .eq('season_number', seasonNumber)
        .eq('episode_number', episode.episode_number)
    } else {
      await supabase.from('episode_watches').upsert({
        user_id: user.id,
        series_id: seriesId,
        season_number: seasonNumber,
        episode_number: episode.episode_number,
        watched_at: new Date().toISOString(),
      }, { onConflict: 'user_id,series_id,season_number,episode_number', ignoreDuplicates: true })
    }
    setWatched(!watched)
    setLoading(false)
  }

  const stillUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
    : null

  return (
    <div
      className="rounded-xl transition-all"
      style={{
        background: watched
          ? 'linear-gradient(160deg, rgba(225,29,72,0.06), rgba(14,20,32,0.9))'
          : 'linear-gradient(160deg, rgba(20,28,47,0.8), rgba(14,20,32,0.85))',
        border: watched ? '1px solid rgba(225,29,72,0.15)' : '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail */}
        <button
          onClick={() => episode.overview && setExpanded(!expanded)}
          className="shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-white/5 relative"
        >
          {stillUrl
            ? <img src={stillUrl} alt={episode.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-lg" style={{ color: 'rgba(255,255,255,0.2)' }}>▶</div>
          }
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => episode.overview && setExpanded(!expanded)}>
          <p className="text-xs font-bold text-white leading-tight">
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>B{String(episode.episode_number).padStart(2, '0')} · </span>
            {episode.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {episode.air_date && (
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {new Date(episode.air_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {episode.runtime && (
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                · {episode.runtime} {t('film.runtime')}
              </span>
            )}
          </div>
        </div>

        {/* Watch toggle */}
        {isLoggedIn && (
          <button
            onClick={toggle}
            disabled={loading}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 hover:scale-105"
            style={watched
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: 'white' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
            }
            title={watched ? t('series.markUnwatched') : t('series.markWatched')}
          >
            {loading ? (
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Overview expand */}
      {expanded && episode.overview && (
        <div className="px-3 pb-3">
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {episode.overview}
          </p>
        </div>
      )}
    </div>
  )
}
