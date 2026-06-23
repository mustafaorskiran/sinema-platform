'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconCheck } from '@/components/icons'

export default function BildirimlerClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markAllRead() {
    setLoading(true)
    await fetch('/api/notifications', { method: 'PATCH' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={markAllRead}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
    >
      <IconCheck className="h-3.5 w-3.5" />
      {loading ? 'İşleniyor...' : 'Tümünü okundu işaretle'}
    </button>
  )
}
