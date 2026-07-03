'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StarRating from './StarRating'
import type { MediaType } from '@/lib/types'
import { containsProfanity } from '@/lib/profanityFilter'
import { useLocale } from '@/context/LocaleContext'
import { IconLink, IconAlertTriangle } from '@/components/icons'

function renderMarkdownPreview(text: string) {
  const lines = text.split('\n')
  return lines.map((line, li) => {
    const inlineRegex = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi
    const parts: React.ReactNode[] = []
    let last = 0
    let m: RegExpExecArray | null
    while ((m = inlineRegex.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index))
      if (m[1] !== undefined) parts.push(<strong key={m.index}>{m[1]}</strong>)
      else if (m[2] !== undefined) parts.push(<em key={m.index}>{m[2]}</em>)
      else if (m[3] !== undefined) parts.push(<a key={m.index} href={m[4]} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#E11D48' }}>{m[3]}</a>)
      else if (m[5] !== undefined) parts.push(<span key={m.index} style={{ filter: 'blur(4px)', background: 'rgba(248,113,113,0.12)', borderRadius: 3, padding: '0 2px' }}>{m[5]}</span>)
      last = m.index + m[0].length
    }
    if (last < line.length) parts.push(line.slice(last))
    return <span key={li}>{parts.length ? parts : ' '}{li < lines.length - 1 && <br />}</span>
  })
}

interface ReviewFormProps {
  mediaId: number
  mediaType: MediaType
  existingReview?: { rating: number; content: string; id: string; has_spoiler?: boolean; tags?: string[] }
}

const QUICK_TAGS = ['harika', 'sıkıcı', 'duygusal', 'gerilim', 'komedi', 'klasik', 'abartılı', 'gerçekçi']

export default function ReviewForm({ mediaId, mediaType, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const { t } = useLocale()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [content, setContent] = useState(existingReview?.content ?? '')
  const [hasSpoiler, setHasSpoiler] = useState(existingReview?.has_spoiler ?? false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(existingReview?.tags ?? [])
  const [preview, setPreview] = useState(false)
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

  function insertFormat(type: 'bold' | 'italic' | 'link') {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = content.slice(start, end)
    let tag = ''
    if (type === 'bold') tag = selected ? `**${selected}**` : '**kalın metin**'
    else if (type === 'italic') tag = selected ? `*${selected}*` : '*italik metin*'
    else if (type === 'link') tag = selected ? `[${selected}](https://...)` : '[link metni](https://...)'
    const newContent = content.slice(0, start) + tag + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + tag.length, start + tag.length)
    }, 0)
  }

  function insertSpoilerTag() {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = content.slice(start, end)
    const tag = selected ? `[spoiler]${selected}[/spoiler]` : '[spoiler]metin buraya[/spoiler]'
    const newContent = content.slice(0, start) + tag + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      el.focus()
      const cursorPos = start + tag.length
      el.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError(t('review.errorNoRating')); return }
    if (content.trim().length < 10) { setError(t('review.errorTooShort')); return }
    if (containsProfanity(content)) { setError(t('review.errorProfanity')); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: existingReview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existingReview?.id, media_id: mediaId, media_type: mediaType, rating, content: content.trim(), has_spoiler: hasSpoiler, tags }),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || t('review.errorGeneric')) }
      router.refresh()
      if (!existingReview) { setContent(''); setRating(0); setTags([]); setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('review.errorGeneric'))
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
          style={{ color: 'rgba(255,255,255,0.4)' }}>{t('review.ratingLabel')}</label>
        <StarRating value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-xs mt-2 font-medium" style={{ color: rating >= 8 ? '#4ade80' : rating >= 6 ? '#D4A843' : '#f87171' }}>
            {rating >= 9 ? t('review.ratingMasterpiece') : rating >= 8 ? t('review.ratingGreat') : rating >= 7 ? t('review.ratingGood') : rating >= 6 ? t('review.ratingNotBad') : rating >= 5 ? t('review.ratingAverage') : rating >= 4 ? t('review.ratingWeak') : t('review.ratingTerrible')}
            {' '}· {rating}/10
          </p>
        )}
      </div>

      {/* Yorum */}
      <div>
        {/* Başlık + sekmeler */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.4)' }}>{t('review.contentLabel')}</label>
            <div className="flex items-center gap-1 ml-3">
              <button type="button" onClick={() => setPreview(false)}
                className="text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors"
                style={!preview ? { background: 'rgba(225,29,72,0.15)', color: '#E11D48', border: '1px solid rgba(225,29,72,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {t('review.writeTab')}
              </button>
              <button type="button" onClick={() => setPreview(true)}
                className="text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors"
                style={preview ? { background: 'rgba(225,29,72,0.15)', color: '#E11D48', border: '1px solid rgba(225,29,72,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {t('review.previewTab')}
              </button>
            </div>
          </div>
          <span className="text-[10px] tabular-nums" style={{ color: charColor }}>{content.length} / 2000</span>
        </div>

        {/* Markdown araç çubuğu */}
        {!preview && (
          <div className="flex items-center gap-1.5 mb-2">
            {[
              { key: 'bold', label: 'B', title: t('review.boldTitle'), action: () => insertFormat('bold'), style: { fontWeight: 700 } },
              { key: 'italic', label: 'I', title: t('review.italicTitle'), action: () => insertFormat('italic'), style: { fontStyle: 'italic' } },
              { key: 'link', label: <IconLink size={12} />, title: t('review.linkTitle'), action: () => insertFormat('link'), style: {} },
              { key: 'spoiler', label: <span className="inline-flex items-center gap-1"><IconAlertTriangle size={12} /> [spoiler]</span>, title: t('review.spoilerTitle'), action: insertSpoilerTag, style: { color: 'rgba(248,113,113,0.8)' } },
            ].map(btn => (
              <button key={btn.key} type="button" onClick={btn.action} title={btn.title}
                className="text-[10px] px-2 py-1 rounded transition-colors hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', ...btn.style }}>
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Textarea / Önizleme */}
        {preview ? (
          <div className="w-full rounded-xl px-4 py-3 text-sm text-white min-h-[120px] leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {content.trim() ? renderMarkdownPreview(content) : (
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>{t('review.noPreviewContent')}</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('review.contentPlaceholder')}
            rows={5}
            maxLength={2000}
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none resize-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
        )}
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
          <p className="text-sm font-medium text-white">{t('review.spoilerCheckboxLabel')}</p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('review.spoilerAutoHide')}</p>
        </div>
      </label>

      {/* Etiketler */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255,255,255,0.4)' }}>{t('review.tagsLabel')} <span className="font-normal normal-case tracking-normal">{t('review.tagsMax')}</span></label>

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
            placeholder={t('review.tagInputPlaceholder')}
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
          {t('review.successAdded')}
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
        {loading ? t('review.submitting') : existingReview ? t('review.updateBtn') : t('review.writeBtn')}
      </button>
    </form>
  )
}
