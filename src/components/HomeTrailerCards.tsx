'use client'

import { useState } from 'react'
import { IconPlay, IconClose, IconFilm, IconTv } from '@/components/icons'
import type { TrailerItem } from '@/lib/types'
import { useLocale } from '@/context/LocaleContext'

export default function HomeTrailerCards({ trailers }: { trailers: TrailerItem[] }) {
  const { t } = useLocale()
  const [playingId, setPlayingId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {trailers.map(tr => {
        const cardId = `${tr.type}-${tr.id}`
        const playing = playingId === cardId
        const thumb = `https://img.youtube.com/vi/${tr.trailerKey}/mqdefault.jpg`

        return (
          <div key={cardId} className="rounded-xl overflow-hidden group transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative aspect-video bg-black">
              {playing ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${tr.trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title={tr.trailerName}
                  />
                  <button
                    onClick={() => setPlayingId(null)}
                    className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                  >
                    <IconClose className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setPlayingId(cardId)}
                  className="absolute inset-0 w-full h-full block"
                  aria-label={t('homeTrailerCards.playAria', { title: tr.title })}
                >
                  <img
                    src={tr.backdrop ?? thumb}
                    alt={tr.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = thumb }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconPlay className="h-4 w-4 text-white ml-0.5" />
                    </div>
                  </div>
                </button>
              )}
            </div>
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-white truncate flex-1">{tr.title}</p>
                {tr.type === 'film' || tr.type === 'yakinda'
                  ? <IconFilm className="h-3 w-3 text-blue-400 shrink-0" />
                  : <IconTv className="h-3 w-3 text-purple-400 shrink-0" />
                }
              </div>
              <p className="text-[10px] text-[--text-secondary] mt-0.5">
                {tr.type === 'yakinda' ? t('homeTrailerCards.upcomingYear', { year: tr.year }) : tr.year}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
