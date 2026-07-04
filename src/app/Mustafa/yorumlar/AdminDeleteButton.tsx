'use client'

import { useState } from 'react'
import { IconLoader, IconTrash } from '@/components/icons'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'review' | 'reply'
}

export default function AdminDeleteButton({ id, type }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Bu içeriği silmek istediğine emin misin?')) return
    setLoading(true)
    await fetch(`/api/admin/${type === 'review' ? 'reviews' : 'replies'}/${id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50 shrink-0"
      title="Sil"
    >
      {loading ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconTrash className="h-4 w-4" />}
    </button>
  )
}
