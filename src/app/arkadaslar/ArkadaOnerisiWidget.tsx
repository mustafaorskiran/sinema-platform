'use client'

import { useEffect, useState } from 'react'

interface Suggestion {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  common_count: number
}

export default function ArkadaOnerisiWidget() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [followed, setFollowed] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/friend-suggestions').then(r => r.json()).then(d => {
      setSuggestions(d ?? [])
      setLoading(false)
    })
  }, [])

  async function follow(userId: string) {
    await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ following_id: userId }),
    })
    setFollowed(prev => new Set([...prev, userId]))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[--bg-card] animate-pulse" />
        ))}
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-4xl mb-3">🤝</p>
        <p className="text-sm text-[--text-secondary]">
          Henüz yeterli veri yok. Daha fazla film izleyerek başla!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {suggestions.map(s => (
        <div key={s.id} className="flex items-center gap-3 rounded-xl p-4 transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <a href={`/profil/${s.username}`}>
            {s.avatar_url
              ? <img src={s.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover shrink-0" />
              : <div className="h-12 w-12 rounded-full bg-[--bg-secondary] flex items-center justify-center text-white font-bold text-lg shrink-0">{s.username[0]?.toUpperCase()}</div>}
          </a>
          <div className="flex-1 min-w-0">
            <a href={`/profil/${s.username}`} className="text-sm font-semibold text-white hover:text-[--accent] transition-colors">@{s.username}</a>
            {s.bio && <p className="text-xs text-[--text-secondary] mt-0.5 line-clamp-1">{s.bio}</p>}
            <p className="text-[10px] text-[--accent] mt-0.5 font-medium">{s.common_count} ortak izlenen</p>
          </div>
          {followed.has(s.id) ? (
            <span className="text-xs text-green-400 font-semibold shrink-0">Takip Edildi ✓</span>
          ) : (
            <button onClick={() => follow(s.id)}
              className="px-3 py-1.5 text-xs rounded-full bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold transition-colors shrink-0">
              Takip Et
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
