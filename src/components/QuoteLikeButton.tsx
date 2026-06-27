'use client'

import { useState } from 'react'

export default function QuoteLikeButton({ quoteId, initialLiked, initialCount }: {
  quoteId: string
  initialLiked: boolean
  initialCount: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/alintilar/${quoteId}/begen`, { method: 'POST' })
      if (res.status === 401) { window.location.href = '/giris'; return }
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.likes_count)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-1 text-xs transition-all hover:scale-110"
      style={{ color: liked ? '#E11D48' : 'rgba(255,255,255,0.35)' }}
      title={liked ? 'Beğeniyi kaldır' : 'Beğen'}
    >
      <span className="text-base leading-none">{liked ? '♥' : '♡'}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
