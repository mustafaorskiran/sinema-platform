'use client'

import { useState } from 'react'
import { IconPlay, IconClose, IconFilm, IconTv, IconCalendar } from '@/components/icons'
import type { TrailerItem } from '@/lib/types'

type Tab = 'tumü' | 'film' | 'dizi' | 'yakinda'

const TABS: { key: Tab; label: string }[] = [
  { key: 'tumü',    label: 'Tümü' },
  { key: 'film',    label: 'Film' },
  { key: 'dizi',    label: 'Dizi' },
  { key: 'yakinda', label: 'Yakında' },
]

export default function FragmanlarClient({ trailers }: { trailers: TrailerItem[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('tumü')
  const [playingKey, setPlayingKey] = useState<string | null>(null)

  const filtered = activeTab === 'tumü'
    ? trailers
    : trailers.filter(t => t.type === activeTab)

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setPlayingKey(null)
  }

  const counts = {
    tumü:    trailers.length,
    film:    trailers.filter(t => t.type === 'film').length,
    dizi:    trailers.filter(t => t.type === 'dizi').length,
    yakinda: trailers.filter(t => t.type === 'yakinda').length,
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={activeTab === tab.key
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
            }
          >
            {tab.label}
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl py-20 text-center text-[--text-secondary]"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <IconPlay className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Bu kategoride fragman bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(trailer => {
            const cardKey = `${trailer.type}-${trailer.id}`
            return (
              <TrailerCard
                key={cardKey}
                trailer={trailer}
                playing={playingKey === cardKey}
                onPlay={() => setPlayingKey(cardKey)}
                onClose={() => setPlayingKey(null)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function TrailerCard({
  trailer,
  playing,
  onPlay,
  onClose,
}: {
  trailer: TrailerItem
  playing: boolean
  onPlay: () => void
  onClose: () => void
}) {
  const ytThumb = `https://img.youtube.com/vi/${trailer.trailerKey}/hqdefault.jpg`
  const ytFallback = `https://img.youtube.com/vi/${trailer.trailerKey}/mqdefault.jpg`
  const ytUrl = `https://www.youtube.com/watch?v=${trailer.trailerKey}`

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Video alanı */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {playing ? (
          <div className="absolute inset-0">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              title={trailer.trailerName}
            />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/80 text-white hover:bg-black transition-colors"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className="absolute inset-0 cursor-pointer group/card"
            onClick={onPlay}
            role="button"
            tabIndex={0}
            aria-label={`${trailer.title} fragmanını oynat`}
            onKeyDown={(e) => e.key === 'Enter' && onPlay()}
          >
            <img
              src={ytThumb}
              alt={trailer.title}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).src = ytFallback }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/25 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[--accent]/90 flex items-center justify-center shadow-lg shadow-black/50 group-hover/card:scale-110 group-hover/card:bg-[--accent] transition-all duration-200">
                <IconPlay className="h-7 w-7 text-white ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bilgi */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1 flex-1">
            {trailer.title}
          </h3>
          <TypeBadge type={trailer.type} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[--text-secondary]">
            <IconCalendar className="h-3.5 w-3.5" />
            <span>{trailer.year || '—'}</span>
          </div>
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[--text-secondary] hover:text-[--accent] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            YouTube'da izle →
          </a>
        </div>
      </div>
    </div>
  )
}

function TypeBadge({ type }: { type: TrailerItem['type'] }) {
  if (type === 'film') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold uppercase shrink-0">
      <IconFilm className="h-3 w-3" /> Film
    </span>
  )
  if (type === 'dizi') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold uppercase shrink-0">
      <IconTv className="h-3 w-3" /> Dizi
    </span>
  )
  return (
    <span className="px-2 py-0.5 rounded-full bg-[--accent]/15 text-[--accent] text-[10px] font-bold uppercase shrink-0">
      Yakında
    </span>
  )
}
