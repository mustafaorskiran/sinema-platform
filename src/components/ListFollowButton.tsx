'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconRss } from '@/components/icons'
import { useLocale } from '@/context/LocaleContext'

interface Props {
  listId: string
  isLoggedIn: boolean
  initialFollowing: boolean
  initialCount: number
}

export default function ListFollowButton({ listId, isLoggedIn, initialFollowing, initialCount }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setLoading(true)
    setFollowing(f => !f)
    setCount(c => following ? c - 1 : c + 1)

    await fetch(`/api/lists/${listId}/follow`, {
      method: following ? 'DELETE' : 'POST',
    })
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
        following
          ? 'bg-[--accent]/10 border-[--accent]/40 text-[--accent] hover:bg-[--accent]/20'
          : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/40'
      }`}
    >
      <IconRss className="h-4 w-4" />
      {following ? t('list.following') : t('list.follow')}
      {count > 0 && (
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${following ? 'bg-[--accent]/20 text-[--accent]' : 'bg-white/10 text-[--text-secondary]'}`}>
          {count}
        </span>
      )}
    </button>
  )
}
