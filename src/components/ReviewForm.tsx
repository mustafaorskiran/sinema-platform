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

const QUICK_TAGS = ['harika', 'sıkıcı', 'duygusal', 'gerilim', 'komedi', 'klasik', 'abartılı', 'gerçekçi']

export default function ReviewForm({ mediaId, mediaType, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [content, setContent] = useState(existingReview?.content ?? '')
  const [hasSpoiler, setHasSpoiler] = useState(existingReview?.has_spoiler ?? false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(existingReview?.tags ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t) && tags.length < 5) setTags([...tags, t])
  }

  function addTagFromInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    }
  }

  function removeTag(t: string) { setTags(tags.filter(x => x !== t)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Lütfen bir puan verin.'); return }
    if (content.trim().length < 10) { setError('Yorum en az 10 karakter olmalı.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: existingReview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existingReview?.id, media_id: mediaId, media_type: mediaType, rating, content: content.trim(), has_spoiler: hasSpoiler, tags }),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Bir hata oluştu.') }
      router.refresh()
      if (!existingReview) { setContent(''); setRating(0); setTags([]); setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally { setLoading(false) }
  }

  const charPct = Math.min((content.length / 2000) * 100, 100)
  const charColor = content.length > 1950 ? '#f87171' : content.length > 1800 ? '#fbbf24' : '#34d399'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Puan */}
      <div className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(255,255,255,0.4)' }}>Puanın</label>
        <StarRating value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-xs mt-2 font-medium" style={{ color: rating >= 8 ? '#4ade80' : rating >= 6 ? '#D4A843' : '#f87171' }}>
            {rating >= 9 ? 'Şaheser!' : rating >= 8 ? 'Harika' : rating >= 7 ? 'İyi' : rating >= 6 ? 'Fena değil' : rating >= 5 ? 'Ortalama' : rating >= 4 ? 'Zayıf' : 'Berbat'}
            {' '}· {rating}/10
          </p>
        )}
      </div>

      {/* Yorum */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.4)' }}>Yorumun</label>
          <span className="text-[10px] tabular-nums" style={{ color: charColor }}>{content.length} / 2000</span>
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Bu yapım hakkında ne düşünüyorsun?"
          rows={5}
          maxLength={2000}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none resize-none transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.4)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
        <div className="mt-1.5 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${charPct}%`, background: charColor }} />
        </div>
      </div>

      {/* Spoiler */}
      <label className="flex items-center gap-3 cursor-pointer select-none rounded-xl p-3 transition-colors hover:bg-white/5"
        style={{ border: `1px solid ${hasSpoiler ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.06)'}`, background: hasSpoiler ? 'rgba(248,113,113,0.05)' : 'transparent' }}>
        <input type="checkbox" checked={hasSpoiler} onChange={e => setHasSpoiler(e.target.checked)}
          className="w-4 h-4 rounded accent-red-500" />
        <div>
          <p className="text-sm font-medium text-white">⚠️ Spoiler içeriyor</p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Yorum otomatik gizlenir</p>
        </div>
      </label>

      {/* Etiketler */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255,255,255,0.4)' }}>Etiketler <span className="font-normal normal-case tracking-normal">(maks 5)</span></label>

        {/* Hızlı etiketler */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {QUICK_TAGS.filter(t => !tags.includes(t)).map(t => (
            <button key={t} type="button" onClick={() => addTag(t)}
              className="text-[10px] px-2.5 py-1 rounded-full transition-colors hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              +{t}
            </button>
          ))}
        </div>

        {/* Seçili etiketler */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 text-xs rounded-full px-2.5 py-1 text-white font-medium"
                style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>
                #{t}
                <button type="button" onClick={() => removeTag(t)} className="opacity-50 hover:opacity-100 transition-opacity ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}

        {tags.length < 5 && (
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTagFromInput}
            placeholder="özel etiket yaz, Enter'a bas..."
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-[--text-secondary] outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        )}
      </div>

      {error && (
        <div className="text-sm text-red-400 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-400 rounded-lg px-3 py-2 text-center font-semibold"
          style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
          ✓ Yorumun başarıyla eklendi!
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: loading ? 'rgba(225,29,72,0.5)' : 'linear-gradient(135deg, #E11D48, #be123c)',
          color: 'white',
          boxShadow: rating > 0 && !loading ? '0 4px 20px rgba(225,29,72,0.3)' : 'none',
        }}
      >
        {loading ? '⟳ Gönderiliyor...' : existingReview ? '✓ Yorumu Güncelle' : '✍️ Yorum Yap'}
      </button>
    </form>
  )
}
