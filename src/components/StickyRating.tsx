'use client'

import { useEffect, useState } from 'react'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  title: string
  posterPath: string | null
  isLoggedIn: boolean
  currentRating: number | null
}

export default function StickyRating({ mediaId, mediaType, title, posterPath, isLoggedIn, currentRating }: Props) {
  const [visible, setVisible] = useState(false)
  const [rating, setRating] = useState(currentRating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function saveRating(val: number) {
    if (!isLoggedIn) { window.location.href = '/auth/giris'; return }
    setRating(val)
    setSaved(false)
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, rating: val, content: '' }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto mb-20 md:mb-4 mx-4 max-w-lg w-full">
        <div className="bg-[--bg-card]/95 backdrop-blur-md border border-[--border] rounded-2xl shadow-2xl shadow-black/50 px-4 py-3 flex items-center gap-3">
          {posterPath && (
            <img
              src={`https://image.tmdb.org/t/p/w92${posterPath}`}
              alt={title}
              className="w-8 h-12 rounded object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{title}</p>
            <p className="text-[--text-secondary] text-[10px]">Puanını ver</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => saveRating(n)}
                className={`w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-sm transition-transform hover:scale-110 ${
                  (hovered || rating) >= n ? 'text-[--gold]' : 'text-[--border]'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {(rating > 0 || saved) && (
            <div className="shrink-0 text-xs font-bold text-[--accent] min-w-[2rem] text-center">
              {saved ? '✓' : `${rating}/10`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
