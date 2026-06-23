'use client'

import { useState } from 'react'

interface Props {
  mediaId: number
  mediaType: string
  inCollection: boolean
  initialFormat?: string
}

const FORMAT_LABELS: Record<string, string> = {
  dijital: '💻 Dijital',
  bluray: '💿 Blu-ray',
  dvd: '📀 DVD',
  vhs: '📼 VHS',
}

export default function CollectionButton({ mediaId, mediaType, inCollection: init, initialFormat = 'dijital' }: Props) {
  const [inCol, setInCol] = useState(init)
  const [format, setFormat] = useState(initialFormat)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function addToCollection(fmt: string) {
    setLoading(true)
    await fetch('/api/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, format: fmt }),
    })
    setFormat(fmt)
    setInCol(true)
    setOpen(false)
    setLoading(false)
  }

  async function removeFromCollection() {
    setLoading(true)
    await fetch(`/api/collection?media_id=${mediaId}&media_type=${mediaType}`, { method: 'DELETE' })
    setInCol(false)
    setLoading(false)
  }

  if (inCol) {
    return (
      <button
        onClick={removeFromCollection}
        disabled={loading}
        title="Koleksiyonumdan çıkar"
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
      >
        📦 Koleksiyonumda ({FORMAT_LABELS[format] ?? format})
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] bg-[--bg-card] text-[--text-secondary] text-sm font-medium hover:text-white hover:border-white/30 transition-colors"
      >
        📦 Koleksiyona Ekle
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-20 w-44 bg-[--bg-secondary] border border-[--border] rounded-xl shadow-xl p-2">
          <p className="text-[10px] text-[--text-secondary] uppercase font-semibold px-2 mb-1">Format seç</p>
          {Object.entries(FORMAT_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => addToCollection(key)}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[--bg-card] rounded-lg transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
