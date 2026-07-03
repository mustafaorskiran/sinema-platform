'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IconGlobe, IconStarFilled } from '@/components/icons'

interface MediaItem {
  id: number
  title: string
  year: string
  poster: string | null
  rating: number
  rank: number
}

interface Props {
  activeTab: 'tumü' | 'turkiye' | 'uluslararasi'
  activeSiralama: string
  items: MediaItem[]
  currentPage: number
  totalPages: number
  sortLabels: Record<string, string>
}

const TABS = [
  { key: 'tumü', label: 'Tümü', icon: IconGlobe },
  { key: 'turkiye', label: '🇹🇷 Türkiye', icon: null },
  { key: 'uluslararasi', label: 'Uluslararası', icon: IconGlobe },
] as const

const SORT_OPTIONS = ['popularity.desc', 'vote_average.desc', 'release_date.desc', 'release_date.asc']

export default function TvFilmleriClient({ activeTab, activeSiralama, items, currentPage, totalPages, sortLabels }: Props) {
  const router = useRouter()

  function navigate(tab: string, siralama: string, sayfa: number) {
    const params = new URLSearchParams({ tab, siralama, sayfa: String(sayfa) })
    router.push(`/tv-filmleri?${params}`)
  }

  return (
    <div>
      {/* Tab + sıralama satırı */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => navigate(t.key, activeSiralama, 1)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 inline-flex items-center gap-1.5"
              style={activeTab === t.key
                ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
              }
            >
              {t.icon && <t.icon size={14} />} {t.label}
            </button>
          ))}
        </div>

        <select
          value={activeSiralama}
          onChange={e => navigate(activeTab, e.target.value, 1)}
          className="text-sm rounded-xl text-[--text-secondary] rounded-lg px-3 py-2 focus:outline-none focus:border-[--accent]" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{sortLabels[opt]}</option>
          ))}
        </select>
      </div>

      {/* Sayfa bilgisi */}
      <p className="text-xs text-[--text-secondary] mb-4">
        Sayfa {currentPage} / {totalPages} · {items.length} film
      </p>

      {/* Izgara */}
      {items.length === 0 ? (
        <p className="text-[--text-secondary] text-sm py-16 text-center">İçerik bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {items.map(item => (
            <Link key={item.id} href={`/film/${item.id}`} className="group relative">
              <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                {item.poster
                  ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center leading-tight">{item.title}</div>
                }
                <div className="absolute top-2 left-2 bg-black/80 rounded-md px-1.5 py-0.5">
                  <span className="text-[10px] font-bold text-white">#{item.rank}</span>
                </div>
                {item.rating > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5">
                    <span className="text-[10px] font-bold text-[--gold] inline-flex items-center gap-0.5"><IconStarFilled size={10} /> {item.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-purple-600/80 rounded-md px-1.5 py-0.5">
                  <span className="text-[9px] font-bold text-white uppercase">TV</span>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-white font-medium line-clamp-1 group-hover:text-[--accent] transition-colors">{item.title}</p>
              <p className="text-[10px] text-[--text-secondary]">{item.year}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {currentPage > 1 && (
            <button
              onClick={() => navigate(activeTab, activeSiralama, currentPage - 1)}
              className="px-4 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              ← Önceki
            </button>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = currentPage <= 3 ? i + 1 : currentPage - 2 + i
            if (p > totalPages) return null
            return (
              <button
                key={p}
                onClick={() => navigate(activeTab, activeSiralama, p)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  p === currentPage
                    ? 'bg-[--accent] border-[--accent] text-white'
                    : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white'
                }`}
              >
                {p}
              </button>
            )
          })}
          {currentPage < totalPages && (
            <button
              onClick={() => navigate(activeTab, activeSiralama, currentPage + 1)}
              className="px-4 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Sonraki →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
