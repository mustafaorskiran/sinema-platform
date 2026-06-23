'use client'

import { useState, useEffect } from 'react'

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
        <h2 className="text-xl font-bold text-white">Alıntılar</h2>
        {isLoggedIn && !adding && (
          <button onClick={() => setAdding(true)}
            className="text-sm text-[--accent] hover:underline">+ Alıntı Ekle</button>
        )}
      </div>

      {quotes.length > 0 && (
        <div className="space-y-3 mb-4">
          {quotes.map(q => (
            <blockquote key={q.id} className="rounded-xl bg-[--bg-card] border border-[--border] p-5 relative">
              <div className="absolute -top-2 left-4 text-4xl text-[--accent]/30 font-serif leading-none select-none">"</div>
              <p className="text-sm text-white leading-relaxed pt-2 italic">"{q.content}"</p>
              {q.character_name && (
                <footer className="mt-2 text-xs text-[--accent] font-semibold">— {q.character_name}</footer>
              )}
              {q.profiles && (
                <p className="mt-1 text-[10px] text-[--text-secondary]">ekleyen: {q.profiles.username}</p>
              )}
            </blockquote>
          ))}
        </div>
      )}

      {quotes.length === 0 && !adding && (
        <div className="rounded-xl bg-[--bg-card] border border-[--border] p-6 text-center">
          <p className="text-[--text-secondary] text-sm mb-3">Henüz alıntı eklenmemiş.</p>
          {isLoggedIn && (
            <button onClick={() => setAdding(true)}
              className="text-sm bg-[--accent] hover:bg-[--accent-hover] text-white px-4 py-2 rounded-lg transition-colors">
              İlk Alıntıyı Ekle
            </button>
          )}
        </div>
      )}

      {adding && (
        <form onSubmit={submitQuote} className="rounded-xl bg-[--bg-card] border border-[--border] p-5 space-y-3">
          {sent ? (
            <p className="text-green-400 text-sm text-center py-4">✓ Alıntın incelemeye alındı, onaylandıktan sonra görünecek.</p>
          ) : (
            <>
              <div>
                <label className="text-xs text-[--text-secondary] mb-1 block">Alıntı <span className="text-red-400">*</span></label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} maxLength={500}
                  placeholder={`"${title}" filminden unutulmaz bir replik...`}
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-[--text-secondary] mb-1 block">Karakter (opsiyonel)</label>
                <input value={character} onChange={e => setCharacter(e.target.value)} maxLength={100}
                  placeholder="Tony Stark"
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setAdding(false)}
                  className="px-4 py-2 text-sm text-[--text-secondary] hover:text-white transition-colors">İptal</button>
                <button type="submit" disabled={sending || !content.trim()}
                  className="px-4 py-2 text-sm bg-[--accent] hover:bg-[--accent-hover] text-white rounded-lg transition-colors disabled:opacity-50">
                  {sending ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}
