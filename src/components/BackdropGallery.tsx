'use client'

import { useState } from 'react'
import { IconClose, IconChevronLeft, IconChevronRight, IconExpand } from '@/components/icons'

interface Backdrop {
  file_path: string
  width: number
  height: number
}

interface Props {
  backdrops: Backdrop[]
  title: string
}

const BASE = 'https://image.tmdb.org/t/p/'

export default function BackdropGallery({ backdrops, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (backdrops.length === 0) return null

  const shown = backdrops.slice(0, 9)

  function prev() {
    if (lightbox === null) return
    setLightbox((lightbox - 1 + backdrops.length) % backdrops.length)
  }
  function next() {
    if (lightbox === null) return
    setLightbox((lightbox + 1) % backdrops.length)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Fotoğraflar</h2>
        {backdrops.length > shown.length && (
          <span className="text-xs text-[--text-secondary]">{backdrops.length} fotoğraf</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {shown.map((bd, i) => (
          <button
            key={bd.file_path}
            onClick={() => setLightbox(i)}
            className="relative group aspect-video rounded-xl overflow-hidden bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors"
          >
            <img
              src={`${BASE}w500${bd.file_path}`}
              alt={`${title} - fotoğraf ${i + 1}`}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <IconExpand className="h-6 w-6 text-white drop-shadow" />
            </div>
            {i === shown.length - 1 && backdrops.length > shown.length && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{backdrops.length - shown.length}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={e => { e.stopPropagation(); setLightbox(null) }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <IconClose className="h-6 w-6" />
          </button>

          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <IconChevronLeft className="h-6 w-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] px-16" onClick={e => e.stopPropagation()}>
            <img
              src={`${BASE}original${backdrops[lightbox].file_path}`}
              alt={`${title} - ${lightbox + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <p className="text-center text-xs text-white/40 mt-2">{lightbox + 1} / {backdrops.length}</p>
          </div>

          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <IconChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </section>
  )
}
