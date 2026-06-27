'use client'

import { useState, useEffect, useRef } from 'react'
import { IconListPlus, IconCheck, IconPlus, IconLoader, IconChevronDown } from '@/components/icons'
import Link from 'next/link'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  userId: string
}

interface UserList {
  id: string
  title: string
  item_exists: boolean
  item_id: string | null
}

export default function AddToListButton({ mediaId, mediaType, userId }: Props) {
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<UserList[]>([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function openDropdown() {
    setOpen(o => !o)
    if (lists.length > 0) return
    setLoading(true)
    const res = await fetch(`/api/lists/user?media_id=${mediaId}&media_type=${mediaType}`)
    if (res.ok) setLists(await res.json())
    setLoading(false)
  }

  async function toggle(list: UserList) {
    setToggling(list.id)
    if (list.item_exists && list.item_id) {
      await fetch(`/api/lists/${list.id}/items/${list.item_id}`, { method: 'DELETE' })
      setLists(prev => prev.map(l => l.id === list.id ? { ...l, item_exists: false, item_id: null } : l))
    } else {
      const res = await fetch(`/api/lists/${list.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId, media_type: mediaType }),
      })
      if (res.ok) {
        const item = await res.json()
        setLists(prev => prev.map(l => l.id === list.id ? { ...l, item_exists: true, item_id: item.id } : l))
      }
    }
    setToggling(null)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={openDropdown}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] bg-[--bg-card] text-[--text-secondary] hover:text-white hover:border-white/30 text-sm font-medium transition-colors"
      >
        <IconListPlus className="h-4 w-4" />
        Listeye Ekle
        <IconChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl rounded-xl shadow-xl z-50 overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader className="h-5 w-5 animate-spin text-[--text-secondary]" />
            </div>
          ) : lists.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-[--text-secondary] mb-3">Henüz listeniz yok.</p>
              <Link href="/liste/yeni" onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent] hover:underline">
                <IconPlus className="h-3.5 w-3.5" /> Yeni Liste Oluştur
              </Link>
            </div>
          ) : (
            <>
              <div className="max-h-60 overflow-y-auto">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => toggle(list)}
                    disabled={toggling === list.id}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[--bg-secondary] transition-colors text-left"
                  >
                    <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${list.item_exists ? 'bg-[--accent] border-[--accent]' : 'border-[--border]'}`}>
                      {toggling === list.id
                        ? <IconLoader className="h-3 w-3 animate-spin text-white" />
                        : list.item_exists
                          ? <IconCheck className="h-3 w-3 text-white" />
                          : null
                      }
                    </div>
                    <span className="text-sm text-white truncate">{list.title}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[--border] p-2">
                <Link href="/liste/yeni" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[--bg-secondary] text-sm text-[--text-secondary] hover:text-white transition-colors">
                  <IconPlus className="h-4 w-4" /> Yeni Liste Oluştur
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
