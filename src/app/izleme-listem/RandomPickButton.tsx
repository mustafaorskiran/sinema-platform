'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconShuffle } from '@/components/icons'

interface Item {
  id: number
  type: string
  title: string
  poster: string | null
}

export default function RandomPickButton({ items }: { items: Item[] }) {
  const [pick, setPick] = useState<Item | null>(null)

  function randomPick() {
    const idx = Math.floor(Math.random() * items.length)
    setPick(items[idx])
  }

  return (
    <>
      <button onClick={randomPick}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[--accent] text-[--accent] hover:bg-[--accent] hover:text-white transition-colors text-sm font-semibold">
        <IconShuffle className="h-4 w-4" />
        Bugün Ne İzlesem?
      </button>

      {pick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPick(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 rounded-2xl bg-[--bg-card] border border-[--border] p-8 max-w-xs w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="text-xs font-semibold text-[--accent] uppercase tracking-widest mb-4">Bugünkü Seçim</p>
            {pick.poster && (
              <img src={pick.poster} alt={pick.title}
                className="w-32 aspect-[2/3] object-cover rounded-xl mx-auto mb-4 shadow-lg" />
            )}
            <h2 className="text-xl font-bold text-white mb-5">{pick.title}</h2>
            <div className="flex gap-3 justify-center">
              <Link href={`/${pick.type}/${pick.id}`}
                className="flex-1 py-2.5 rounded-xl bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold transition-colors">
                Sayfaya Git
              </Link>
              <button onClick={randomPick}
                className="flex-1 py-2.5 rounded-xl border border-[--border] text-[--text-secondary] hover:text-white text-sm font-semibold transition-colors">
                Başka Öner
              </button>
            </div>
            <button onClick={() => setPick(null)} className="mt-4 text-xs text-[--text-secondary] hover:text-white transition-colors">Kapat</button>
          </div>
        </div>
      )}
    </>
  )
}
