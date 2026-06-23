'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinButton({ partyId, initialJoined }: { partyId: string; initialJoined: boolean }) {
  const router = useRouter()
  const [joined, setJoined] = useState(initialJoined)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    if (joined) {
      await fetch('/api/watch-parties/join', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ party_id: partyId }),
      })
    } else {
      await fetch('/api/watch-parties/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ party_id: partyId }),
      })
    }
    setJoined(!joined)
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
        joined
          ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
          : 'bg-[--accent] hover:bg-[--accent-hover] text-white'
      }`}>
      {joined ? '✓ Katılıyorum' : 'Katıl'}
    </button>
  )
}
