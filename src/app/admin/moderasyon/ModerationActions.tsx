'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconEye, IconEyeOff, IconTrash } from '@/components/icons'

interface Props {
  id: string
  isHidden: boolean
}

export default function ModerationActions({ id, isHidden }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function act(action: 'hide' | 'unhide') {
    setLoading(true)
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setLoading(false)
    router.refresh()
  }

  async function del() {
    if (!confirm('Bu yorumu kalıcı olarak silmek istediğinden emin misin?')) return
    setLoading(true)
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {isHidden ? (
        <button
          onClick={() => act('unhide')}
          disabled={loading}
          title="Göster"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
        >
          <IconEye className="h-3.5 w-3.5" />
          Göster
        </button>
      ) : (
        <button
          onClick={() => act('hide')}
          disabled={loading}
          title="Gizle"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
        >
          <IconEyeOff className="h-3.5 w-3.5" />
          Gizle
        </button>
      )}
      <button
        onClick={del}
        disabled={loading}
        title="Sil"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
      >
        <IconTrash className="h-3.5 w-3.5" />
        Sil
      </button>
    </div>
  )
}
