'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

export default function MessageButton({ targetUserId }: { targetUserId: string }) {
  const router = useRouter()
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)

  async function open() {
    setLoading(true)
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ other_user_id: targetUserId }),
    })
    const { id } = await res.json()
    if (id) router.push(`/mesajlar/${id}`)
    setLoading(false)
  }

  return (
    <button onClick={open} disabled={loading}
      className="px-3 py-1.5 rounded-lg border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-[--accent]/50 transition-colors disabled:opacity-50">
      {loading ? '...' : `💬 ${t('social.message')}`}
    </button>
  )
}
