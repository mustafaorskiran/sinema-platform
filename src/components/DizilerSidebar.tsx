'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconChevronDown } from '@/components/icons'
import { DIZI_GENRES } from '@/lib/dizi-genres'

const GOLD   = '#D4A843'
const GOLD_B = '#F0C060'
const RED    = '#E11D48'

const SORT_OPTIONS = [
  { value: 'popularity.desc',     label: 'Popülerlik Azalan'         },
  { value: 'popularity.asc',      label: 'Popülerlik Artan'          },
  { value: 'vote_average.desc',   label: 'En Yüksek Puan'            },
  { value: 'vote_average.asc',    label: 'En Düşük Puan'             },
  { value: 'first_air_date.desc', label: 'İlk Yayın (Yeni → Eski)'  },
  { value: 'first_air_date.asc',  label: 'İlk Yayın (Eski → Yeni)'  },
  { value: 'name.asc',            label: 'Başlık (A → Z)'            },
]

const LANGUAGE_OPTIONS = [
  { value: '',   label: 'Herhangi bir dil' },
  { value: 'tr', label: '🇹🇷 Türkçe' },
  { value: 'en', label: '🇺🇸 İngilizce' },
  { value: 'ko', label: '🇰🇷 Korece' },
  { value: 'ja', label: '🇯🇵 Japonca' },
  { value: 'fr', label: '🇫🇷 Fransızca' },
  { value: 'de', label: '🇩🇪 Almanca' },
  { value: 'es', label: '🇪🇸 İspanyolca' },
  { value: 'it', label: '🇮🇹 İtalyanca' },
  { value: 'zh', label: '🇨🇳 Çince' },
  { value: 'hi', label: '🇮🇳 Hintçe' },
  { value: 'pt', label: '🇧🇷 Portekizce' },
  { value: 'sv', label: '🇸🇪 İsveççe' },
  { value: 'da', label: '🇩🇰 Danimarkaca' },
]

export { DIZI_GENRES }

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
}

interface Props {
  providers: Provider[]
  initialGenre?: string
  initialPlatform?: string
  initialSirala?: string
  initialTarihten?: string
  initialTarihe?: string
  initialMinPuan?: string
  initialMinOy?: string
  initialDil?: string
  initialGoruntum?: string
}

function GoldDivider() {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.12) 30%, rgba(212,168,67,0.18) 50%, rgba(212,168,67,0.12) 70%, transparent 100%)`,
    }} />
  )
}

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-white/[0.015] transition-colors"
    >
      <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] transition-colors"
            style={{ color: open ? GOLD : 'rgba(212,168,67,0.45)' }}>
        {label}
      </span>
      <IconChevronDown
        className={`h-3 w-3 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
        style={{ color: open ? GOLD : 'rgba(212,168,67,0.3)' }}
      />
    </button>
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

function PremiumSlider({ min, max, step, value, onChange, pct }: {
  min: number; max: number; step: number
  value: number; onChange: (v: number) => void; pct: number
}) {
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="diz-range w-full cursor-pointer"
      style={{
        background: `linear-gradient(to right, ${GOLD} 0%, ${GOLD} ${pct}%, rgba(255,255,255,0.07) ${pct}%, rgba(255,255,255,0.07) 100%)`,
      }}
    />
  )
}

