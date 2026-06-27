'use client'

import { useState } from 'react'

interface Props {
  mediaId: number
  mediaType: string
  mediaTitle: string
  isLoggedIn: boolean
}

export default function DiaryButton({ mediaId, mediaType, mediaTitle, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const [watchedAt, setWatchedAt] = useState(new Date().toISOString().slice(0, 10))
  const [rating, setRating] = useState<number | ''>('')
  const [note, setNote] = useState('')
  const [isRewatch, setIsRewatch] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
      if (!tags.includes(t) && tags.length < 5) setTags([...tags, t])
      setTagInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_id: mediaId,
          media_type: mediaType,
          watched_at: watchedAt,
          rating: rating || null,
          note: note.trim() || null,
          is_rewatch: isRewatch,
          tags,
        }),
      })
      setDone(true)
      setOpen(false)
      setNote('')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) return null

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(v => !v); setDone(false) }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
          done
            ? 'border-green-500/50 bg-green-500/10 text-green-400'
            : 'border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-white/30 hover:text-white'
        }`}
      >
        {done ? '✓ Günlüğe Eklendi' : '📅 Günlüğe Ekle'}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-20 w-72 rounded-xl rounded-xl shadow-2xl shadow-black/40 p-4" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-semibold text-white mb-3 line-clamp-1">{mediaTitle}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">İzleme Tarihi</label>
              <input
                type="date"
                value={watchedAt}
                onChange={e => setWatchedAt(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                required
                className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[--accent]/60"
              />
            </div>

            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Puan (opsiyonel)</label>
              <div className="flex gap-1 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? '' : n)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                      rating === n
                        ? 'bg-[--gold] text-black'
                        : 'bg-[--bg-secondary] border border-[--border] text-[--text-secondary] hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Tekrar izleme */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRewatch}
                onChange={e => setIsRewatch(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[--accent]"
              />
              <span className="text-xs text-[--text-secondary]">🔁 Tekrar izledim</span>
            </label>

            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Not (opsiyonel)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Kısa bir not..."
                rows={2}
                className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-2 text-sm text-white placeholder-[--text-secondary] focus:outline-none focus:border-[--accent]/60 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Etiketler (Enter ile ekle)</label>
              <div className="flex flex-wrap gap-1 mb-1">
                {tags.map(t => (
                  <span key={t} className="text-[10px] rounded-xl rounded-full px-2 py-0.5 text-white flex items-center gap-1" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    #{t}<button type="button" onClick={() => setTags(tags.filter(x => x !== t))} className="text-[--text-secondary]">×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="etiket..."
                disabled={tags.length >= 5}
                className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[--text-secondary] focus:outline-none focus:border-[--accent]/60 disabled:opacity-40"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg border border-[--border] text-xs text-[--text-secondary] hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-[--accent] hover:bg-[--accent-hover] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
