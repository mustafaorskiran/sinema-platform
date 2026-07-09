'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { IconChevronDown } from '@/components/icons'

export interface DropItem {
  label?: string
  href?: string
  description?: string
  separator?: boolean
  heading?: string
}

interface Props {
  label: string
  href: string
  icon?: React.ReactNode
  items: DropItem[]
  columns?: 1 | 2
}

export function NavDropdown({ label, href, icon, items, columns = 1 }: Props) {
  const [open, setOpen] = useState(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function onEnter() {
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => setOpen(true), 120)
  }
  function onLeave() {
    if (openTimer.current) clearTimeout(openTimer.current)
    setOpen(false)
  }

  // Separate regular items and separators for grid layout
  const regularItems = items.filter(i => !i.separator)

  return (
    <div
      ref={ref}
      className="relative self-stretch flex items-center"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link
        href={href}
        className="flex items-center gap-1 transition-colors py-1 text-[--text-secondary] hover:text-[--text-primary]"
      >
        {icon}
        {label}
        <IconChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ opacity: 0.7 }}
        />
      </Link>

      <div
        className="absolute left-0 z-[200]"
        style={{
          top: '100%',
          paddingTop: '6px',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
          transition: 'opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.97)',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)',
              borderRadius: '14px',
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: 'calc(100vh - 80px)',
              minWidth: columns === 2 ? '380px' : '220px',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              scrollbarWidth: 'none',
            }}
          >
            {columns === 2 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {regularItems.map((item, i) => (
                  item.heading ? (
                    <div
                      key={`heading-${i}`}
                      className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-secondary)', opacity: 0.45, paddingTop: i === 0 ? '10px' : '16px', gridColumn: '1 / -1' }}
                    >
                      {item.heading}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className="flex flex-col px-4 py-2 transition-all duration-150 text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/[.06] active:bg-white/[.04]"
                    >
                      <span className="text-[13px] font-medium">{item.label}</span>
                      {item.description && (
                        <span className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>
                          {item.description}
                        </span>
                      )}
                    </Link>
                  )
                ))}
              </div>
            ) : (
              items.map((item, i) =>
                item.separator ? (
                  <div key={i} className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="flex flex-col px-4 py-3 transition-all duration-150 text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/[.06] active:bg-white/[.04]"
                  >
                    <span className="text-[13px] font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>
                        {item.description}
                      </span>
                    )}
                  </Link>
                )
              )
            )}
          </div>
      </div>
    </div>
  )
}
