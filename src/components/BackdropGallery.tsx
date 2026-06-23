'use client'

import { useState } from 'react'
import { IconClose, IconChevronLeft, IconChevronRight, IconExpand } from '@/components/icons'

interface Img {
  file_path: string
  width: number
  height: number
}

interface Props {
  backdrops: Img[]
  posters?: Img[]
  title: string
}

const BASE = 'https://image.tmdb.org/t/p/'

export default function BackdropGallery({ backdrops, posters = [], title }: Props) {
  const [tab, setTab] = useState<'backdrops' | 'posters'>('backdrops')
  const [lightbox, setLightbox] = useState<{ images: Img[]; index: number } | null>(null)

  if (backdrops.length === 0 && posters.length === 0) return null

  const shownBackdrops = backdrops.slice(0, 9)
  const shownPosters   = posters.slice(0, 10)

  function prev() {
    if (!lightbox) return
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length })
  }
  function next() {
    if (!lightbox) return
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Fotoğraflar</h2>

        {posters.length > 0 ? (
          <div className="flex gap-1">
            <button
              onClick={() => setTab('backdrops')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                tab === 'backdrops'
                  ? 'bg-[--accent] text-white'
                  : 'text-[--text-secondary] hover:text-white hover:bg-white/5'
              }`}
            >
              Görseller ({backdrops.length})
            </button>
            <button
              onClick={() => setTab('posters')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                tab === 'posters'
                  ? 'bg-[--accent] text-white'
                  : 'text-[--text-secondary] hover:text-white hover:bg-white/5'
              }`}
            >
              Afişler ({posters.length})
            </button>
          </div>
        ) : (
          backdrops.length > 9 && (
            <span className="text-xs text-[--text-secondary]">{backdrops.length} fotoğraf</span>
          )
        )}
      </div>

      {/* Backdrop grid */}
      {tab === 'backdrops' && (
        <div className="grid grid-cols-3 gap-2">
          {shownBackdrops.map((bd, i) => (
            <button
              key={bd.file_path}
              onClick={() => setLightbox({ images: backdrops, index: i })}
              className="relative group aspect-video rounded-xl overflow-hidden bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors"
            >
              <img
                src={`${BASE}w500${bd.file_path}`}
                alt={`${title} - görsel ${i + 1}`}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <IconExpand className="h-6 w-6 text-white drop-shadow" />
              </div>
              {i === shownBackdrops.length - 1 && backdrops.length > shownBackdrops.length && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{backdrops.length - shownBackdrops.length}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Poster grid */}
      {tab === 'posters' && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {shownPosters.map((p, i) => (
            <button
              key={p.file_path}
              onClick={() => setLightbox({ images: posters, index: i })}
              className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors"
            >
              <img
                src={`${BASE}w342${p.file_path}`}
                alt={`${title} - afiş ${i + 1}`}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <IconExpand className="h-6 w-6 text-white drop-shadow" />
              </div>
            </button>
          ))}
        </div>
      )}

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
              src={`${BASE}original${lightbox.images[lightbox.index].file_path}`}
              alt={`${title} - ${lightbox.index + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <p className="text-center text-xs text-white/40 mt-2">
              {lightbox.index + 1} / {lightbox.images.length}
            </p>
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
