'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Topic {
  id: number
  name: string
  slug: string
  emoji: string
}

interface Props {
  topics: Topic[]
  mediaId: number
  mediaType: string
  userVotedIds: number[]
  voteCounts: Record<number, number>
  isLoggedIn: boolean
}

export default function TopicTagger({ topics, mediaId, mediaType, userVotedIds, voteCounts, isLoggedIn }: Props) {
  const [voted, setVoted] = useState<Set<number>>(new Set(userVotedIds))
  const [counts, setCounts] = useState<Record<number, number>>(voteCounts)
  const [loading, setLoading] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  async function toggle(topicId: number) {
    if (!isLoggedIn || loading !== null) return
    setLoading(topicId)
    const wasVoted = voted.has(topicId)
    setVoted(prev => {
      const next = new Set(prev)
      wasVoted ? next.delete(topicId) : next.add(topicId)
      return next
    })
    setCounts(prev => ({
      ...prev,
      [topicId]: (prev[topicId] ?? 0) + (wasVoted ? -1 : 1),
    }))
    try {
      await fetch('/api/topics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicId, media_id: mediaId, media_type: mediaType }),
      })
    } finally {
      setLoading(null)
    }
  }

  // En çok oylananlar önce
  const sorted = [...topics].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
  const displayed = open ? sorted : sorted.slice(0, 8)
  const votedTopics = topics.filter(t => voted.has(t.id))

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Bu İçeriğin Konuları</h3>
        <Link href="/konular" className="text-xs text-[--accent] hover:underline">Tüm konular →</Link>
      </div>

      {/* Oylanan etiketler */}
      {votedTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {votedTopics.map(t => (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              disabled={loading !== null}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[--accent]/15 border border-[--accent]/40 text-[--accent] hover:bg-[--accent]/25 transition-colors"
            >
              <span>{t.emoji}</span>
              <span>{t.name}</span>
              <span className="ml-1 text-[--text-secondary]">{counts[t.id] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tüm konular butonu */}
      <div>
        <button
          onClick={() => setOpen(v => !v)}
          className="text-xs text-[--text-secondary] hover:text-white transition-colors mb-2"
        >
          {open ? '↑ Gizle' : '+ Konu Ekle'}
        </button>

        {open && (
          <div className="flex flex-wrap gap-1.5">
            {displayed.map(t => {
              const isVoted = voted.has(t.id)
              const count = counts[t.id] ?? 0
              return (
                <button
                  key={t.id}
                  onClick={() => isLoggedIn ? toggle(t.id) : undefined}
                  disabled={loading !== null || !isLoggedIn}
                  title={!isLoggedIn ? 'Oy vermek için giriş yap' : undefined}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                    isVoted
                      ? 'bg-[--accent]/15 border border-[--accent]/40 text-[--accent] hover:bg-[--accent]/25'
                      : 'bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:border-white/30 hover:text-white'
                  } ${!isLoggedIn ? 'opacity-60 cursor-default' : ''}`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.name}</span>
                  {count > 0 && <span className="ml-1 text-[--text-secondary]">{count}</span>}
                </button>
              )
            })}
            {sorted.length > 8 && !open && (
              <button onClick={() => setOpen(true)} className="px-2.5 py-1 rounded-full text-xs border border-[--border] text-[--text-secondary] hover:text-white transition-colors">
                +{sorted.length - 8} daha
              </button>
            )}
          </div>
        )}
      </div>

      {!isLoggedIn && open && (
        <p className="text-xs text-[--text-secondary] mt-2">
          Konu eklemek için{' '}
          <a href="/auth/giris" className="text-[--accent] hover:underline">giriş yap</a>.
        </p>
      )}
    </div>
  )
}
