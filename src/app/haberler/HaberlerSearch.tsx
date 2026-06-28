'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export default function HaberlerSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  const submit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    router.push(`/haberler?${params.toString()}`)
  }, [value, searchParams, router])

  const clear = useCallback(() => {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/haberler?${params.toString()}`)
  }, [searchParams, router])

  return (
    <form onSubmit={submit} className="flex gap-2 mb-6">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Haberlerde ara..."
          className="w-full px-4 py-2 rounded-xl text-sm text-white outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
        {value && (
          <button type="button" onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            ✕
          </button>
        )}
      </div>
      <button type="submit"
        className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
        style={{ background: 'var(--accent)' }}>
        Ara
      </button>
    </form>
  )
}
