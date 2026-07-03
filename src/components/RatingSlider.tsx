'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  siteAvg: number | null
  siteVoteCount: number
  imdbAvg: number
  imdbVoteCount: number
  userRating: number | null
  isLoggedIn: boolean
}

function formatVote(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}B`
  return n.toLocaleString('tr-TR')
}

export default function RatingSlider({
  mediaId, mediaType, siteAvg, siteVoteCount, imdbAvg, imdbVoteCount, userRating, isLoggedIn,
}: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [value, setValue]       = useState<number>(userRating ?? 5)
  const [saved, setSaved]       = useState<number | null>(userRating)
  const [saving, setSaving]     = useState(false)
  const [dragging, setDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const calcValue = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return value
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return Math.round(pct * 90 + 10) / 10  // 1.0 – 10.0, tek ondalık
  }, [value])

  async function saveRating(v: number) {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setSaving(true)
    const res = await fetch('/api/quick-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, rating: v }),
    })
    if (res.ok) { setSaved(v); router.refresh() }
    setSaving(false)
  }

  async function clearRating() {
    if (!isLoggedIn) return
    setSaving(true)
    await fetch('/api/quick-rate', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType }),
    })
    setSaved(null)
    setValue(5)
    router.refresh()
    setSaving(false)
  }

  // Mouse handlers
  function onMouseDown(e: React.MouseEvent) {
    setDragging(true)
    const v = calcValue(e.clientX)
    setValue(v)
    const onMove = (ev: MouseEvent) => setValue(calcValue(ev.clientX))
    const onUp   = (ev: MouseEvent) => {
      setDragging(false)
      const final = calcValue(ev.clientX)
      setValue(final)
      saveRating(final)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Touch handlers
  function onTouchStart(e: React.TouchEvent) {
    setDragging(true)
    const v = calcValue(e.touches[0].clientX)
    setValue(v)
    const onMove = (ev: TouchEvent) => setValue(calcValue(ev.touches[0].clientX))
    const onEnd  = (ev: TouchEvent) => {
      setDragging(false)
      const final = calcValue(ev.changedTouches[0].clientX)
      setValue(final)
      saveRating(final)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onEnd)
  }

  const pct = ((value - 1) / 9) * 100  // 1→0%, 10→100%
  const displayVal = dragging ? value : (saved ?? value)

  // Renk: 1-4 kırmızı, 4-7 sarı, 7-10 yeşil
  const trackColor = displayVal >= 7 ? '#22c55e' : displayVal >= 4 ? '#eab308' : '#ef4444'
  const boxBg      = siteAvg != null
    ? (siteAvg >= 7 ? '#166534' : siteAvg >= 4 ? '#854d0e' : '#7f1d1d')
    : '#1c1c1c'

  return (
    <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-[--border] select-none">

      {/* Sol: site ortalaması */}
      <div className="flex flex-col items-center justify-center px-5 py-4 min-w-[90px]"
        style={{ backgroundColor: siteAvg != null ? boxBg : 'var(--bg-card)' }}>
        {siteAvg != null ? (
          <>
            <span className="text-3xl font-black text-white leading-none">{siteAvg.toFixed(1)}</span>
            <span className="text-[10px] text-white/70 mt-1 font-medium uppercase tracking-wide">
              {t('review.votesUnit', { n: formatVote(siteVoteCount) })}
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl font-black text-[--text-secondary]">—</span>
            <span className="text-[10px] text-[--text-secondary] mt-1">{t('review.noVotesYet')}</span>
          </>
        )}
      </div>

      {/* Sağ: puan ver */}
      <div className="flex-1 bg-[--bg-card] px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-[--text-secondary] tracking-widest uppercase">
            {saved != null ? t('review.ratingLabel') : t('review.giveRating')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black"
              style={{ color: trackColor }}>
              {displayVal.toFixed(1)}
            </span>
            {saved != null && !saving && (
              <button onClick={clearRating}
                className="text-[10px] text-[--text-secondary] hover:text-red-400 transition-colors border border-[--border] rounded px-1.5 py-0.5">
                {t('review.delete')}
              </button>
            )}
          </div>
        </div>

        {/* Slider track */}
        <div className="relative h-8 flex items-center cursor-pointer"
          ref={trackRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}>
          {/* Arka plan */}
          <div className="absolute inset-x-0 h-2 rounded-full bg-[--border]" />
          {/* Dolgu */}
          <div className="absolute left-0 h-2 rounded-full transition-all duration-75"
            style={{ width: `${((displayVal - 1) / 9) * 100}%`, backgroundColor: trackColor }} />
          {/* Thumb */}
          <div className="absolute h-5 w-5 rounded-full border-2 border-white shadow-lg transition-all duration-75 -translate-x-1/2"
            style={{
              left: `${((displayVal - 1) / 9) * 100}%`,
              backgroundColor: trackColor,
              transform: `translateX(-50%) scale(${dragging ? 1.3 : 1})`,
            }} />
        </div>

        {/* 1-10 etiketleri */}
        <div className="flex justify-between mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <span key={n} className="text-[9px] text-[--text-secondary]/50 w-4 text-center">{n}</span>
          ))}
        </div>

        {/* IMDb referansı */}
        {imdbAvg > 0 && (
          <div className="mt-2 pt-2 border-t border-[--border]/50">
            <span className="text-[11px] text-[--text-secondary]">
              <span className="text-[--gold] font-semibold">IMDb: {imdbAvg.toFixed(1)}</span>
              {imdbVoteCount > 0 && <span className="ml-1">{t('review.votesParenthetical', { n: formatVote(imdbVoteCount) })}</span>}
            </span>
          </div>
        )}

        {saving && (
          <p className="text-[10px] text-[--text-secondary] mt-1 animate-pulse">{t('review.savingRating')}</p>
        )}
        {!isLoggedIn && (
          <p className="text-[10px] text-[--text-secondary] mt-1">{t('review.loginToRate')}</p>
        )}
      </div>
    </div>
  )
}
