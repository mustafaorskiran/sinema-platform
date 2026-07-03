'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/context/LocaleContext'

interface Quote {
  id: string
  content: string
  character_name: string | null
  profiles: { username: string } | null
}

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  isLoggedIn: boolean
  title: string
}

export default function QuotesSection({ mediaId, mediaType, isLoggedIn, title }: Props) {
  const { t } = useLocale()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [content, setContent] = useState('')
  const [character, setCharacter] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch(`/api/quotes?media_id=${mediaId}&media_type=${mediaType}`)
      .then(r => r.json())
      .then(d => { setQuotes(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mediaId, mediaType])

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, content, character_name: character }),
    })
    setSending(false)
    setSent(true)
    setContent('')
    setCharacter('')
    setTimeout(() => { setSent(false); setAdding(false) }, 3000)
  }

  if (loading) return null
  if (quotes.length === 0 && !isLoggedIn) return null

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
          <h2 className="text-xl font-bold text-white tracking-tight">{t('quote.sectionTitle')}</h2>
          {quotes.length > 0 && (
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>({quotes.length})</span>
          )}
        </div>
        {isLoggedIn && !adding && (
          <button onClick={() => setAdding(true)}
            className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', color: '#D4A843' }}>
            {t('quote.addQuote')}
          </button>
        )}
      </div>

      {quotes.length > 0 && (
        <div className="space-y-3 mb-4">
          {quotes.map(q => (
            <blockquote key={q.id}
              className="rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="absolute top-2 right-4 text-5xl font-serif leading-none select-none pointer-events-none"
                style={{ color: '#D4A843', opacity: 0.12 }} aria-hidden>"</span>
              <p className="text-sm text-white leading-relaxed pt-1 italic">"{q.content}"</p>
              {q.character_name && (
                <footer className="mt-2 text-xs font-semibold" style={{ color: '#D4A843' }}>— {q.character_name}</footer>
              )}
              {q.profiles && (
                <p className="mt-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('quote.addedBy', { username: q.profiles.username })}</p>
              )}
            </blockquote>
          ))}
        </div>
      )}

      {quotes.length === 0 && !adding && (
        <div className="rounded-xl p-6 text-center"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.7), rgba(14,20,32,0.8))', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('quote.empty')}</p>
          {isLoggedIn && (
            <button onClick={() => setAdding(true)}
              className="text-sm px-5 py-2 rounded-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D4A843, #b8922a)', color: '#000', fontWeight: 600 }}>
              {t('quote.addFirstQuote')}
            </button>
          )}
        </div>
      )}

      {adding && (
        <form onSubmit={submitQuote} className="rounded-xl p-5 space-y-3"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))', border: '1px solid rgba(212,168,67,0.15)' }}>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-green-400 text-sm">{t('quote.pendingReview')}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>{t('quote.quoteLabel')} <span className="text-red-400 normal-case tracking-normal">*</span></label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} maxLength={500}
                  placeholder={t('quote.quotePlaceholder', { title })}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>{t('quote.characterLabel')} <span className="font-normal normal-case tracking-normal">{t('quote.optional')}</span></label>
                <input value={character} onChange={e => setCharacter(e.target.value)} maxLength={100}
                  placeholder={t('quote.characterPlaceholder')}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setAdding(false)}
                  className="px-4 py-2 text-sm rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>{t('quote.cancel')}</button>
                <button type="submit" disabled={sending || !content.trim()}
                  className="px-5 py-2 text-sm rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #D4A843, #b8922a)', color: '#000' }}>
                  {sending ? t('quote.submitting') : t('quote.submit')}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}
