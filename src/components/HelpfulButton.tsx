'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  reviewId: string
  initialCount: number
  initialMarked: boolean
  isLoggedIn: boolean
}

export default function HelpfulButton({ reviewId, initialCount, initialMarked, isLoggedIn }: Props) {
  const router = useRouter()
  const [marked, setMarked]   = useState(initialMarked)
  const [count,  setCount]    = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    if (loading) return
    setLoading(true)
    setMarked(!marked)
    setCount(c => marked ? c - 1 : c + 1)
    await fetch('/api/review-helpful', {
      method: marked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId }),
    })
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1 border transition-colors disabled:opacity-50 ${
        marked
          ? 'bg-green-500/15 border-green-500/30 text-green-400'
          : 'border-white/10 text-white/40 hover:text-green-400 hover:border-green-500/30 bg-white/5'
      }`}
      title={marked ? 'Faydalı işaretini kaldır' : 'Bu yorum faydalıydı'}>
      👍 Faydalı{count > 0 && <span className="font-semibold">{count}</span>}
    </button>
  )
}
