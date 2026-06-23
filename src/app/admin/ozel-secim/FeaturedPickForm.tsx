'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconSearch } from '@/components/icons'

interface SearchResult {
  id: number
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  poster_path: string | null
  media_type?: string
}

const LABELS = ['Haftanın Filmi', 'Haftanın Dizisi', 'Ayın Filmi', 'Editörün Seçimi', 'Mutlaka İzle']

export default function FeaturedPickForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<{ id: number; type: string; title: string; poster: string | null } | null>(null)
  const [label, setLabel] = useState(LABELS[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function search(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await r.json()
      setResults(
        (data.results ?? [])
          .filter((x: SearchResult) => x.media_type === 'movie' || x.media_type === 'tv')
          .slice(0, 8)
      )
    } catch {}
  }

  async function save() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch('/api/featured-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: selected.id, media_type: selected.type, label, note }),
      })
      if (res.ok) {
        setSaved(true)
        setSelected(null)
        setQuery('')
        setResults([])
        setNote('')
        setTimeout(() => { setSaved(false); router.refresh() }, 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[--bg-card] border border-[--border] rounded-2xl p-6 max-w-xl">
      <h2 className="text-base font-bold text-white mb-4">Yeni Seçim Ekle</h2>

      {/* Arama */}
      {!selected ? (
        <div className="relative">
          <div className="relative mb-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary]" />
            <input
              type="text"
              value={query}
              onChange={e => search(e.target.value)}
              placeholder="Film veya dizi adı yaz..."
              className="w-full rounded-xl border border-[--border] bg-[--bg-secondary] pl-9 pr-4 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
            />
          </div>
          {results.length > 0 && (
            <div className="border border-[--border] rounded-xl bg-[--bg-secondary] overflow-hidden">
              {results.map(r => {
                const title = r.title ?? r.name ?? ''
                const year = (r.release_date ?? r.first_air_date ?? '').slice(0, 4)
                const type = r.media_type === 'tv' ? 'dizi' : 'film'
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelected({ id: r.id, type, title, poster: r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : null })
                      setResults([])
                      setQuery('')
                      setLabel(type === 'dizi' ? 'Haftanın Dizisi' : 'Haftanın Filmi')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[--bg-card] transition-colors text-left border-b border-[--border]/50 last:border-0"
                  >
                    <div className="w-8 h-11 rounded bg-[--bg-card] shrink-0 overflow-hidden">
                      {r.poster_path && <img src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div>
                      <p className="text-sm text-white">{title}</p>
                      <p className="text-xs text-[--text-secondary]">{year} · {type === 'dizi' ? 'Dizi' : 'Film'}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-[--accent]/30 bg-[--accent]/5 mb-4">
          {selected.poster && <img src={selected.poster} className="w-10 h-14 rounded object-cover shrink-0" alt="" />}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">{selected.title}</p>
            <p className="text-xs text-[--accent]">{selected.type}</p>
          </div>
          <button onClick={() => setSelected(null)} className="text-xs text-[--text-secondary] hover:text-white transition-colors">Değiştir</button>
        </div>
      )}

      {/* Label seçimi */}
      <div className="mt-4">
        <label className="text-xs text-[--text-secondary] font-medium block mb-1.5">Etiket</label>
        <div className="flex flex-wrap gap-2">
          {LABELS.map(l => (
            <button
              key={l}
              onClick={() => setLabel(l)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                label === l
                  ? 'bg-[--accent] border-[--accent] text-white'
                  : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-white/20'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Not */}
      <div className="mt-4">
        <label className="text-xs text-[--text-secondary] font-medium block mb-1.5">Not (isteğe bağlı)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Ana sayfada gösterilecek kısa not..."
          className="w-full rounded-xl border border-[--border] bg-[--bg-secondary] px-3 py-2 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] resize-none transition-colors"
        />
      </div>

      <button
        onClick={save}
        disabled={!selected || loading}
        className="mt-4 w-full py-2.5 rounded-xl bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saved ? '✓ Kaydedildi!' : loading ? 'Kaydediliyor...' : 'Ana Sayfaya Sabitle'}
      </button>
    </div>
  )
}