export default function DizilerSidebar({
  providers,
  initialGenre = '',
  initialPlatform = '',
  initialSirala = 'popularity.desc',
  initialTarihten = '',
  initialTarihe = '',
  initialMinPuan = '0',
  initialMinOy = '0',
  initialDil = '',
  initialGoruntum = 'grid',
}: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const [sirala,   setSirala]   = useState(initialSirala || 'popularity.desc')
  const [genres,   setGenres]   = useState<string[]>(
    initialGenre ? initialGenre.split(',').filter(Boolean) : []
  )
  const [platform, setPlatform] = useState(initialPlatform)
  const [dil,      setDil]      = useState(initialDil)
  const [tarihten, setTarihten] = useState(initialTarihten)
  const [tarihe,   setTarihe]   = useState(initialTarihe)
  const [minPuan,  setMinPuan]  = useState(Number(initialMinPuan) || 0)
  const [minOy,    setMinOy]    = useState(Number(initialMinOy) || 0)
  const [goruntum, setGoruntum] = useState(initialGoruntum || 'grid')

  const [providerOpen, setProviderOpen] = useState(true)
  const [dilOpen,      setDilOpen]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(true)

  function toggleGenre(id: string) {
    setGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function buildUrl() {
    const params = new URLSearchParams()
    if (genres.length > 0)  params.set('genre',    genres.join(','))
    if (platform)           params.set('platform', platform)
    if (sirala && sirala !== 'popularity.desc') params.set('sirala', sirala)
    if (dil)                params.set('dil',      dil)
    if (tarihten)           params.set('tarihten', tarihten)
    if (tarihe)             params.set('tarihe',   tarihe)
    if (minPuan > 0)        params.set('puan',     String(minPuan))
    if (minOy > 0)          params.set('min_oy',   String(minOy))
    if (goruntum !== 'grid') params.set('goruntum', goruntum)
    return `/diziler${params.toString() ? `?${params}` : ''}`
  }

  function ara() { router.push(buildUrl()) }

  function reset() {
    setGenres([]); setPlatform(''); setSirala('popularity.desc')
    setDil(''); setTarihten(''); setTarihe('')
    setMinPuan(0); setMinOy(0); setGoruntum('grid')
    router.push('/diziler')
  }

  const hasFilters = genres.length > 0 || platform || sirala !== 'popularity.desc' ||
    dil || tarihten || tarihe || minPuan > 0 || minOy > 0

  const selectCls = 'w-full rounded-xl px-3 py-2.5 text-[12.5px] text-white focus:outline-none transition-all appearance-none cursor-pointer pr-8'

  return (
    <>
      <style>{`
        .diz-range {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 9999px;
          outline: none;
        }
        .diz-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: ${GOLD_B};
          border: 2px solid #0e1522;
          box-shadow: 0 0 0 2px ${GOLD}, 0 2px 8px rgba(212,168,67,0.4);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .diz-range::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 0 0 3px ${GOLD}, 0 2px 12px rgba(212,168,67,0.55);
        }
        .diz-range::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: ${GOLD_B};
          border: 2px solid #0e1522;
          box-shadow: 0 0 0 2px ${GOLD};
          cursor: pointer;
        }
      `}</style>

      <aside className="w-[270px] shrink-0 sticky top-20 self-start pb-6 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #141c2f 0%, #0e1420 100%)',
            border: '1px solid rgba(212,168,67,0.10)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,168,67,0.04) inset',
          }}
        >
          {/* Gold top accent */}
          <div style={{
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${GOLD} 30%, ${GOLD_B} 50%, ${GOLD} 70%, transparent 100%)`,
            opacity: 0.65,
          }} />

          {/* ── Sırala ── */}
          <div className="px-5 pt-5 pb-4">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-3"
               style={{ color: 'rgba(212,168,67,0.5)' }}>
              Sırala
            </p>
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

            {/* Görünüm toggle */}
            <div className="mt-3 flex rounded-xl overflow-hidden"
                 style={{ border: '1px solid rgba(212,168,67,0.12)' }}>
              {[
                { key: 'grid',  label: 'Grid'  },
                { key: 'liste', label: 'Liste' },
              ].map(v => (
                <button
                  key={v.key}
                  onClick={() => setGoruntum(v.key)}
                  className="flex-1 py-2 text-[12px] font-semibold transition-all"
                  style={goruntum === v.key ? {
                    background: `rgba(212,168,67,0.12)`,
                    color: GOLD_B,
                  } : {
                    background: 'rgba(255,255,255,0.02)',
                    color: 'rgba(255,255,255,0.3)',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <button onClick={ara}
              className="mt-3 w-full py-2.5 rounded-xl font-semibold text-[13px] text-white tracking-wide transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`,
                boxShadow: `0 4px 18px rgba(225,29,72,0.32), 0 1px 0 rgba(255,255,255,0.08) inset`,
              }}>
              Ara
            </button>
          </div>

          <GoldDivider />

          {/* ── İzleme Servisleri ── */}
          {providers.length > 0 && (
            <>
              <SectionHeader label="İzleme Servisleri" open={providerOpen} onToggle={() => setProviderOpen(o => !o)} />
              {providerOpen && (
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm leading-none">🇹🇷</span>
                    <span className="text-[11px] font-medium" style={{ color: 'rgba(240,192,96,0.5)' }}>Türkiye</span>
                    {platform && (
                      <button onClick={() => setPlatform('')}
                        className="ml-auto text-[10px] transition-colors"
                        style={{ color: 'rgba(212,168,67,0.5)' }}>
                        Temizle
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {providers.map(p => {
                      const active = platform === String(p.provider_id)
                      return (
                        <button key={p.provider_id}
                          onClick={() => setPlatform(active ? '' : String(p.provider_id))}
                          title={p.provider_name}
                          className="w-9 h-9 rounded-lg overflow-hidden transition-all duration-200"
                          style={active ? {
                            outline: `2px solid ${GOLD}`,
                            outlineOffset: 2,
                            boxShadow: `0 0 10px rgba(212,168,67,0.3)`,
                            transform: 'scale(1.08)',
                            opacity: 1,
                          } : { opacity: 0.4 }}
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
                          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.opacity = '0.4' }}
                        >
                          <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                               alt={p.provider_name} className="w-full h-full object-cover" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <GoldDivider />
            </>
          )}

          {/* ── Dil ── */}
          <SectionHeader label="Dil" open={dilOpen} onToggle={() => setDilOpen(o => !o)} />
          {dilOpen && (
            <>
              <div className="px-5 pb-4">
                <div className="relative">
                  <select value={dil} onChange={e => setDil(e.target.value)}
                    className={selectCls}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,67,0.12)' }}>
                    {LANGUAGE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-[#141c2f] text-white">{o.label}</option>
                    ))}
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3"
                                   style={{ color: GOLD, opacity: 0.5 }} />
                </div>
              </div>
              <GoldDivider />
            </>
          )}

          {/* ── Filtreleme ── */}
          <SectionHeader label="Filtreleme" open={filterOpen} onToggle={() => setFilterOpen(o => !o)} />
          {filterOpen && (
            <div className="px-5 pb-5 space-y-5">

              {/* Tarih */}
              <div>
                <FilterLabel>İlk Yayın Tarihi</FilterLabel>
                <div className="flex gap-2">
                  {[
                    { label: 'Başlangıç', val: tarihten, set: setTarihten, ph: '1990' },
                    { label: 'Bitiş',     val: tarihe,   set: setTarihe,   ph: String(new Date().getFullYear()) },
                  ].map(f => (
                    <div key={f.label} className="flex-1">
                      <p className="text-[10px] mb-1.5" style={{ color: 'rgba(212,168,67,0.3)' }}>{f.label}</p>
                      <input type="text" inputMode="numeric" placeholder={f.ph} value={f.val}
                        onChange={e => f.set(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/15 focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,67,0.1)' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Türler */}
              <div>
                <FilterLabel>Türler</FilterLabel>
                <div className="flex flex-wrap gap-1.5">
                  {DIZI_GENRES.map(g => {
                    const active = genres.includes(String(g.id))
                    return (
                      <button key={g.id} onClick={() => toggleGenre(String(g.id))}
                        className="text-[11px] px-2.5 py-1 rounded-full transition-all duration-150"
                        style={active ? {
                          background: 'rgba(212,168,67,0.1)',
                          border: `1px solid rgba(212,168,67,0.45)`,
                          color: GOLD_B,
                          boxShadow: '0 0 10px rgba(212,168,67,0.12)',
                          fontWeight: 600,
                        } : {
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'rgba(255,255,255,0.35)',
                        }}>
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Kullanıcı Puanı */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FilterLabel>Kullanıcı Puanı</FilterLabel>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: GOLD_B }}>
                    {minPuan.toFixed(1)}
                  </span>
                </div>
                <PremiumSlider min={0} max={10} step={0.5} value={minPuan} onChange={setMinPuan} pct={(minPuan / 10) * 100} />
                <div className="flex justify-between text-[10px] mt-1.5" style={{ color: 'rgba(212,168,67,0.2)' }}>
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>

              {/* En Az Kullanıcı Oyu */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FilterLabel>En Az Kullanıcı Oyu</FilterLabel>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: GOLD_B }}>
                    {minOy.toLocaleString('tr-TR')}
                  </span>
                </div>
                <PremiumSlider min={0} max={500} step={50} value={minOy} onChange={setMinOy} pct={(minOy / 500) * 100} />
                <div className="flex justify-between text-[10px] mt-1.5" style={{ color: 'rgba(212,168,67,0.2)' }}>
                  <span>0</span><span>250</span><span>500+</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-1">
                <button onClick={ara}
                  className="w-full py-2.5 rounded-xl font-semibold text-[13px] text-white tracking-wide transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`,
                    boxShadow: `0 4px 18px rgba(225,29,72,0.30), 0 1px 0 rgba(255,255,255,0.08) inset`,
                  }}>
                  Ara
                </button>
                {hasFilters && (
                  <button onClick={reset}
                    className="w-full py-2 rounded-xl text-[11.5px] transition-all"
                    style={{ border: '1px solid rgba(212,168,67,0.1)', color: 'rgba(212,168,67,0.35)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,168,67,0.65)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.25)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,168,67,0.35)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.1)'
                    }}>
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ height: 1, background: `linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.08) 50%, transparent 100%)` }} />
        </div>
      </aside>
    </>
  )
}
