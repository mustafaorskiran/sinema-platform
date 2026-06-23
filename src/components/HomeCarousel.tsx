'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { IconChevronLeft, IconChevronRight } from '@/components/icons'
import { getPosterUrl } from '@/lib/tmdb-utils'
import type { TMDbMovie } from '@/lib/types'

interface Props {
  title: string
  icon?: React.ReactNode
  href: string
  items: TMDbMovie[]
  defaultType?: 'film' | 'dizi'
}

export default function HomeCarousel({ title, icon, href, items, defaultType = 'film' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  if (!items.length) return null

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({
      left: dir === 'left' ? -(ref.current.clientWidth * 0.75) : ref.current.clientWidth * 0.75,
      behavior: 'smooth',
    })
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-white"
          style={{ color: 'var(--accent)' }}
        >
          Tümünü Gör
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Carousel wrapper */}
      <div className="relative group/carousel">
        {/* Left button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Sola kaydır"
          className="absolute left-0 top-[40%] z-10 -translate-x-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(11,15,25,0.95)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.65)',
          }}
        >
          <IconChevronLeft className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Scroll container */}
        <div ref={ref} className="home-carousel-scroll flex gap-3 overflow-x-auto pb-3">
          {items.slice(0, 20).map((item) => {
            const itemType: 'film' | 'dizi' =
              item.media_type === 'tv' ? 'dizi'
              : item.media_type === 'movie' ? 'film'
              : defaultType

            const poster    = getPosterUrl(item.poster_path, 'w342')
            const itemTitle = item.title || item.name || ''
            const year      = (item.release_date || item.first_air_date || '').slice(0, 4)

            return (
              <Link
                key={`${item.id}-${itemType}`}
                href={`/${itemType}/${item.id}`}
                className="group/card shrink-0 w-[148px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Poster */}
                <div
                  className="relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-200 group-hover/card:-translate-y-1.5 movie-card-grid"
                  style={{ background: 'var(--bg-card)' }}
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={itemTitle}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-xs text-center p-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {itemTitle}
                    </div>
                  )}

                  {/* Puan rozeti */}
                  {item.vote_average > 0 && (
                    <div
                      className="absolute top-1.5 right-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: 'rgba(11,15,25,0.92)',
                        color: 'var(--gold-bright)',
                        border: '1px solid rgba(212,168,67,0.3)',
                      }}
                    >
                      ★ {item.vote_average.toFixed(1)}
                    </div>
                  )}

                  {/* Hover gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Başlık & Yıl */}
                <p
                  className="mt-2 text-[12.5px] font-medium leading-tight line-clamp-2 transition-colors duration-150 group-hover/card:text-white"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {itemTitle}
                </p>
                {year && (
                  <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                    {year}
                  </p>
                )}
              </Link>
            )
          })}
        </div>

        {/* Right button */}
        <button
          onClick={() => scroll('right')}
          aria-label="Sağa kaydır"
          className="absolute right-0 top-[40%] z-10 translate-x-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(11,15,25,0.95)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.65)',
          }}
        >
          <IconChevronRight className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>
    </section>
  )
}
