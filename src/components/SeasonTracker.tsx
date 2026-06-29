'use client'

import { useState, useEffect } from 'react'

interface Episode {
  episode_number: number
  name: string
  air_date?: string
  still_path?: string | null
}

interface Season {
  season_number: number
  name: string
  episode_count: number
  episodes?: Episode[]
}

interface Props {
  seriesId: number
  seasons: Season[]
  isLoggedIn: boolean
}

export default function SeasonTracker({ seriesId, seasons, isLoggedIn }: Props) {
  const [watched, setWatched] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState(seasons[0]?.season_number ?? 1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return }
    fetch(`/api/episode-progress?series_id=${seriesId}`)
      .then(r => r.json())
      .then(d => {
        const set = new Set<string>((d.watched ?? []).map((w: { season: number; episode: number }) => `${w.season}-${w.episode}`))
        setWatched(set)
      })
      .finally(() => setLoading(false))
  }, [seriesId, isLoggedIn])

  useEffect(() => {
    if (!activeSeason) return
    setEpisodesLoading(true)
    fetch(`/api/season-episodes?series_id=${seriesId}&season=${activeSeason}`)
      .then(r => r.json())
      .then(d => setEpisodes(d.episodes ?? []))
      .catch(() => setEpisodes([]))
      .finally(() => setEpisodesLoading(false))
  }, [activeSeason, seriesId])

  async function toggle(season: number, episode: number) {
    if (!isLoggedIn || toggling) return
    const key = `${season}-${episode}`
    setToggling(key)
    const isWatched = watched.has(key)

    setWatched(prev => {
      const next = new Set(prev)
      isWatched ? next.delete(key) : next.add(key)
      return next
    })

    try {
      await fetch('/api/episode-progress', {
        method: isWatched ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ series_id: seriesId, season, episode }),
      })
    } catch {
      setWatched(prev => {
        const next = new Set(prev)
        isWatched ? next.add(key) : next.delete(key)
        return next
      })
    } finally {
      setToggling(null)
    }
  }

  async function markSeasonAll(season: number, episodeCount: number, mark: boolean) {
    for (let ep = 1; ep <= episodeCount; ep++) {
      const key = `${season}-${ep}`
      const isWatched = watched.has(key)
      if (mark === isWatched) continue
      await fetch('/api/episode-progress', {
        method: mark ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ series_id: seriesId, season, episode: ep }),
      })
    }
    setWatched(prev => {
      const next = new Set(prev)
      for (let ep = 1; ep <= episodeCount; ep++) {
        mark ? next.add(`${season}-${ep}`) : next.delete(`${season}-${ep}`)
      }
      return next
    })
  }

  const activeSeas = seasons.find(s => s.season_number === activeSeason)
  const seasonWatchedCount = activeSeas
    ? Array.from({ length: activeSeas.episode_count }, (_, i) => i + 1).filter(ep => watched.has(`${activeSeason}-${ep}`)).length
    : 0
  const allWatched = activeSeas ? seasonWatchedCount === activeSeas.episode_count : false

  const totalWatched = watched.size
  const totalEpisodes = seasons.filter(s => s.season_number > 0).reduce((s, sea) => s + sea.episode_count, 0)

  return (
    <div className="mt-10" id="bolumler">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Bölüm Takibi</h2>
        {isLoggedIn && !loading && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(212,168,67,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,168,67,0.2)' }}>
            {totalWatched}/{totalEpisodes} izlendi
          </span>
        )}
      </div>

      {/* Sezon sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-5">
        {seasons.filter(s => s.season_number > 0).map(s => {
          const isActive = s.season_number === activeSeason
          const count = Array.from({ length: s.episode_count }, (_, i) => i + 1).filter(ep => watched.has(`${s.season_number}-${ep}`)).length
          return (
            <button
              key={s.season_number}
              onClick={() => setActiveSeason(s.season_number)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={isActive
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {s.name ?? `Sezon ${s.season_number}`}
              {isLoggedIn && count > 0 && <span className="ml-1.5 opacity-70">({count}/{s.episode_count})</span>}
            </button>
          )
        })}
      </div>

      {/* Tümünü işaretle */}
      {isLoggedIn && activeSeas && (
        <div className="flex items-center justify-between mb-4">
          <div className="h-1.5 flex-1 mr-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${activeSeas.episode_count > 0 ? (seasonWatchedCount / activeSeas.episode_count) * 100 : 0}%`,
              background: allWatched ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, #D4A843, #E11D48)',
            }} />
          </div>
          <button
            onClick={() => markSeasonAll(activeSeason, activeSeas.episode_count, !allWatched)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          >
            {allWatched ? 'Tümünü Kaldır' : 'Tümünü İzlendi'}
          </button>
        </div>
      )}

      {/* Bölümler */}
      {episodesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {episodes.map(ep => {
            const key = `${activeSeason}-${ep.episode_number}`
            const isWatched = watched.has(key)
            const isToggling = toggling === key
            return (
              <button
                key={ep.episode_number}
                onClick={() => toggle(activeSeason, ep.episode_number)}
                disabled={!isLoggedIn || isToggling}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed"
                style={{
                  background: isWatched ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.025)',
                  border: isWatched ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={isWatched
                    ? { background: 'rgba(74,222,128,0.15)', border: '1.5px solid rgba(74,222,128,0.4)' }
                    : { border: '1.5px solid rgba(255,255,255,0.12)' }
                  }>
                  {isWatched && <span className="text-[10px] text-green-400">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      B{ep.episode_number}
                    </span>
                    <span className="text-xs font-medium truncate" style={{ color: isWatched ? '#4ade80' : 'rgba(255,255,255,0.7)' }}>
                      {ep.name}
                    </span>
                  </div>
                  {ep.air_date && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {new Date(ep.air_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-xs text-center mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Bölümleri işaretlemek için <a href="/auth/giris" className="underline" style={{ color: 'var(--accent)' }}>giriş yap</a>
        </p>
      )}
    </div>
  )
}
