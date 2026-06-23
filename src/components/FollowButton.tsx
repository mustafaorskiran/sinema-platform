'use client'

import { useState } from 'react'
import { IconUserPlus, IconUserCheck, IconLoader } from '@/components/icons'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  isLoggedIn: boolean
}

export default function FollowButton({ targetUserId, initialFollowing, isLoggedIn }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isLoggedIn) { window.location.href = '/auth/giris'; return }
    if (loading) return
    setLoading(true)
    const wasFollowing = following
    setFollowing(!wasFollowing)
    try {
      await fetch('/api/follow', {
        method: wasFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: targetUserId }),
      })
    } catch {
      setFollowing(wasFollowing)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
        following
          ? 'bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:border-red-500 hover:text-red-400'
          : 'bg-[--accent] hover:bg-[--accent-hover] text-white'
      }`}>
      {loading
        ? <IconLoader className="h-4 w-4 animate-spin" />
        : following
          ? <IconUserCheck className="h-4 w-4" />
          : <IconUserPlus className="h-4 w-4" />
      }
      {following ? 'Takip Ediliyor' : 'Takip Et'}
    </button>
  )
}
