'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconChevronDown } from '@/components/icons'

export interface FilterItem {
  href: string
  label: string
  active: boolean
  count?: string
}

interface Props {
  genres: FilterItem[]
  countries: FilterItem[]
  years: FilterItem[]
  specialCategories?: FilterItem[]
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${open ? 'var(--border-strong)' : 'var(--border)'}`,
        background: 'var(--bg-card)',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-4 min-h-[52px] shrink-0 transition-colors hover:bg-white/[.04]"
      >
        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <IconChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: open ? 'var(--accent)' : 'var(--text-secondary)', opacity: open ? 0.9 : 0.45 }}
        />
      </button>

      {open && (
        <>
          <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />
          <div className="px-4 pb-4 pt-3.5">
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export default function FilterPanel({ genres, countries, years, specialCategories }: Props) {
  const activeGenre   = genres.find(g => g.active)
  const activeCountry = countries.find(c => c.active)
  const activeYear    = years.find(y => y.active)
  const activeSpecial = specialCategories?.find(s => s.active)

  const activeItems = [activeGenre, activeCountry, activeYear, activeSpecial].filter(Boolean)

  return (
    <aside
      className="filter-sidebar"
      style={{
        width: '280px',
        flexShrink: 0,
        flexDirection: 'column',
        gap: '8px',
        position: 'sticky',
        top: '5rem',
        alignSelf: 'flex-start',
        paddingBottom: '1.5rem',
      }}
    >
      {/* Aktif filtreler */}
      {activeItems.length > 0 && (
        <div
          className="rounded-xl px-4 py-3.5"
          style={{
            background: 'rgba(225,29,72,0.07)',
            border: '1px solid rgba(225,29,72,0.25)',
            boxShadow: '0 0 24px rgba(225,29,72,0.06) inset',
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Aktif Filtreler
            </p>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--accent)', opacity: 0.65 }}>
              {activeItems.length} seçili
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeItems.map(item => (
              <Link
                key={item!.href}
                href={item!.href}
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-opacity hover:opacity-70"
                style={{
                  background: 'rgba(225,29,72,0.18)',
                  border: '1px solid rgba(225,29,72,0.4)',
                  color: 'var(--accent)',
                }}
              >
                {item!.label}
                <span style={{ opacity: 0.7, fontSize: '10px' }}>✕</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Türler */}
      <Section title="Türler" defaultOpen>
        <div className="filter-section-scroll">
          <div className="flex flex-wrap gap-1.5">
            {genres.map(g => (
              <Link
                key={g.label}
                href={g.href}
                className={`filter-chip ${g.active ? 'filter-chip-active' : ''}`}
              >
                {g.active && <span style={{ fontSize: '9px' }}>✓</span>}
                {g.label}
                {g.count && (
                  <span className="filter-chip-count">({g.count})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Ülkeler */}
      <Section title="Ülkeler" defaultOpen>
        <div className="filter-section-scroll">
          <div className="flex flex-wrap gap-1.5">
            {countries.map(c => (
              <Link
                key={c.label}
                href={c.href}
                className={`filter-chip ${c.active ? 'filter-chip-active' : ''}`}
              >
                {c.active && <span style={{ fontSize: '9px' }}>✓</span>}
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Yıllar */}
      <Section title="Yıllar" defaultOpen>
        <div className="filter-section-scroll filter-section-scroll-years">
          <div className="grid grid-cols-3 gap-1.5">
            {years.map(y => (
              <Link
                key={y.label}
                href={y.href}
                className={`filter-chip-year ${y.active ? 'filter-chip-year-active' : ''}`}
              >
                {y.label}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Özel Kategoriler */}
      {specialCategories && specialCategories.length > 0 && (
        <Section title="Özel Kategoriler" defaultOpen={false}>
          <div className="filter-section-scroll filter-section-scroll-topics">
            <div className="flex flex-wrap gap-1.5">
              {specialCategories.map(s => (
                <Link
                  key={s.label}
                  href={s.href}
                  className={`filter-chip ${s.active ? 'filter-chip-active' : ''}`}
                >
                  {s.active && <span style={{ fontSize: '9px' }}>✓</span>}
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}
    </aside>
  )
}
