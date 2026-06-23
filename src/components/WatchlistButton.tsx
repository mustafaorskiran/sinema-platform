'use client'

import { useState } from 'react'
import { IconBookmarkFilled, IconBookmark, IconCheck, IconLoader } from '@/components/icons'
import type { MediaType } from '@/lib/types'

interface WatchlistButtonProps {
  mediaId: number
  mediaType: MediaType
  initialStatus: 'izlemek-istiyorum' | 'izledim' | null
  isLoggedIn: boolean
}

export default function WatchlistButton({ mediaId, mediaType, initialStatus, isLoggedIn }: WatchlistButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  async function handleClick(newStatus: 'izlemek-istiyorum' | 'izledim') {
    if (!isLoggedIn) { window.location.href = '/auth/giris'; return }
    setLoading(true)
    try {
      if (status === newStatus) {
        await fetch('/api/watchlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ media_id: mediaId, media_type: mediaType }) })
        setStatus(null)
      } else {
        await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ media_id: mediaId, media_type: mediaType, status: newStatus }) })
        setStatus(newStatus)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => handleClick('izlemek-istiyorum')} disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
          status === 'izlemek-istiyorum' ? 'bg-blue-600 text-white' : 'bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:text-white hover:border-blue-500'
        }`}>
        {loading && status !== 'izlemek-istiyorum'
          ? <IconLoader className="h-4 w-4 animate-spin" />
          : status === 'izlemek-istiyorum'
            ? <IconBookmarkFilled className="h-4 w-4" />
            : <IconBookmark className="h-4 w-4" />
        }
        İzlemek İstiyorum
      </button>

      <button onClick={() => handleClick('izledim')} disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
          status === 'izledim' ? 'bg-green-600 text-white' : 'bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:text-white hover:border-green-500'
        }`}>
        {loading && status !== 'izledim'
          ? <IconLoader className="h-4 w-4 animate-spin" />
          : <IconCheck className="h-4 w-4" />
        }
        İzledim
      </button>
    </div>
  )
}
