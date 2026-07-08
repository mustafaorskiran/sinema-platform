'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconTrash } from '@/components/icons'
import { useLocale } from '@/context/LocaleContext'

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { t } = useLocale()

  async function handleDelete() {
    if (!confirm(t('review.deleteConfirmShort'))) return
    setLoading(true)
    await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[--text-secondary] hover:text-red-400 transition-colors disabled:opacity-50"
      title={t('review.delete')}
      aria-label={t('review.delete')}
    >
      <IconTrash className="h-4 w-4" />
    </button>
  )
}
