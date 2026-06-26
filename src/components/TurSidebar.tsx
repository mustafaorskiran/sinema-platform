'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconChevronDown, IconSlidersHorizontal, IconClose, IconFilm, IconTv } from '@/components/icons'

const GOLD   = '#D4A843'
const GOLD_B = '#F0C060'
const RED    = '#E11D48'

const SORT_OPTIONS = [
  { value: 'popularity.desc',  label: 'En Popüler'       },
  { value: 'vote_average.desc', label: 'En Yüksek Puan' },
  { value: 'vote_average.asc',  label: 'En Düşük Puan'  },
  { value: 'release_date.desc', label: 'En Yeni'         },
  { value: 'release_date.asc',  label: 'En Eski'         },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_PRESETS = [
  { label: 'Tümü',  value: '' },
  { label: '2024',  value: '2024' },
  { label: '2023',  value: '2023' },
  { label: '2020s', value: '2020' },
  { label: '2010s', value: '2010' },
  { label: '2000s', value: '2000' },
  { label: '90lar',  value: '1990' },
  { label: '80ler',  value: '1980' },
]

interface Props {
  slug: string
  hasMovies: boolean
  hasSeries: boolean
  initialTab: 'film' | 'dizi'
  initialSirala?: string
  initialYil?: string
  initialMinPuan?: string
}

function GoldDivider() {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.14) 30%, rgba(212,168,67,0.2) 50%, rgba(212,168,67,0.14) 70%, transparent 100%)',
    }} />
  )
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] mb-2.5"
       style={{ color: 'rgba(212,168,67,0.55)' }}>
      {children}
    </p>
  )
}

