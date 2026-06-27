'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TMDbSeason } from '@/lib/tmdb'

interface WatchedEpisode {
  season_number: number
  episode_number: number
  rating: number | null
  review: string | null
}

interface Props {
  seriesId: number
  seasons: { season_number: number; name: string; episode_count: number; poster_path: string | null }[]
  isLoggedIn: boolean
}

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function SeasonTracker({ seriesId, seasons, isLoggedIn }: Props) {
  const [openSeason, setOpenSeason] = useState<number | null>(null)
  const [seasonData, setSeasonData] = useState<Record<number, TMDbSeason>>({})
  const [watched, setWatched] = useState<Set<string>>(new Set())
  const [epRatings, setEpRatings] = useState<Map<string, number | null>>(new Map())
  const [epReviews, setEpReviews] = useState<Map<string, string>>(new Map())
  const [ratingOpen, setRatingOpen] = useState<string | null>(null)
  const [expandedEp, setExpandedEp] = useState<string | null>(null)
  const [reviewDraft, setReviewDraft] = useState<Record<string, string>>({})
  const [savingReview, setSavingReview] = useState<string | null>(null)
  const [loadingSeason, setLoadingSeason] = useState(false)

  const epKey = (s: number, e: number) => `${s}-${e}`

  useEffect(() => {
    if (!isLoggedIn) return
    fetch(`/api/episode-watches?series_id=${seriesId}`)
      .then(r => r.json())
      .then(({ watched: list }: { watched: WatchedEpisode[] }) => {
        const watchedSet = new Set<string>()
        const ratingsMap = new Map<string, number | null>()
        const reviewsMap = new Map<string, string>()
        for (const w of list ?? []) {
          const k = epKey(w.season_number, w.episode_number)
          watchedSet.add(k)
          ratingsMap.set(k, w.rating)
          if (w.review) reviewsMap.set(k, w.review)
        }
        setWatched(watchedSet)
        setEpRatings(ratingsMap)
        setEpReviews(reviewsMap)
      })
  }, [seriesId, isLoggedIn])

  const openSeasonPanel = useCallback(async (seasonNumber: number) => {
    if (openSeason === seasonNumber) { setOpenSeason(null); return }
    setOpenSeason(seasonNumber)
    if (seasonData[seasonNumber]) return
    setLoadingSeason(true)
    try {
      const res = await fetch(`/api/season-detail?series_id=${seriesId}&season=${seasonNumber}`)
      const data: TMDbSeason = await res.json()
      setSeasonData(prev => ({ ...prev, [seasonNumber]: data }))
    } finally {
      setLoadingSeason(false)
    }
  }, [openSeason, seasonData, seriesId])

  const toggleEpisode = useCallback(async (seasonNumber: number, episodeNumber: number) => {
    if (!isLoggedIn) return
    const k = epKey(seasonNumber, episodeNumber)
    const isWatched = watched.has(k)

    setWatched(prev => {
      const next = new Set(prev)
      if (isWatched) next.delete(k)
      else next.add(k)
      return next
    })

    if (isWatched) {
      setEpRatings(prev => { const next = new Map(prev); next.delete(k); return next })
      setEpReviews(prev => { const next = new Map(prev); next.delete(k); return next })
      setRatingOpen(null)
      setExpandedEp(null)
    }

    await fetch('/api/episode-watches', {
      method: isWatched ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: seriesId, season_number: seasonNumber, episode_number: episodeNumber }),
    })
  }, [isLoggedIn, watched, seriesId])

  const rateEpisode = useCallback(async (seasonNumber: number, episodeNumber: number, rating: number | null) => {
    if (!isLoggedIn) return
    const k = epKey(seasonNumber, episodeNumber)
    setEpRatings(prev => { const next = new Map(prev); next.set(k, rating); return next })
    setRatingOpen(null)

    await fetch('/api/episode-watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: seriesId, season_number: seasonNumber, episode_number: episodeNumber, rating }),
    })
  }, [isLoggedIn, seriesId])

  const saveReview = useCallback(async (seasonNumber: number, episodeNumber: number) => {
    if (!isLoggedIn) return
    const k = epKey(seasonNumber, episodeNumber)
    const text = (reviewDraft[k] ?? epReviews.get(k) ?? '').trim()
    setSavingReview(k)

    setEpReviews(prev => {
      const next = new Map(prev)
      if (text) next.set(k, text)
      else next.delete(k)
      return next
    })

    await fetch('/api/episode-watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        series_id: seriesId,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        rating: epRatings.get(k) ?? null,
        review: text || null,
      }),
    })

    setSavingReview(null)
    setReviewDraft(prev => { const next = { ...prev }; delete next[k]; return next })
  }, [isLoggedIn, seriesId, reviewDraft, epReviews, epRatings])

  const markAllSeason = useCallback(async (seasonNumber: number, episodes: TMDbSeason['episodes']) => {
    if (!isLoggedIn) return
    const allWatched = episodes.every(ep => watched.has(epKey(seasonNumber, ep.episode_number)))
    const method = allWatched ? 'DELETE' : 'POST'

    setWatched(prev => {
      const next = new Set(prev)
      for (const ep of episodes) {
        if (allWatched) next.delete(epKey(seasonNumber, ep.episode_number))
        else next.add(epKey(seasonNumber, ep.episode_number))
      }
      return next
    })

    await Promise.all(episodes.map(ep =>
      fetch('/api/episode-watches', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ series_id: seriesId, season_number: seasonNumber, episode_number: ep.episode_number }),
      })
    ))
  }, [isLoggedIn, watched, seriesId])

  const totalEpisodes = seasons.reduce((s, se) => s + se.episode_count, 0)
  const watchedCount = watched.size
  const progressPct = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0

  const seasonWatchedCount = (seasonNumber: number) => {
    let w = 0
    for (const k of watched) { if (k.startsWith(`${seasonNumber}-`)) w++ }
    return w
  }

  const seasonProgress = (seasonNumber: number, count: number) => {
    const w = seasonWatchedCount(seasonNumber)
    return count > 0 ? Math.round((w / count) * 100) : 0
  }

  const seasonAvg = (seasonNumber: number) => {
    const vals: number[] = []
    for (const [k, r] of epRatings) {
      if (k.startsWith(`${seasonNumber}-`) && r !== null) vals.push(r)
    }
    if (vals.length === 0) return null
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  const filteredSeasons = seasons.filter(s => s.season_number > 0)

  return (
    <div className="mt-10">
      {/* Başlık + Genel İlerleme */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white">Sezon & Bölüm Takibi</h2>
        {isLoggedIn && totalEpisodes > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[--text-secondary]">
              <span className="text-white font-semibold">{watchedCount}</span>/{totalEpisodes} bölüm
            </span>
            <div className="w-28 h-2 rounded-full bg-[--bg-secondary] overflow-hidden">
              <div
                className="h-full rounded-full bg-[--accent] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-[--accent]">%{progressPct}</span>
          </div>
        )}
      </div>

      {!isLoggedIn && (
        <p className="text-sm text-[--text-secondary] mb-4">
          Bölüm takibi ve yorum için{' '}
          <a href="/auth/giris" className="text-[--accent] hover:underline">giriş yap</a>.
        </p>
      )}

      {/* Sezon listesi */}
      <div className="space-y-2">
        {filteredSeasons.map(season => {
          const pct = seasonProgress(season.season_number, season.episode_count)
          const watchedN = seasonWatchedCount(season.season_number)
          const avg = seasonAvg(season.season_number)
          const isOpen = openSeason === season.season_number
          const data = seasonData[season.season_number]

          return (
            <div key={season.season_number} className="rounded-xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Sezon başlık satırı */}
              <button
                onClick={() => openSeasonPanel(season.season_number)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                {season.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${season.poster_path}`}
                    alt={season.name}
                    className="h-10 w-7 rounded object-cover shrink-0 hidden sm:block"
                  />
                )}
                <span className="text-white font-semibold flex-1 truncate">{season.name}</span>
                {avg && <span className="text-xs text-[--gold] font-semibold shrink-0">★ {avg}</span>}
                <span className="text-xs text-[--text-secondary] shrink-0">{season.episode_count} bölüm</span>
                {isLoggedIn && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[--text-secondary]">{watchedN}/{season.episode_count}</span>
                    <div className="w-16 h-1.5 rounded-full bg-[--bg-primary] overflow-hidden">
                      <div className="h-full rounded-full bg-[--accent] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-[--text-secondary] w-8 text-right">%{pct}</span>
                  </div>
                )}
                <span className="text-[--text-secondary] text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Bölüm listesi */}
              {isOpen && (
                <div className="border-t border-[--border] bg-[--bg-primary]">
                  {loadingSeason && !data ? (
                    <div className="p-6 text-center text-sm text-[--text-secondary]">Yükleniyor…</div>
                  ) : data ? (
                    <>
                      {isLoggedIn && (
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                          <button
                            onClick={() => markAllSeason(season.season_number, data.episodes)}
                            className="text-xs text-[--accent] hover:underline"
                          >
                            {data.episodes.every(ep => watched.has(epKey(season.season_number, ep.episode_number)))
                              ? 'Tümünü geri al'
                              : 'Tümünü izledim'}
                          </button>
                          <span className="text-xs text-[--text-secondary]">
                            {watchedN} / {data.episodes.length} bölüm izlendi
                          </span>
                        </div>
                      )}

                      <div className="divide-y divide-[--border]/40">
                        {data.episodes.map(ep => {
                          const k = epKey(season.season_number, ep.episode_number)
                          const isWatched = watched.has(k)
                          const epRating = epRatings.get(k) ?? null
                          const epReview = epReviews.get(k) ?? ''
                          const isRatingOpen = ratingOpen === k
                          const isEpExpanded = expandedEp === k
                          const currentDraft = reviewDraft[k] ?? epReview
                          const hasDetail = !!(ep.overview || (isLoggedIn && isWatched) || isLoggedIn)

                          return (
                            <div key={ep.episode_number}>
                              {/* Compact satır */}
                              <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 transition-colors ${isEpExpanded ? 'bg-[--bg-card]/60' : 'hover:bg-[--bg-card]/30'}`}>

                                {/* İzlendi checkbox */}
                                {isLoggedIn ? (
                                  <button
                                    onClick={() => toggleEpisode(season.season_number, ep.episode_number)}
                                    title={isWatched ? 'İzlenmedi olarak işaretle' : 'İzledim'}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                      isWatched
                                        ? 'bg-[--accent] border-[--accent] text-white'
                                        : 'border-[--border] hover:border-[--accent]/60'
                                    }`}
                                  >
                                    {isWatched && <span className="text-[10px] leading-none">✓</span>}
                                  </button>
                                ) : (
                                  <div className="w-5 h-5 rounded border-2 border-[--border] shrink-0 opacity-40" />
                                )}

                                {/* Still görseli */}
                                {ep.still_path && (
                                  <div className="shrink-0 w-16 sm:w-20 rounded-md overflow-hidden bg-[--bg-secondary]">
                                    <img
                                      src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                      alt={ep.name}
                                      className="w-full aspect-video object-cover"
                                    />
                                  </div>
                                )}

                                {/* Bölüm bilgisi */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="text-[10px] text-[--text-secondary] shrink-0 font-mono tabular-nums">
                                      B{ep.episode_number.toString().padStart(2, '0')}
                                    </span>
                                    <span className={`text-sm font-medium truncate leading-snug ${isWatched ? 'text-[--text-secondary]' : 'text-white'}`}>
                                      {ep.name}
                                    </span>
                                    {ep.runtime && (
                                      <span className="text-[10px] text-[--text-secondary] shrink-0">{ep.runtime}dk</span>
                                    )}
                                  </div>
                                  {ep.air_date && (
                                    <p className="text-[10px] text-[--text-secondary] mt-0.5">
                                      {new Date(ep.air_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                  )}
                                  {/* Mevcut yorum önizlemesi */}
                                  {epReview && !isEpExpanded && (
                                    <p className="text-[10px] text-[--text-secondary]/70 mt-0.5 truncate">
                                      💬 {epReview}
                                    </p>
                                  )}
                                </div>

                                {/* Sağ: puan + detay aç */}
                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Puan butonu */}
                                  {isLoggedIn && isWatched && (
                                    <div className="relative">
                                      <button
                                        onClick={() => setRatingOpen(isRatingOpen ? null : k)}
                                        className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                                          epRating
                                            ? 'border-[--gold]/40 bg-[--gold]/10 text-[--gold] font-semibold'
                                            : 'border-[--border] text-[--text-secondary] hover:border-[--accent]/40 hover:text-white'
                                        }`}
                                      >
                                        {epRating ? `★ ${epRating}` : '+ puan'}
                                      </button>

                                      {isRatingOpen && (
                                        <div className="absolute right-0 bottom-full mb-1 z-30 rounded-xl p-2.5 shadow-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                                          <p className="text-[10px] text-[--text-secondary] mb-2 text-center">Puan ver (1-10)</p>
                                          <div className="grid grid-cols-5 gap-1">
                                            {RATINGS.map(r => (
                                              <button
                                                key={r}
                                                onClick={() => rateEpisode(season.season_number, ep.episode_number, r)}
                                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                                                  epRating === r
                                                    ? 'bg-[--gold] text-black'
                                                    : 'bg-[--bg-secondary] text-white hover:bg-[--accent]'
                                                }`}
                                              >
                                                {r}
                                              </button>
                                            ))}
                                          </div>
                                          {epRating && (
                                            <button
                                              onClick={() => rateEpisode(season.season_number, ep.episode_number, null)}
                                              className="w-full mt-2 text-[10px] text-[--text-secondary] hover:text-white transition-colors"
                                            >
                                              Puanı sil
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Detay aç/kapat */}
                                  {hasDetail && (
                                    <button
                                      onClick={() => setExpandedEp(isEpExpanded ? null : k)}
                                      title={isEpExpanded ? 'Kapat' : 'Özet & yorum'}
                                      className={`p-1.5 rounded-lg border text-[10px] transition-colors ${
                                        isEpExpanded
                                          ? 'border-[--accent]/40 bg-[--accent]/10 text-[--accent]'
                                          : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-white/20'
                                      }`}
                                    >
                                      {isEpExpanded ? '▲' : '▼'}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Genişletilmiş: geniş görsel + özet + yorum */}
                              {isEpExpanded && (
                                <div className="px-3 sm:px-4 pb-4 pt-3 bg-[--bg-card]/20 border-t border-[--border]/30">
                                  <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Geniş still görsel */}
                                    {ep.still_path && (
                                      <div className="shrink-0 sm:w-52">
                                        <img
                                          src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                          alt={ep.name}
                                          className="w-full rounded-lg object-cover aspect-video border border-[--border]"
                                        />
                                        <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[10px] text-[--text-secondary]">
                                          <span>S{season.season_number.toString().padStart(2, '0')}B{ep.episode_number.toString().padStart(2, '0')}</span>
                                          {ep.runtime && <span>· {ep.runtime} dk</span>}
                                          {ep.air_date && (
                                            <span>
                                              · {new Date(ep.air_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                      {/* Bölüm özeti */}
                                      {ep.overview ? (
                                        <p className="text-sm text-[--text-secondary] leading-relaxed mb-4">
                                          {ep.overview}
                                        </p>
                                      ) : (
                                        <p className="text-xs text-[--text-secondary] italic mb-3">Bölüm özeti mevcut değil.</p>
                                      )}

                                      {/* Bölüm yorumu */}
                                      {isLoggedIn && isWatched ? (
                                        <div>
                                          <p className="text-xs font-medium text-[--text-secondary] mb-1.5">Bölüm yorumun</p>
                                          <textarea
                                            value={currentDraft}
                                            onChange={e => {
                                              if (e.target.value.length <= 500) {
                                                setReviewDraft(prev => ({ ...prev, [k]: e.target.value }))
                                              }
                                            }}
                                            placeholder="Bu bölüm hakkında ne düşündün?"
                                            rows={3}
                                            className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
                                          />
                                          <div className="flex items-center justify-between mt-1.5">
                                            <span className={`text-[10px] ${currentDraft.length >= 480 ? 'text-yellow-400' : 'text-[--text-secondary]'}`}>
                                              {currentDraft.length}/500
                                            </span>
                                            <button
                                              onClick={() => saveReview(season.season_number, ep.episode_number)}
                                              disabled={savingReview === k || currentDraft === epReview}
                                              className="text-xs px-4 py-1.5 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-medium transition-colors disabled:opacity-40"
                                            >
                                              {savingReview === k ? 'Kaydediliyor…' : 'Kaydet'}
                                            </button>
                                          </div>
                                        </div>
                                      ) : isLoggedIn && !isWatched ? (
                                        <p className="text-xs text-[--text-secondary]">
                                          Yorum yazmak için önce{' '}
                                          <button
                                            onClick={() => toggleEpisode(season.season_number, ep.episode_number)}
                                            className="text-[--accent] hover:underline"
                                          >
                                            izledim olarak işaretle
                                          </button>
                                          .
                                        </p>
                                      ) : (
                                        <p className="text-xs text-[--text-secondary]">
                                          Yorum yazmak için{' '}
                                          <a href="/auth/giris" className="text-[--accent] hover:underline">giriş yap</a>.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
