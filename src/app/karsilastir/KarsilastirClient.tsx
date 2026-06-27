'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IconSearch, IconClose, IconStar } from '@/components/icons'

interface MediaItem {
  id: number
  type: string
  title: string
  year: string
  poster: string | null
  rating: number
  voteCount: number
  runtime: number | null
  episodes: number | null
  seasons: number | null
  genres: string[]
  overview: string
  status: string
  countries: string[]
  companies: string[]
  tagline: string
  budget?: number | null
  revenue?: number | null
  language?: string | null
}

interface SearchResult { id: number; title?: string; name?: string; release_date?: string; first_air_date?: string; poster_path: string | null; media_type?: string }

function MediaSearch({ label, selected, onSelect }: {
  label: string
  selected: MediaItem | null
  onSelect: (id: number, type: string) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await r.json()
        setResults((data.results ?? []).filter((x: SearchResult) => x.media_type === 'movie' || x.media_type === 'tv').slice(0, 8))
        setOpen(true)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="flex-1">
      <p className="text-xs text-[--text-secondary] font-medium mb-2 uppercase tracking-wide">{label}</p>
      {selected ? (
        <div className="relative rounded-xl border border-[--accent]/40 bg-[--bg-card] p-3 flex gap-3 items-start">
          {selected.poster && (
            <img src={selected.poster} alt={selected.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">{selected.title}</p>
            <p className="text-xs text-[--text-secondary] mt-0.5">{selected.year} · {selected.type === 'dizi' ? 'Dizi' : 'Film'}</p>
            <div className="flex items-center gap-1 mt-1">
              <IconStar className="h-3 w-3 text-[--gold]" />
              <span className="text-xs text-[--gold] font-semibold">{selected.rating.toFixed(1)}</span>
            </div>
          </div>
          <button
            onClick={() => { setQuery(''); setResults([]) }}
            className="text-[--text-secondary] hover:text-white transition-colors shrink-0"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div ref={ref} className="relative">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Film veya dizi ara..."
              className="w-full rounded-xl border border-[--border] bg-[--bg-card] pl-9 pr-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-[--border] bg-[--bg-card] shadow-xl overflow-hidden">
              {results.map(r => {
                const title = r.title ?? r.name ?? ''
                const year = (r.release_date ?? r.first_air_date ?? '').slice(0, 4)
                const type = r.media_type === 'tv' ? 'dizi' : 'film'
                return (
                  <button
                    key={r.id}
                    onClick={() => { onSelect(r.id, type); setQuery(''); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-11 rounded shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {r.poster_path && (
                        <img src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} alt={title} className="w-full h-full object-cover" />
                      )}
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
      )}
    </div>
  )
}

function CompareRow({ label, a, b, highlight = false }: { label: string; a: React.ReactNode; b: React.ReactNode; highlight?: boolean }) {
  return (
    <tr style={highlight ? { background: 'rgba(255,255,255,0.04)' } : undefined}>
      <td className="py-3 px-4 text-xs text-[--text-secondary] font-medium w-1/4 text-center border-b border-[--border]">{label}</td>
      <td className="py-3 px-4 text-sm text-white text-center border-b border-[--border] border-x border-[--border]/50">{a ?? <span className="text-[--text-secondary]">—</span>}</td>
      <td className="py-3 px-4 text-sm text-white text-center border-b border-[--border]">{b ?? <span className="text-[--text-secondary]">—</span>}</td>
    </tr>
  )
}

export default function KarsilastirClient({ itemA, itemB }: { itemA: MediaItem | null; itemB: MediaItem | null }) {
  const router = useRouter()
  const [selA, setSelA] = useState<MediaItem | null>(itemA)
  const [selB, setSelB] = useState<MediaItem | null>(itemB)

  function handleSelect(side: 'a' | 'b', id: number, type: string) {
    const params = new URLSearchParams()
    if (side === 'a') { params.set('a', String(id)); params.set('ta', type) }
    else { params.set('a', String(selA?.id ?? '')); params.set('ta', selA?.type ?? 'film') }
    if (side === 'b') { params.set('b', String(id)); params.set('tb', type) }
    else { params.set('b', String(selB?.id ?? '')); params.set('tb', selB?.type ?? 'film') }
    router.push(`/karsilastir?${params.toString()}`)
  }

  useEffect(() => { setSelA(itemA) }, [itemA])
  useEffect(() => { setSelB(itemB) }, [itemB])

  const ratingWinner = selA && selB
    ? selA.rating > selB.rating ? 'a' : selB.rating > selA.rating ? 'b' : 'tie'
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Film / Dizi Karşılaştır</h1>
      <p className="text-sm text-[--text-secondary] mb-8">İki içeriği seçin ve yan yana karşılaştırın</p>

      {/* Search boxes */}
      <div className="flex gap-4 mb-8">
        <MediaSearch label="1. İçerik" selected={selA} onSelect={(id, type) => handleSelect('a', id, type)} />
        <div className="flex items-center justify-center shrink-0 mt-6">
          <span className="text-[--text-secondary] font-bold text-lg">VS</span>
        </div>
        <MediaSearch label="2. İçerik" selected={selB} onSelect={(id, type) => handleSelect('b', id, type)} />
      </div>

      {/* Posters */}
      {(selA || selB) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[selA, selB].map((item, i) => (
            <div key={i} className={`rounded-2xl border p-4 flex flex-col items-center text-center ${
              item ? 'border-[--border] bg-[--bg-card]' : 'border-dashed border-[--border] bg-[--bg-card]/40'
            }`}>
              {item ? (
                <>
                  {item.poster && (
                    <img src={item.poster} alt={item.title} className="w-32 h-48 object-cover rounded-xl mb-3 shadow-lg" />
                  )}
                  <a href={`/${item.type}/${item.id}`} className="text-white font-bold hover:text-[--accent] transition-colors leading-tight">{item.title}</a>
                  <p className="text-xs text-[--text-secondary] mt-1">{item.year}</p>
                  {item.tagline && <p className="text-xs text-[--text-secondary] italic mt-2 max-w-xs">"{item.tagline}"</p>}
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-[--text-secondary] text-sm">
                  Seçilmedi
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comparison table */}
      {selA && selB && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th className="py-3 px-4 text-xs text-[--text-secondary] font-medium w-1/4 text-center">Özellik</th>
                <th className="py-3 px-4 text-sm text-white font-semibold text-center border-x border-[--border]/50 w-[37.5%]">{selA.title}</th>
                <th className="py-3 px-4 text-sm text-white font-semibold text-center w-[37.5%]">{selB.title}</th>
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Puan"
                a={<span className={`font-bold text-base ${ratingWinner === 'a' ? 'text-green-400' : 'text-[--gold]'}`}>
                  ★ {selA.rating.toFixed(1)} <span className="text-xs font-normal text-[--text-secondary]">({selA.voteCount.toLocaleString()})</span>
                </span>}
                b={<span className={`font-bold text-base ${ratingWinner === 'b' ? 'text-green-400' : 'text-[--gold]'}`}>
                  ★ {selB.rating.toFixed(1)} <span className="text-xs font-normal text-[--text-secondary]">({selB.voteCount.toLocaleString()})</span>
                </span>}
                highlight
              />
              <CompareRow label="Yıl" a={selA.year} b={selB.year} />
              <CompareRow label="Tür" a={selA.type === 'dizi' ? 'Dizi' : 'Film'} b={selB.type === 'dizi' ? 'Dizi' : 'Film'} />
              <CompareRow label="Süre / Bölüm"
                a={selA.runtime ? `${selA.runtime} dk` : selA.episodes ? `${selA.seasons} sezon · ${selA.episodes} bölüm` : null}
                b={selB.runtime ? `${selB.runtime} dk` : selB.episodes ? `${selB.seasons} sezon · ${selB.episodes} bölüm` : null}
                highlight
              />
              <CompareRow label="Türler"
                a={selA.genres.slice(0, 3).join(', ')}
                b={selB.genres.slice(0, 3).join(', ')}
              />
              <CompareRow label="Durum" a={selA.status} b={selB.status} highlight />
              <CompareRow label="Ülke"
                a={selA.countries.slice(0, 2).join(', ')}
                b={selB.countries.slice(0, 2).join(', ')}
              />
              <CompareRow label="Yapım"
                a={selA.companies.slice(0, 2).join(', ')}
                b={selB.companies.slice(0, 2).join(', ')}
                highlight
              />
              <CompareRow label="Dil"
                a={selA.language?.toUpperCase()}
                b={selB.language?.toUpperCase()}
              />
              {(selA.budget || selB.budget) && (
                <CompareRow label="Bütçe"
                  a={selA.budget ? `$${(selA.budget / 1_000_000).toFixed(1)}M` : null}
                  b={selB.budget ? `$${(selB.budget / 1_000_000).toFixed(1)}M` : null}
                  highlight
                />
              )}
              {(selA.revenue || selB.revenue) && (
                <CompareRow label="Gişe"
                  a={selA.revenue ? `$${(selA.revenue / 1_000_000).toFixed(1)}M` : null}
                  b={selB.revenue ? `$${(selB.revenue / 1_000_000).toFixed(1)}M` : null}
                />
              )}
              <tr>
                <td className="py-3 px-4 text-xs text-[--text-secondary] font-medium text-center align-top">Özet</td>
                <td className="py-3 px-4 text-xs text-[--text-secondary] leading-relaxed text-center border-x border-[--border]/50">{selA.overview?.slice(0, 200)}{selA.overview?.length > 200 ? '…' : ''}</td>
                <td className="py-3 px-4 text-xs text-[--text-secondary] leading-relaxed text-center">{selB.overview?.slice(0, 200)}{selB.overview?.length > 200 ? '…' : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!selA && !selB && (
        <div className="text-center py-16 text-[--text-secondary]">
          <p className="text-5xl mb-4">⚖️</p>
          <p>Karşılaştırmak istediğiniz iki içeriği yukarıdan arayın</p>
        </div>
      )}
    </div>
  )
}
