'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconLoader, IconPlus, IconClose } from '@/components/icons'

interface MediaItem {
  media_id: number
  media_type: string
  title: string
}

export default function YeniPartiForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [items, setItems] = useState<MediaItem[]>([])
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    if (!searchQ.trim()) return
    setSearching(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}`)
    const data = await res.json()
    setSearchResults(data?.results?.slice(0, 8) ?? [])
    setSearching(false)
  }

  function addItem(r: any) {
    const type = r.media_type ?? (r.title ? 'movie' : 'tv')
    const mediaType = type === 'movie' ? 'film' : 'dizi'
    const mediaId = r.id
    const title = r.title ?? r.name ?? `#${r.id}`
    if (items.find(i => i.media_id === mediaId && i.media_type === mediaType)) return
    setItems(prev => [...prev, { media_id: mediaId, media_type: mediaType, title }])
    setSearchResults([])
    setSearchQ('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Başlık zorunlu'); return }
    setLoading(true)
    const res = await fetch('/api/watch-parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, scheduled_at: scheduledAt || null, items }),
    })
    const data = await res.json()
    if (data.id) {
      router.push(`/film-gecesi/${data.id}`)
    } else {
      setError(data.error ?? 'Hata oluştu')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Etkinlik Adı *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Haftalık Film Gecesi"
          className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Açıklama</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={500}
          className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">Tarih & Saat</label>
        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
          className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white outline-none focus:border-[--accent] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-2">İzleme Listesi</label>
        <div className="flex gap-2 mb-2">
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), search())}
            placeholder="Film veya dizi ara..."
            className="flex-1 rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
          />
          <button type="button" onClick={search} disabled={searching}
            className="px-4 py-2 bg-[--bg-secondary] border border-[--border] rounded-lg text-sm text-white hover:border-[--accent]/50 transition-colors">
            {searching ? '...' : 'Ara'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="rounded-lg border border-[--border] bg-[--bg-secondary] overflow-hidden mb-2">
            {searchResults.map((r: any) => (
              <button key={r.id} type="button" onClick={() => addItem(r)}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors border-b border-[--border]/50 last:border-0">
                <span>{r.title ?? r.name}</span>
                <span className="ml-2 text-[10px] text-[--text-secondary]">
                  {(r.media_type === 'movie' || r.title) ? 'Film' : 'Dizi'}
                </span>
              </button>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-1">
            {items.map((item, idx) => (
              <div key={`${item.media_id}-${item.media_type}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[--bg-secondary] border border-[--border]">
                <span className="text-xs text-[--text-secondary] w-5">{idx + 1}.</span>
                <span className="flex-1 text-sm text-white truncate">{item.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {item.media_type === 'film' ? 'Film' : 'Dizi'}
                </span>
                <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}>
                  <IconClose className="h-3.5 w-3.5 text-[--text-secondary] hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3 rounded-lg border border-[--border] text-[--text-secondary] hover:text-white text-sm font-medium transition-colors">
          Vazgeç
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <IconLoader className="h-4 w-4 animate-spin" />}
          {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
        </button>
      </div>
    </form>
  )
}
