'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconBookmark, IconCheck } from '@/components/icons'

interface QuickActionsProps {
  mediaId: number
  type: 'film' | 'dizi'
}

type BtnState = 'idle' | 'loading' | 'done'

export default function QuickActions({ mediaId, type }: QuickActionsProps) {
  const router = useRouter()
  const [watchedState, setWatchedState] = useState<BtnState>('idle')
  const [listState, setListState] = useState<BtnState>('idle')

  async function handleAction(status: string, setState: (s: BtnState) => void) {
    setState('loading')
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId, media_type: type, status }),
      })
      if (res.status === 401) {
        router.push('/auth/giris')
        setState('idle')
        return
      }
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  return (
    <div className="flex sm:hidden gap-1.5 px-2 pb-2 mt-1">
      <button
        onClick={e => { e.preventDefault(); handleAction('watched', setWatchedState) }}
        disabled={watchedState === 'loading'}
        title="İzledim olarak işaretle"
        className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold border transition-colors disabled:opacity-60 ${
          watchedState === 'done'
            ? 'bg-green-500/20 border-green-500/40 text-green-400'
            : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30'
        }`}
      >
        <IconCheck className="h-3 w-3" />
        {watchedState === 'done' ? 'Eklendi!' : 'İzledim'}
      </button>

      <button
        onClick={e => { e.preventDefault(); handleAction('plan_to_watch', setListState) }}
        disabled={listState === 'loading'}
        title="İzleme listeme ekle"
        className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold border transition-colors disabled:opacity-60 ${
          listState === 'done'
            ? 'bg-[--accent]/20 border-[--accent]/40 text-[--accent]'
            : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30'
        }`}
      >
        <IconBookmark className="h-3 w-3" />
        {listState === 'done' ? 'Eklendi!' : 'Listeme'}
      </button>
    </div>
  )
}
