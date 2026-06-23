'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResolveButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function resolve() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('reports').update({ resolved: true }).eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={resolve} disabled={loading}
      className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 shrink-0">
      Çözüldü
    </button>
  )
}
