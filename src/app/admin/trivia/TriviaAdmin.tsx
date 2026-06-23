'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TriviaItem {
  id: string
  media_id: number
  media_type: string
  type: 'trivia' | 'goof'
  content: string
  profiles: { username: string } | null
  created_at: string
}

export default function TriviaAdmin({ items }: { items: TriviaItem[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  async function handle(id: string, action: 'approve' | 'reject') {
    setProcessing(id)
    await fetch('/api/admin/trivia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    setProcessing(null)
    router.refresh()
  }

  if (items.length === 0) {
    return <div className="py-16 text-center text-[--text-secondary] bg-[--bg-card] border border-[--border] rounded-2xl">Onay bekleyen içerik yok ✓</div>
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="bg-[--bg-card] border border-[--border] rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${item.type === 'trivia' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'}`}>
              {item.type === 'trivia' ? 'Trivia' : 'Goof'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm leading-relaxed">{item.content}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[--text-secondary]">
                <a href={`/${item.media_type}/${item.media_id}`} className="hover:text-white" target="_blank">
                  {item.media_type}/{item.media_id}
                </a>
                {item.profiles?.username && <span>@{item.profiles.username}</span>}
                <span>{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handle(item.id, 'approve')}
                disabled={processing === item.id}
                className="px-3 py-1.5 bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
              >
                ✓ Onayla
              </button>
              <button
                onClick={() => handle(item.id, 'reject')}
                disabled={processing === item.id}
                className="px-3 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
              >
                ✗ Reddet
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
