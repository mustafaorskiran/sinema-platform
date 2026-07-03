'use client'

import { useState } from 'react'
import { IconBookmarkFilled, IconBookmark, IconCheck, IconLoader } from '@/components/icons'
import type { MediaType } from '@/lib/types'
import { useLocale } from '@/context/LocaleContext'

interface WatchlistButtonProps {
  mediaId: number
  mediaType: MediaType
  initialStatus: 'izlemek-istiyorum' | 'izledim' | null
  isLoggedIn: boolean
}

export default function WatchlistButton({ mediaId, mediaType, initialStatus, isLoggedIn }: WatchlistButtonProps) {
  const { t } = useLocale()
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
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => handleClick('izlemek-istiyorum')}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
        style={status === 'izlemek-istiyorum'
          ? { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }
          : { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(255,255,255,0.7)' }
        }
      >
        {loading && status !== 'izlemek-istiyorum'
          ? <IconLoader className="h-4 w-4 animate-spin" />
          : status === 'izlemek-istiyorum'
            ? <IconBookmarkFilled className="h-4 w-4" />
            : <IconBookmark className="h-4 w-4" />
        }
        {t('watchlist.wantToWatch')}
      </button>

      <button
        onClick={() => handleClick('izledim')}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
        style={status === 'izledim'
          ? { background: 'linear-gradient(135deg, #22c55e, #15803d)', color: '#fff', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }
          : { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: 'rgba(255,255,255,0.7)' }
        }
      >
        {loading && status !== 'izledim'
          ? <IconLoader className="h-4 w-4 animate-spin" />
          : <IconCheck className="h-4 w-4" />
        }
        {t('watchlist.watched')}
      </button>
    </div>
  )
}
