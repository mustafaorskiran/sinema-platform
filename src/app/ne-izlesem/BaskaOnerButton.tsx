'use client'

import { useRouter } from 'next/navigation'
import { IconShuffle } from '@/components/icons'

export default function BaskaOnerButton() {
  const router = useRouter()

  function handleClick() {
    const seed = Math.floor(Math.random() * 1_000_000)
    router.push(`/ne-izlesem?seed=${seed}`)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
    >
      <IconShuffle className="h-4 w-4" />
      Başka Öner
    </button>
  )
}
