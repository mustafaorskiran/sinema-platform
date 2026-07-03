'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

interface FavoriteItem {
  id: string
  media_id: number
  media_type: string
  position: number
  title: string
  poster: string | null
}

interface Props {
  favorites: FavoriteItem[]
  isOwnProfile: boolean
}

export default function FavoritesEditor({ favorites, isOwnProfile }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [editing, setEditing] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ id: number; title: string; poster: string | null; type: string }[]>([])
  const [searching, setSearching] = useState(false)

  const slots = [1, 2, 3, 4]

  async function search(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`)
      const data = await res.json()
      setResults(data?.results ?? [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  async function pick(mediaId: number, mediaType: string, position: number) {
    await fetch('/api/profile-favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType === 'movie' ? 'film' : mediaType === 'tv' ? 'dizi' : mediaType, position }),
    })
    setEditing(null)
    setQuery('')
    setResults([])
    router.refresh()
  }

  async function remove(position: number) {
    await fetch(`/api/profile-favorites?position=${position}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {slots.map(pos => {
        const fav = favorites.find(f => f.position === pos)
        return (
          <div key={pos} className="relative">
            {fav ? (
              <div className="group relative aspect-[2/3] rounded-xl overflow-hidden rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href={`/${fav.media_type}/${fav.media_id}`}>
                  {fav.poster
                    ? <img src={fav.poster} alt={fav.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-[--text-secondary] p-2 text-center">{fav.title}</div>
                  }
                </Link>
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => { setEditing(pos); setQuery(''); setResults([]) }}
                      className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors"
                    >
                      {t('favorites.change')}
                    </button>
                    <button
                      onClick={() => remove(pos)}
                      className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1 rounded-full transition-colors"
                    >
                      {t('favorites.remove')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => isOwnProfile ? setEditing(pos) : undefined}
                className={`aspect-[2/3] rounded-xl border-2 border-dashed border-[--border] flex items-center justify-center ${isOwnProfile ? 'cursor-pointer hover:border-[--accent]/50 transition-colors' : ''}`}
              >
                {isOwnProfile && <span className="text-2xl text-[--text-secondary]">+</span>}
              </div>
            )}

            {/* Arama modalı */}
            {editing === pos && (
              <div className="absolute top-0 left-0 z-50 w-64 rounded-xl shadow-xl p-3" style={{ background: 'rgba(14,20,32,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-white">{t('favorites.pickTitle')}</p>
                  <button onClick={() => setEditing(null)} className="text-[--text-secondary] hover:text-white text-lg leading-none">×</button>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => search(e.target.value)}
                  placeholder={t('favorites.searchPlaceholder')}
                  className="w-full text-sm rounded-xl rounded-lg px-3 py-2 text-white placeholder-[--text-secondary] outline-none focus:border-[--accent]" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
                />
                {searching && <p className="text-xs text-[--text-secondary] mt-2">{t('favorites.searching')}</p>}
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                  {results.map(r => (
                    <button
                      key={r.id}
                      onClick={() => pick(r.id, r.type, pos)}
                      className="w-full flex items-center gap-2 text-left p-1.5 rounded-lg hover:bg-[--bg-card] transition-colors"
                    >
                      {r.poster && <img src={r.poster} alt={r.title} className="w-8 h-12 rounded object-cover shrink-0" />}
                      <span className="text-xs text-white line-clamp-2">{r.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
