'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TriviaItem {
  id: string
  content: string
  type: 'trivia' | 'goof'
  profiles: { username: string } | null
  created_at: string
}

interface Props {
  items: TriviaItem[]
  mediaId: number
  mediaType: 'film' | 'dizi'
  isLoggedIn: boolean
}

export default function TriviaSection({ items, mediaId, mediaType, isLoggedIn }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'trivia' | 'goof'>('trivia')
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const filtered = items.filter(i => i.type === tab)

  async function submit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    await fetch('/api/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, type: tab, content: content.trim() }),
    })
    setSubmitting(false)
    setContent('')
    setShowForm(false)
    setDone(true)
    router.refresh()
  }

  if (items.length === 0 && !isLoggedIn) return null

  return (
    <div className="mt-12" id="trivia">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">
            {tab === 'trivia' ? '💡 İlginç Bilgiler' : '🎬 Yapım Hataları'}
          </h2>
          <div className="flex bg-[--bg-card] border border-[--border] rounded-lg p-0.5">
            <button
              onClick={() => { setTab('trivia'); setShowForm(false) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === 'trivia' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}
            >
              Trivia ({items.filter(i => i.type === 'trivia').length})
            </button>
            <button
              onClick={() => { setTab('goof'); setShowForm(false) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === 'goof' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}
            >
              Hatalar ({items.filter(i => i.type === 'goof').length})
            </button>
          </div>
        </div>
        {isLoggedIn && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[--accent] hover:underline"
          >
            + Ekle
          </button>
        )}
      </div>

      {done && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-green-500/20 text-green-300 text-sm border border-green-500/30">
          Gönderildi! Onaylandıktan sonra yayınlanacak.
        </div>
      )}

      {showForm && (
        <div className="mb-5 bg-[--bg-card] border border-[--border] rounded-xl p-4">
          <p className="text-xs text-[--text-secondary] mb-2">
            {tab === 'trivia' ? 'İlginç bir bilgi ekle (onaylandıktan sonra yayınlanır)' : 'Bir yapım hatası ekle'}
          </p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={tab === 'trivia' ? 'Bu filmin çekimi sırasında...' : 'Filmin 1:23. dakikasında...'}
            className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg p-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] resize-none"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setShowForm(false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[--border] text-[--text-secondary] hover:text-white">
              İptal
            </button>
            <button onClick={submit} disabled={!content.trim() || submitting}
              className="text-xs px-4 py-1.5 rounded-lg bg-[--accent] text-white font-semibold disabled:opacity-40">
              {submitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-[--text-secondary] bg-[--bg-card] border border-[--border] rounded-xl">
          <p className="text-sm">Henüz {tab === 'trivia' ? 'ilginç bilgi' : 'yapım hatası'} eklenmemiş.</p>
          {isLoggedIn && !showForm && (
            <button onClick={() => setShowForm(true)} className="mt-2 text-xs text-[--accent] hover:underline">
              İlk ekleyen sen ol →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <div key={item.id} className="flex gap-3 p-4 bg-[--bg-card] border border-[--border] rounded-xl">
              <div className="shrink-0 w-6 h-6 rounded-full bg-[--accent]/20 text-[--accent] text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-relaxed">{item.content}</p>
                {item.profiles?.username && (
                  <p className="text-xs text-[--text-secondary] mt-1.5">
                    <a href={`/profil/${item.profiles.username}`} className="hover:text-white transition-colors">
                      @{item.profiles.username}
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
