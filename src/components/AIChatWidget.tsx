'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  title: string
  year: string
  genres: string
  director?: string
  isLoggedIn: boolean
}

const QUICK_QUESTIONS = [
  'Bu film gerçek bir hikayeye mi dayalı?',
  'Benzer filmler önerir misin?',
  'Yönetmenin diğer önemli yapımları?',
  'Film nerede çekildi?',
]

const DIZI_QUICK_QUESTIONS = [
  'Kaç sezondan oluşuyor?',
  'Benzer diziler önerir misin?',
  'Yaratıcı/senarist kimler?',
  'Dizi nerede geçiyor?',
]

export default function AIChatWidget({ mediaId, mediaType, title, year, genres, director, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function ask(q?: string) {
    const text = (q ?? question).trim()
    if (!text || loading) return
    setQuestion('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/sohbet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, title, year, genres, director, mediaType }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { q: text, a: data.answer || data.error || 'Yanıt alınamadı.' }])
    } catch {
      setMessages(prev => [...prev, { q: text, a: 'Yanıt alınamadı.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) return null

  const quickQs = mediaType === 'dizi' ? DIZI_QUICK_QUESTIONS : QUICK_QUESTIONS

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: open
            ? 'linear-gradient(160deg, rgba(30,20,50,0.97), rgba(20,12,40,0.98))'
            : 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))',
          border: `1px solid ${open ? 'rgba(167,139,250,0.3)' : 'rgba(167,139,250,0.12)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)' }}>
            ✦
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Sinezon AI Asistanı</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {title} hakkında soru sor
            </p>
          </div>
        </div>
        <span className="text-lg" style={{ color: 'rgba(167,139,250,0.6)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▾
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(25,15,45,0.98), rgba(15,10,30,0.99))', border: '1px solid rgba(167,139,250,0.15)' }}>

          {/* Hızlı sorular */}
          {messages.length === 0 && (
            <div className="p-4 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(167,139,250,0.5)' }}>
                Hızlı Sorular
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQs.map(q => (
                  <button key={q} onClick={() => ask(q)} disabled={loading}
                    className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: 'rgba(167,139,250,0.8)' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mesajlar */}
          {messages.length > 0 && (
            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm text-sm text-white"
                      style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.2)' }}>
                      {m.q}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[90%]">
                      <span className="text-base shrink-0 mt-1">✦</span>
                      <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.85)' }}>
                        {m.a}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <span className="text-base">✦</span>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'rgba(167,139,250,0.6)', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <div className="p-4 pt-2 flex gap-2"
            style={{ borderTop: messages.length > 0 ? '1px solid rgba(167,139,250,0.08)' : 'none' }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder={`${title} hakkında bir şey sor...`}
              disabled={loading}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.15)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(167,139,250,0.15)')}
            />
            <button
              onClick={() => ask()}
              disabled={!question.trim() || loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: 'rgba(167,139,250,0.25)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}
            >
              {loading ? '⟳' : '→'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
