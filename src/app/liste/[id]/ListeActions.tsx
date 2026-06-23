'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconHeart, IconHeartFilled, IconRss } from '@/components/icons'

interface Props {
  listId: string
  isLoggedIn: boolean
  isOwner: boolean
  initialLiked: boolean
  initialLikeCount: number
  initialFollowing: boolean
  initialFollowCount: number
}

export default function ListeActions({
  listId,
  isLoggedIn,
  isOwner,
  initialLiked,
  initialLikeCount,
  initialFollowing,
  initialFollowCount,
}: Props) {
  const router = useRouter()
  const [liked, setLiked]           = useState(initialLiked)
  const [likeCount, setLikeCount]   = useState(initialLikeCount)
  const [following, setFollowing]   = useState(initialFollowing)
  const [followCount, setFollowCount] = useState(initialFollowCount)
  const [liking, setLiking]         = useState(false)
  const [folling, setFolling]       = useState(false)

  async function toggleLike() {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setLiking(true)
    setLiked(l => !l)
    setLikeCount(c => liked ? c - 1 : c + 1)
    await fetch('/api/list-likes', {
      method: liked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list_id: listId }),
    })
    setLiking(false)
  }

  async function toggleFollow() {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setFolling(true)
    setFollowing(f => !f)
    setFollowCount(c => following ? c - 1 : c + 1)
    await fetch(`/api/lists/${listId}/follow`, {
      method: following ? 'DELETE' : 'POST',
    })
    setFolling(false)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Like */}
      <button
        onClick={toggleLike}
        disabled={liking}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
          liked
            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
            : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-red-400 hover:border-red-500/30'
        }`}
      >
        {liked
          ? <IconHeartFilled className="h-4 w-4" />
          : <IconHeart className="h-4 w-4" />}
        <span>{liked ? 'Beğenildi' : 'Beğen'}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[22px] text-center ${liked ? 'bg-red-500/20' : 'bg-white/10'}`}>
          {likeCount}
        </span>
      </button>

      {/* Follow — only for non-owners */}
      {!isOwner && (
        <button
          onClick={toggleFollow}
          disabled={folling}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            following
              ? 'bg-[--accent]/10 border-[--accent]/30 text-[--accent] hover:bg-[--accent]/20'
              : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/30'
          }`}
        >
          <IconRss className="h-4 w-4" />
          <span>{following ? 'Takiptesin' : 'Takip Et'}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[22px] text-center ${following ? 'bg-[--accent]/20' : 'bg-white/10'}`}>
            {followCount}
          </span>
        </button>
      )}
    </div>
  )
}
