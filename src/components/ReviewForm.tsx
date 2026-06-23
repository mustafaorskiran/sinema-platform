'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StarRating from './StarRating'
import type { MediaType } from '@/lib/types'

interface ReviewFormProps {
  mediaId: number
  mediaType: MediaType
  existingReview?: { rating: number; content: string; id: string; has_spoiler?: boolean; tags?: string[] }
}

export default function ReviewForm({ mediaId, mediaType, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [content, setContent] = useState(existingReview?.content ?? '')
  const [hasSpoiler, setHasSpoiler] = useState(existingReview?.has_spoiler ?? false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(existingReview?.tags ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
      if (!tags.includes(t) && tags.length < 5) setTags([...tags, t])
      setTagInput('')
    }
  }

  function removeTag(t: string) {
    setTags(tags.filter(x => x !== t))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Lütfen bir puan verin.'); return }
    if (content.trim().length < 10) { setError('Yorum en az 10 karakter olmalı.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reviews', {
        method: existingReview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existingReview?.id,
          media_id: mediaId,
          media_type: mediaType,
          rating,
          content: content.trim(),
          has_spoiler: hasSpoiler,
          tags,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Bir hata oluştu.')
      }

      router.refresh()
      if (!existingReview) {
        setContent('')
        setRating(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Puanın</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Yorumun</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bu yapım hakkında ne düşünüyorsun?"
          rows={5}
          maxLength={2000}
          className="w-full rounded-lg bg-[--bg-card] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
        />
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((content.length / 2000) * 100, 100)}%`,
                background: content.length > 1950 ? '#f87171' : content.length > 1800 ? '#fbbf24' : 'var(--accent)',
              }}
            />
          </div>
          <span
            className="text-xs tabular-nums shrink-0"
            style={{ color: content.length > 1950 ? '#f87171' : content.length > 1800 ? '#fbbf24' : 'var(--text-secondary)' }}
          >
            {content.length} / 2000
          </span>
        </div>
      </div>

      {/* Spoiler */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={hasSpoiler}
          onChange={e => setHasSpoiler(e.target.checked)}
          className="w-4 h-4 rounded accent-[--accent]"
        />
        <span className="text-sm text-[--text-secondary]">⚠️ Spoiler içeriyor</span>
      </label>

      {/* Etiketler */}
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">
          Etiketler <span className="font-normal">(Enter ile ekle, maks 5)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 text-xs bg-[--bg-secondary] border border-[--border] rounded-full px-2.5 py-1 text-white">
              #{t}
              <button type="button" onClick={() => removeTag(t)} className="text-[--text-secondary] hover:text-red-400 ml-0.5">×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="etiket-ekle..."
          disabled={tags.length >= 5}
          className="w-full rounded-lg bg-[--bg-card] border border-[--border] px-3 py-2 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors disabled:opacity-40"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Gönderiliyor...' : existingReview ? 'Yorumu Güncelle' : 'Yorum Yap'}
      </button>
    </form>
  )
}
