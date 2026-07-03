'use client'

import { useState } from 'react'
import { IconUserPlus, IconUserCheck, IconLoader } from '@/components/icons'
import { useLocale } from '@/context/LocaleContext'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  isLoggedIn: boolean
}

export default function FollowButton({ targetUserId, initialFollowing, isLoggedIn }: FollowButtonProps) {
  const { t } = useLocale()
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
      className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-60"
      style={following
        ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
        : { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
      }>
      {loading
        ? <IconLoader className="h-4 w-4 animate-spin" />
        : following
          ? <IconUserCheck className="h-4 w-4" />
          : <IconUserPlus className="h-4 w-4" />
      }
      {following ? t('social.followingState') : t('profile.follow')}
    </button>
  )
}
