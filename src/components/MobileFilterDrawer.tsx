'use client'

import { useState } from 'react'
import { IconClose } from '@/components/icons'

interface FilterItem {
  href: string
  label: string
  active: boolean
}

interface Props {
  genres: FilterItem[]
  countries: FilterItem[]
  years: FilterItem[]
  activeLabel?: string
}

function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4" />
    </svg>
  )
}

export default function MobileFilterDrawer({ genres, countries, years, activeLabel }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger button — only on smaller screens */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-[--accent]/40 transition-colors"
      >
        <IconFilter className="h-4 w-4" />
        Filtrele
        {activeLabel && (
          <span className="px-1.5 py-0.5 rounded-full bg-[--accent]/20 text-[--accent] text-[10px] font-bold">
            {activeLabel}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-[--bg-secondary] border-r border-[--border] z-50 overflow-y-auto transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-[--border]">
          <span className="text-base font-bold text-white">Filtrele</span>
          <button onClick={() => setOpen(false)} className="text-[--text-secondary] hover:text-white">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-5 space-y-6">
          {/* Türler */}
          <div>
            <h3 className="text-xs font-bold text-[--accent] uppercase tracking-widest mb-3 pb-1 border-b border-[--border]">Türler</h3>
            <ul className="space-y-0.5">
              {genres.map(g => (
                <li key={g.href}>
                  <a
                    href={g.href}
                    onClick={() => setOpen(false)}
                    className={`block text-sm py-1 px-2 rounded transition-colors ${g.active ? 'text-[--accent] font-semibold bg-[--accent]/10' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'}`}
                  >
                    {g.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ülkeler */}
          <div>
            <h3 className="text-xs font-bold text-[--accent] uppercase tracking-widest mb-3 pb-1 border-b border-[--border]">Ülkeler</h3>
            <ul className="space-y-0.5">
              {countries.map(c => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className={`block text-sm py-1 px-2 rounded transition-colors ${c.active ? 'text-[--accent] font-semibold bg-[--accent]/10' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'}`}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Yıllar */}
          <div>
            <h3 className="text-xs font-bold text-[--accent] uppercase tracking-widest mb-3 pb-1 border-b border-[--border]">Yıllar</h3>
            <ul className="space-y-0.5 max-h-64 overflow-y-auto">
              {years.map(y => (
                <li key={y.href}>
                  <a
                    href={y.href}
                    onClick={() => setOpen(false)}
                    className={`block text-sm py-1 px-2 rounded transition-colors ${y.active ? 'text-[--accent] font-semibold bg-[--accent]/10' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'}`}
                  >
                    {y.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
