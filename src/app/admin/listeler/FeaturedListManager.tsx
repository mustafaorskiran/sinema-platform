'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconStar, IconLoader, IconCheck, IconHeart, IconArrowRight } from '@/components/icons'

interface FeaturedList {
  id: string
  title: string
  profiles: { username: string } | null
  list_items: { count: number }[]
  list_likes: { count: number }[]
  is_featured: boolean
  featured_until: string | null
}

export default function FeaturedListManager({ lists: initial }: { lists: FeaturedList[] }) {
  const [lists, setLists] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone]     = useState<string | null>(null)

  async function toggle(list: FeaturedList) {
    setLoading(list.id)
    const action = list.is_featured ? 'unfeature' : 'feature'
    const res = await fetch(`/api/admin/lists/${list.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setLoading(null)
    if (res.ok) {
      setLists(prev => prev.map(l =>
        l.id === list.id
          ? { ...l, is_featured: !l.is_featured, featured_until: action === 'feature' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null }
          : l
      ))
      setDone(list.id)
      setTimeout(() => setDone(null), 2000)
    }
  }

  const featured    = lists.filter(l => l.is_featured)
  const notFeatured = lists.filter(l => !l.is_featured)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <IconStar className="h-5 w-5 fill-[--gold] text-[--gold]" />
          Haftanın Listeleri
        </h2>
        <p className="text-xs text-[--text-secondary]">
          Seçilen listeler 7 gün boyunca ana sayfada öne çıkar. Maksimum 4 liste önerilir.
        </p>
      </div>

      {/* Aktif öne çıkarılmışlar */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-[--gold] uppercase tracking-widest mb-3">
          Şu An Öne Çıkan ({featured.length})
        </h3>
        {featured.length === 0 ? (
          <div className="rounded-xl py-8 text-center text-sm text-[--text-secondary]" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            Henüz öne çıkarılmış liste yok.
          </div>
        ) : (
          <div className="space-y-2">
            {featured.map(list => (
              <ListRow key={list.id} list={list} loading={loading} done={done} onToggle={toggle} />
            ))}
          </div>
        )}
      </div>

      {/* Öne çıkarılabilir listeler */}
      <div>
        <h3 className="text-sm font-semibold text-[--text-secondary] uppercase tracking-widest mb-3">
          Öne Çıkarılabilir ({notFeatured.length})
        </h3>
        {notFeatured.length === 0 ? (
          <div className="rounded-xl py-8 text-center text-sm text-[--text-secondary]" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            Tüm listeler zaten öne çıkarılmış.
          </div>
        ) : (
          <div className="space-y-2">
            {notFeatured.map(list => (
              <ListRow key={list.id} list={list} loading={loading} done={done} onToggle={toggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ListRow({ list, loading, done, onToggle }: {
  list: FeaturedList
  loading: string | null
  done: string | null
  onToggle: (list: FeaturedList) => void
}) {
  const isLoading = loading === list.id
  const isDone    = done === list.id
  const until     = list.featured_until ? new Date(list.featured_until).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : null

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
      list.is_featured ? 'bg-[--gold]/5 border-[--gold]/30' : 'bg-[--bg-card] border-[--border]'
    }`}>
      <div className="flex-1 min-w-0">
        <Link href={`/liste/${list.id}`} target="_blank"
          className="text-sm font-medium text-white hover:text-[--accent] transition-colors truncate block">
          {list.title}
        </Link>
        <div className="flex items-center gap-3 mt-1 text-xs text-[--text-secondary]">
          <span>@{list.profiles?.username ?? '—'}</span>
          <span>{list.list_items?.[0]?.count ?? 0} içerik</span>
          <span className="inline-flex items-center gap-1"><IconHeart size={14} />{list.list_likes?.[0]?.count ?? 0}</span>
          {until && <span className="text-[--gold] inline-flex items-center gap-1"><IconArrowRight size={14} />{until} kadar</span>}
        </div>
      </div>
      <button
        onClick={() => onToggle(list)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
          list.is_featured
            ? 'bg-[--gold]/20 text-[--gold] border border-[--gold]/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
            : 'bg-[--bg-secondary] text-[--text-secondary] border border-[--border] hover:bg-[--gold]/10 hover:text-[--gold] hover:border-[--gold]/40'
        }`}
      >
        {isLoading
          ? <IconLoader className="h-4 w-4 animate-spin" />
          : isDone
            ? <IconCheck className="h-4 w-4" />
            : list.is_featured
              ? <><IconStar className="h-4 w-4 fill-current" /> Kaldır</>
              : <><IconStar className="h-4 w-4" /> Öne Çıkar</>
        }
      </button>
    </div>
  )
}
