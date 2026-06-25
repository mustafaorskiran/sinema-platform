'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)

  const [thumbLeft, setThumbLeft] = useState(0)
  const [thumbWidth, setThumbWidth] = useState(100)
  const [hasOverflow, setHasOverflow] = useState(false)

  if (!director && cast.length === 0) return null

  const people: (Person & { role: string; isDirector?: boolean })[] = []
  if (director) people.push({ ...director, role: 'Yönetmen', isDirector: true })
  for (const c of cast.slice(0, 20)) people.push({ ...c, role: c.character ?? '' })

  const updateThumb = useCallback(() => {
    const el = scrollRef.current
    const track = trackRef.current
    if (!el || !track) return
    const ratio = el.clientWidth / el.scrollWidth
    const newThumbWidth = track.clientWidth * ratio
    const maxScroll = el.scrollWidth - el.clientWidth
    const newLeft = maxScroll > 0
      ? (el.scrollLeft / maxScroll) * (track.clientWidth - newThumbWidth)
      : 0
    setThumbWidth(newThumbWidth)
    setThumbLeft(newLeft)
    setHasOverflow(el.scrollWidth > el.clientWidth + 2)
  }, [])

  useEffect(() => {
    updateThumb()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateThumb, { passive: true })
    const ro = new ResizeObserver(updateThumb)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateThumb)
      ro.disconnect()
    }
  }, [updateThumb])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartScroll.current = scrollRef.current?.scrollLeft ?? 0

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current || !scrollRef.current || !trackRef.current) return
      const dx = ev.clientX - dragStartX.current
      const track = trackRef.current.clientWidth
      const ratio = dx / (track - thumbWidth)
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      scrollRef.current.scrollLeft = dragStartScroll.current + ratio * maxScroll
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current
    const el = scrollRef.current
    if (!track || !el) return
    const rect = track.getBoundingClientRect()
    const clickX = e.clientX - rect.left - thumbWidth / 2
    const ratio = clickX / (track.clientWidth - thumbWidth)
    const maxScroll = el.scrollWidth - el.clientWidth
    el.scrollLeft = Math.max(0, Math.min(ratio * maxScroll, maxScroll))
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
          className="absolute left-0 top-[38%] z-10 -translate-x-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover/cast:opacity-100 transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(11,15,25,0.95)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.65)',
          }}
        >
          <IconChevronLeft className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Sağ gradient fade */}
        {hasOverflow && (
          <div
            className="absolute right-0 top-0 bottom-6 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent, var(--bg-main, #0b0f19))' }}
          />
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="home-carousel-scroll flex gap-4 overflow-x-auto pb-3"
        >
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
          className="absolute right-0 top-[38%] z-10 translate-x-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover/cast:opacity-100 transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(11,15,25,0.95)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.65)',
          }}
        >
          <IconChevronRight className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>

      {/* Scroll bar */}
      {hasOverflow && (
        <div
          ref={trackRef}
          onClick={onTrackClick}
          className="mt-3 h-1 rounded-full cursor-pointer"
          style={{ background: 'var(--border)' }}
        >
          <div
            onMouseDown={onThumbMouseDown}
            className="h-full rounded-full cursor-grab active:cursor-grabbing transition-colors"
            style={{
              width: thumbWidth,
              transform: `translateX(${thumbLeft}px)`,
              background: 'var(--accent)',
              opacity: 0.7,
            }}
          />
        </div>
      )}
    </div>
  )
}
