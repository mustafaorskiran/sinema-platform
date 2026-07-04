'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApproveQuoteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function approve() {
    setLoading(true)
    await fetch('/api/admin/quotes/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  async function reject() {
    setLoading(true)
    await fetch('/api/admin/quotes/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button onClick={approve} disabled={loading} className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50">
        Onayla
      </button>
      <button onClick={reject} disabled={loading} className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50">
        Reddet
      </button>
    </div>
  )
}
