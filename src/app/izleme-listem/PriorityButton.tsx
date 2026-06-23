'use client'

import { useState } from 'react'

interface Props {
  itemId: string
  priority: number
}

export default function PriorityButton({ itemId, priority: initialPriority }: Props) {
  const [priority, setPriority] = useState(initialPriority)
  const [loading, setLoading] = useState(false)

  async function setPrio(p: number) {
    if (loading) return
    setLoading(true)
    const newP = priority === p ? 0 : p
    setPriority(newP)
    await fetch('/api/watchlist/priority', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, priority: newP }),
    })
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {[1, 2, 3].map(p => (
        <button key={p} onClick={() => setPrio(p)} disabled={loading}
          title={`Öncelik ${p}`}
          className={`text-base transition-colors leading-none ${p <= priority ? 'text-[--gold]' : 'text-[--text-secondary]/30 hover:text-[--gold]/60'}`}>
          ★
        </button>
      ))}
    </div>
  )
}
