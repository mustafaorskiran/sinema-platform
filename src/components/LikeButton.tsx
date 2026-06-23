'use client'

import { useState } from 'react'
import { IconHeartFilled, IconHeart } from '@/components/icons'

interface LikeButtonProps {
  reviewId: string
  initialCount: number
  initialLiked: boolean
  isLoggedIn: boolean
}

export default function LikeButton({ reviewId, initialCount, initialLiked, isLoggedIn }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isLoggedIn) { window.location.href = '/auth/giris'; return }
    if (loading) return
    setLoading(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount(wasLiked ? count - 1 : count + 1)
    try {
      await fetch('/api/likes', {
        method: wasLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId }),
      })
    } catch {
      setLiked(wasLiked)
      setCount(wasLiked ? count + 1 : count - 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        liked ? 'text-red-400 hover:text-red-300' : 'text-[--text-secondary] hover:text-red-400'
      }`}
    >
      {liked
        ? <IconHeartFilled className="h-4 w-4 transition-transform active:scale-125" />
        : <IconHeart className="h-4 w-4 transition-transform active:scale-125" />
      }
      {count > 0 && <span className="text-xs font-medium">{count}</span>}
    </button>
  )
}
