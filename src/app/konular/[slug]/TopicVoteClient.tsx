'use client'

import { useState } from 'react'

interface Props {
  topicId: number
  mediaId: number
  mediaType: string
  initialVoted: boolean
}

export default function TopicVoteClient({ topicId, mediaId, mediaType, initialVoted }: Props) {
  const [voted, setVoted] = useState(initialVoted)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    setVoted(v => !v)
    try {
      await fetch('/api/topics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicId, media_id: mediaId, media_type: mediaType }),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={voted ? 'Oyunu kaldır' : 'Oyla'}
      className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
        voted
          ? 'text-[--accent] bg-[--accent]/10 hover:bg-[--accent]/20'
          : 'text-[--text-secondary] hover:text-white'
      }`}
    >
      {voted ? '✓' : '+'}
    </button>
  )
}
