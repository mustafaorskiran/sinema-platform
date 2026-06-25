'use client'

import { useRef } from 'react'
import { IconChevronLeft, IconChevronRight } from '@/components/icons'

interface Person {
  id: number
  name: string
  profile_path: string | null
  character?: string
  job?: string
}

interface Props {
  cast: Person[]
  director?: Person | null
}

export default function CastRow({ cast, director }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  if (!director && cast.length === 0) return null

  const people: (Person & { role: string; isDirector?: boolean })[] = []

  if (director) {
    people.push({ ...director, role: 'Yönetmen', isDirector: true })
  }
  for (const c of cast.slice(0, 20)) {
    people.push({ ...c, role: c.character ?? '' })
  }

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({
      left: dir === 'left' ? -(ref.current.clientWidth * 0.75) : ref.current.clientWidth * 0.75,
      behavior: 'smooth',
    })
  }

  return (
    <div className="mt-8">
      <h2
        className="text-xl font-bold text-white mb-5"
        style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}
      >
        Oyuncular & Ekip
      </h2>

      <div className="relative group/cast">
        {/* Sol ok */}
        <button
          onClick={() => scroll('left')}
          aria-label="Sola kaydır"
          className="absolute left-0 top-[40%] z-10 -translate-x-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover/cast:opacity-100 transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(11,15,25,0.95)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.65)',
          }}
        >
          <IconChevronLeft className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Scroll container */}
        <div ref={ref} className="home-carousel-scroll flex gap-4 overflow-x-auto pb-3">
          {people.map((p) => (
            <a
              key={`${p.id}-${p.role}`}
              href={p.isDirector ? `/yonetmen/${p.id}` : `/oyuncu/${p.id}`}
              className="group shrink-0 w-32"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div
                className="relative w-32 h-44 rounded-xl overflow-hidden transition-all duration-200 group-hover:-translate-y-1"
                style={{
                  background: 'var(--bg-card)',
                  border: p.isDirector
                    ? '1px solid rgba(225,29,72,0.45)'
                    : '1px solid var(--border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                {p.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${p.profile_path}`}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <span className="text-4xl font-bold opacity-25" style={{ color: 'var(--text-secondary)' }}>
                      {p.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <p
                className="mt-2 text-[12.5px] font-semibold leading-tight line-clamp-1 transition-colors group-hover:text-[--accent]"
                style={{ color: 'var(--text-primary)' }}
              >
                {p.name}
              </p>
              <p
                className="mt-0.5 text-[11px] line-clamp-1"
                style={{ color: 'var(--text-secondary)', opacity: 0.7 }}
              >
                {p.isDirector ? '🎬 Yönetmen' : p.role}
              </p>
            </a>
          ))}
        </div>

        {/* Sağ ok */}
        <button
          onClick={() => scroll('right')}
          aria-label="Sağa kaydır"
          className="absolute right-0 top-[40%] z-10 translate-x-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover/cast:opacity-100 transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(11,15,25,0.95)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.65)',
          }}
        >
          <IconChevronRight className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>
    </div>
  )
}