export default function TurSidebar({
  slug, hasMovies, hasSeries,
  initialTab, initialSirala = 'popularity.desc', initialYil = '', initialMinPuan = '0',
}: Props) {
  const router = useRouter()
  const [tab,     setTab]     = useState<'film' | 'dizi'>(initialTab)
  const [sirala,  setSirala]  = useState(initialSirala)
  const [yil,     setYil]     = useState(initialYil)
  const [minPuan, setMinPuan] = useState(Number(initialMinPuan) || 0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function buildUrl(overrides?: Partial<{ tab: string; sirala: string; yil: string; minPuan: number }>) {
    const t  = overrides?.tab     ?? tab
    const s  = overrides?.sirala  ?? sirala
    const y  = overrides?.yil     ?? yil
    const mp = overrides?.minPuan ?? minPuan
    const p = new URLSearchParams()
    if (t !== (hasMovies ? 'film' : 'dizi')) p.set('tab', t)
    if (s !== 'popularity.desc') p.set('sirala', s)
    if (y) p.set('yil', y)
    if (mp > 0) p.set('min_puan', String(mp))
    return `/tur/${slug}${p.toString() ? `?${p}` : ''}`
  }

  function ara() { setDrawerOpen(false); router.push(buildUrl()) }

  function reset() {
    setSirala('popularity.desc'); setYil(''); setMinPuan(0)
    setDrawerOpen(false)
    router.push(`/tur/${slug}${tab !== (hasMovies ? 'film' : 'dizi') ? `?tab=${tab}` : ''}`)
  }

  const hasFilters = sirala !== 'popularity.desc' || !!yil || minPuan > 0
  const selectCls = 'w-full rounded-xl px-3 py-2.5 text-[12.5px] text-white focus:outline-none transition-all appearance-none cursor-pointer pr-8'

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(160deg, #141c2f 0%, #0e1420 100%)',
    border: '1px solid rgba(212,168,67,0.10)',
    boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,168,67,0.04) inset',
  }

  const content = (
    <div className="rounded-2xl overflow-hidden" style={cardStyle}>
      {/* Gold top accent */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${GOLD} 30%, ${GOLD_B} 50%, ${GOLD} 70%, transparent 100%)`,
        opacity: 0.65,
      }} />

      {/* ── Film / Dizi tab ── */}
      {hasMovies && hasSeries && (
        <>
          <div className="px-5 pt-5 pb-4">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-3"
               style={{ color: 'rgba(212,168,67,0.5)' }}>İçerik Türü</p>
            <div className="flex rounded-xl overflow-hidden"
                 style={{ border: '1px solid rgba(212,168,67,0.12)' }}>
              {[
                { key: 'film', label: 'Filmler', icon: <IconFilm className="h-3.5 w-3.5" /> },
                { key: 'dizi', label: 'Diziler', icon: <IconTv className="h-3.5 w-3.5" /> },
              ].map(v => (
                <button
                  key={v.key}
                  onClick={() => { setTab(v.key as 'film' | 'dizi'); router.push(buildUrl({ tab: v.key })) }}
                  className="flex-1 py-2 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={tab === v.key ? {
                    background: 'rgba(212,168,67,0.12)', color: GOLD_B,
                  } : {
                    background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.3)',
                  }}
                >
                  {v.icon}{v.label}
                </button>
              ))}
            </div>
          </div>
          <GoldDivider />
        </>
      )}

      {/* ── Sırala ── */}
      <div className="px-5 pt-4 pb-4">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-3"
           style={{ color: 'rgba(212,168,67,0.5)' }}>Sırala</p>
        <div className="relative">
          <select value={sirala} onChange={e => setSirala(e.target.value)}
            className={selectCls}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,67,0.12)' }}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value} className="bg-[#141c2f] text-white">{o.label}</option>
            ))}
          </select>
          <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3"
                           style={{ color: GOLD, opacity: 0.5 }} />
        </div>
        <button onClick={ara}
          className="mt-3 w-full py-2.5 rounded-xl font-semibold text-[13px] text-white tracking-wide transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`,
            boxShadow: `0 4px 18px rgba(225,29,72,0.32)`,
          }}>
          Ara
        </button>
      </div>

      <GoldDivider />

      {/* ── Yıl ── */}
      <div className="px-5 py-4">
        <FilterLabel>Yıl</FilterLabel>
        <div className="flex flex-wrap gap-1.5">
          {YEAR_PRESETS.map(y => (
            <button key={y.value}
              onClick={() => setYil(y.value)}
              className="text-[11px] px-2.5 py-1 rounded-full transition-all duration-150"
              style={yil === y.value ? {
                background: 'rgba(212,168,67,0.1)',
                border: `1px solid rgba(212,168,67,0.45)`,
                color: GOLD_B, fontWeight: 600,
              } : {
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.35)',
              }}>
              {y.label}
            </button>
          ))}
        </div>
      </div>

      <GoldDivider />

      {/* ── Min Puan ── */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <FilterLabel>Min Puan</FilterLabel>
          <span className="text-[13px] font-bold tabular-nums" style={{ color: GOLD_B }}>
            {minPuan > 0 ? minPuan.toFixed(1) : 'Hepsi'}
          </span>
        </div>
        <input type="range" min={0} max={9} step={0.5} value={minPuan}
          onChange={e => setMinPuan(Number(e.target.value))}
          className="tur-range w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${GOLD} 0%, ${GOLD} ${(minPuan / 9) * 100}%, rgba(255,255,255,0.07) ${(minPuan / 9) * 100}%, rgba(255,255,255,0.07) 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] mt-1.5" style={{ color: 'rgba(212,168,67,0.2)' }}>
          <span>0</span><span>5</span><span>9+</span>
        </div>
      </div>

      {/* ── Buttons ── */}
      <div className="px-5 pb-5 space-y-2">
        <button onClick={ara}
          className="w-full py-2.5 rounded-xl font-semibold text-[13px] text-white tracking-wide transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`, boxShadow: `0 4px 18px rgba(225,29,72,0.30)` }}>
          Ara
        </button>
        {hasFilters && (
          <button onClick={reset}
            className="w-full py-2 rounded-xl text-[11.5px] transition-all"
            style={{ border: '1px solid rgba(212,168,67,0.1)', color: 'rgba(212,168,67,0.35)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,168,67,0.65)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,168,67,0.35)' }}>
            Filtreleri Temizle
          </button>
        )}
      </div>

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.08) 50%, transparent 100%)' }} />
    </div>
  )

  return (
    <>
      <style>{`
        .tur-range { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 9999px; outline: none; }
        .tur-range::-webkit-slider-thumb {
          -webkit-appearance: none; width: 15px; height: 15px; border-radius: 50%;
          background: ${GOLD_B}; border: 2px solid #0e1522;
          box-shadow: 0 0 0 2px ${GOLD}, 0 2px 8px rgba(212,168,67,0.4);
          cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
        }
        .tur-range::-webkit-slider-thumb:hover { transform: scale(1.25); }
        .tur-range::-moz-range-thumb {
          width: 15px; height: 15px; border-radius: 50%;
          background: ${GOLD_B}; border: 2px solid #0e1522;
          box-shadow: 0 0 0 2px ${GOLD}; cursor: pointer;
        }
      `}</style>

      {/* Mobil backdrop */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40"
             style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
             onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobil floating button */}
      <button
        className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white active:scale-95 transition-transform"
        style={{
          background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`,
          boxShadow: '0 4px 24px rgba(225,29,72,0.45)',
          display: drawerOpen ? 'none' : undefined,
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <IconSlidersHorizontal className="h-4 w-4" />
        Filtrele
        {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#F0C060]" />}
      </button>

      {/* Sidebar */}
      <aside
        className={[
          'z-50 pb-6 overflow-y-auto scrollbar-thin',
          drawerOpen ? 'fixed top-0 right-0 h-full w-[290px] pt-3 px-3' : 'hidden',
          'lg:block lg:static lg:w-[260px] lg:shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)]',
        ].join(' ')}
        style={drawerOpen ? { background: '#0b0f19' } : undefined}
      >
        {drawerOpen && (
          <div className="lg:hidden flex justify-between items-center px-1 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: 'rgba(212,168,67,0.5)' }}>Filtrele</span>
            <button onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              <IconClose className="h-5 w-5" />
            </button>
          </div>
        )}
        {content}
      </aside>
    </>
  )
}
