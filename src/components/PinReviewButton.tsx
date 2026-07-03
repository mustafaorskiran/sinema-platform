'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

interface Props {
  reviewId: string
  isPinned: boolean
}

export default function PinReviewButton({ reviewId, isPinned }: Props) {
  const [pinned, setPinned] = useState(isPinned)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLocale()

  async function handleClick() {
    setLoading(true)
    try {
      if (pinned) {
        const res = await fetch('/api/pinned-review', { method: 'DELETE' })
        if (res.ok) setPinned(false)
      } else {
        const res = await fetch('/api/pinned-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review_id: reviewId }),
        })
        if (res.ok) setPinned(true)
      }
      router.refresh()
    } catch {
      // Ağ hatası — UI durumu DB'yi yansıtsın
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={pinned ? t('review.unpin') : t('review.pinToProfile')}
      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors disabled:opacity-50 shrink-0 ${
        pinned
          ? 'border-[--accent]/50 text-[--accent] bg-[--accent]/10 hover:bg-[--accent]/20'
          : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30'
      }`}
    >
      {pinned ? t('review.pinnedBadge') : t('review.pinBtn')}
    </button>
  )
}
