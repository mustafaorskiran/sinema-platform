'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface MediaItem {
  id: number
  title: string
  year: string
  poster: string | null
  rating: number
  rank: number
  mediaType: string
}

interface Props {
  slug: string
  activeTab: 'filmler' | 'diziler'
  items: MediaItem[]
  currentPage: number
  totalPages: number
}

export default function UlkeClient({ slug, activeTab, items, currentPage, totalPages }: Props) {
  const router = useRouter()

  function switchTab(tab: 'filmler' | 'diziler') {
    router.push(`/ulke/${slug}?tab=${tab}&sayfa=1`)
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {(['filmler', 'diziler'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[--accent] text-white'
                : 'bg-[--bg-card] border border-[--border] text-[--text-secondary] hover:text-white'
            }`}
          >
            {tab === 'filmler' ? '🎬 Filmler' : '📺 Diziler'}
          </button>
        ))}
      </div>

      {/* Sayfa bilgisi */}
      <p className="text-xs text-[--text-secondary] mb-4">
        Sayfa {currentPage} / {totalPages} · {items.length} içerik
      </p>

      {/* İçerik ızgarası */}
      {items.length === 0 ? (
        <p className="text-[--text-secondary] text-sm py-10 text-center">İçerik bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {items.map(item => (
            <Link
              key={item.id}
              href={`/${item.mediaType}/${item.id}`}
              className="group relative"
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/50 transition-colors relative">
                {item.poster
                  ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center leading-tight">{item.title}</div>
                }
                {/* Sıra numarası */}
                <div className="absolute top-2 left-2 bg-black/80 rounded-md px-1.5 py-0.5">
                  <span className="text-[10px] font-bold text-white">#{item.rank}</span>
                </div>
                {/* Puan */}
                {item.rating > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5">
                    <span className="text-[10px] font-bold text-[--gold]">★ {item.rating.toFixed(1)}</span>
                  </div>
                )}
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
            <Link
              href={`/ulke/${slug}?tab=${activeTab}&sayfa=${currentPage - 1}`}
              className="px-4 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors"
            >
              ← Önceki
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = currentPage <= 3 ? i + 1 : currentPage - 2 + i
            if (p > totalPages) return null
            return (
              <Link
                key={p}
                href={`/ulke/${slug}?tab=${activeTab}&sayfa=${p}`}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  p === currentPage
                    ? 'bg-[--accent] border-[--accent] text-white'
                    : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white'
                }`}
              >
                {p}
              </Link>
            )
          })}
          {currentPage < totalPages && (
            <Link
              href={`/ulke/${slug}?tab=${activeTab}&sayfa=${currentPage + 1}`}
              className="px-4 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
