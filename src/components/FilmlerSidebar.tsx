'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconChevronDown } from '@/components/icons'
import { FILM_GENRES } from '@/lib/film-genres'

export { FILM_GENRES }

const SORT_OPTIONS = [
  { value: 'popularity.desc',           label: 'Popülerlik Azalan'          },
  { value: 'popularity.asc',            label: 'Popülerlik Artan'           },
  { value: 'vote_average.desc',         label: 'En Yüksek Puan'             },
  { value: 'vote_average.asc',          label: 'En Düşük Puan'              },
  { value: 'primary_release_date.desc', label: 'Çıkış Tarihi (Yeni → Eski)' },
  { value: 'primary_release_date.asc',  label: 'Çıkış Tarihi (Eski → Yeni)' },
  { value: 'title.asc',                 label: 'Başlık (A → Z)'             },
  { value: 'revenue.desc',              label: 'Gişe Hasılatı'              },
]

const LANGUAGE_OPTIONS = [
  { value: '',   label: 'Herhangi bir dil' },
  { value: 'tr', label: '🇹🇷 Türkçe' },
  { value: 'en', label: '🇺🇸 İngilizce' },
  { value: 'fr', label: '🇫🇷 Fransızca' },
  { value: 'de', label: '🇩🇪 Almanca' },
  { value: 'ja', label: '🇯🇵 Japonca' },
  { value: 'ko', label: '🇰🇷 Korece' },
  { value: 'es', label: '🇪🇸 İspanyolca' },
  { value: 'it', label: '🇮🇹 İtalyanca' },
  { value: 'zh', label: '🇨🇳 Çince' },
  { value: 'hi', label: '🇮🇳 Hintçe' },
  { value: 'pt', label: '🇧🇷 Portekizce' },
  { value: 'ru', label: '🇷🇺 Rusça' },
  { value: 'ar', label: '🇸🇦 Arapça' },
]

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
  initialMinSure?: string
  initialMaxSure?: string
  initialKeyword?: string
}

function Divider() {
  return <div className="h-px bg-white/[0.05]" />
}

function SectionHeader({
  label, open, onToggle,
}: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 group-hover:text-white/50 transition-colors">
        {label}
      </span>
      <IconChevronDown
        className={`h-3 w-3 text-white/25 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-white/60 mb-2.5 tracking-wide">{children}</p>
  )
}

function SliderTrack({
  min, max, step, value, onChange, pct,
}: {
  min: number; max: number; step: number
  value: number; onChange: (v: number) => void; pct: number
}) {
  return (
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="sidebar-range w-full cursor-pointer"
      style={{
        background: `linear-gradient(to right, #E11D48 0%, #E11D48 ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
      }}
    />
  )
}

export default function FilmlerSidebar({
  providers,
  initialGenre = '',
  initialPlatform = '',
  initialSirala = 'popularity.desc',
  initialTarihten = '',
  initialTarihe = '',
  initialMinPuan = '0',
  initialMinOy = '0',
  initialDil = '',
  initialMinSure = '0',
  initialMaxSure = '400',
  initialKeyword = '',
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
  const [minSure,  setMinSure]  = useState(Number(initialMinSure) || 0)
  const [maxSure,  setMaxSure]  = useState(Number(initialMaxSure) || 400)
  const [keyword,  setKeyword]  = useState(initialKeyword)

  const [providerOpen, setProviderOpen] = useState(true)
  const [dilOpen,      setDilOpen]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(true)

  function toggleGenre(id: string) {
    setGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  function buildUrl() {
    const params = new URLSearchParams()
    const kategori = sp.get('kategori')
    if (kategori && kategori !== 'populer') params.set('kategori', kategori)
    if (genres.length > 0)  params.set('genre',    genres.join(','))
    if (platform)           params.set('platform', platform)
    if (sirala && sirala !== 'popularity.desc') params.set('sirala', sirala)
    if (dil)                params.set('dil',      dil)
    if (tarihten)           params.set('tarihten', tarihten)
    if (tarihe)             params.set('tarihe',   tarihe)
    if (minPuan > 0)        params.set('min_puan', String(minPuan))
    if (minOy > 0)          params.set('min_oy',   String(minOy))
    if (minSure > 0)        params.set('min_sure', String(minSure))
    if (maxSure < 400)      params.set('max_sure', String(maxSure))
    if (keyword.trim())     params.set('keyword',  keyword.trim())
    return `/filmler${params.toString() ? `?${params}` : ''}`
  }

  function ara() { router.push(buildUrl()) }

  function reset() {
    setGenres([]); setPlatform(''); setSirala('popularity.desc')
    setDil(''); setTarihten(''); setTarihe('')
    setMinPuan(0); setMinOy(0); setMinSure(0); setMaxSure(400); setKeyword('')
    const params = new URLSearchParams()
    const kategori = sp.get('kategori')
    if (kategori && kategori !== 'populer') params.set('kategori', kategori)
    router.push(`/filmler${params.toString() ? `?${params}` : ''}`)
  }

  const hasFilters = genres.length > 0 || platform || sirala !== 'popularity.desc' ||
    dil || tarihten || tarihe || minPuan > 0 || minOy > 0 ||
    minSure > 0 || maxSure < 400 || keyword.trim()

  const selectCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[--accent]/50 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer'
  const inputCls  = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/25 focus:outline-none focus:border-[--accent]/50 focus:bg-white/[0.06] transition-all'

  return (
    <>
      {/* Custom range slider styles */}
      <style>{`
        .sidebar-range {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 9999px;
          outline: none;
        }
        .sidebar-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #E11D48;
          box-shadow: 0 0 0 3px rgba(225,29,72,0.18), 0 1px 4px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sidebar-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(225,29,72,0.25), 0 1px 6px rgba(0,0,0,0.5);
        }
        .sidebar-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #E11D48;
          box-shadow: 0 0 0 3px rgba(225,29,72,0.18);
          cursor: pointer;
        }
      `}</style>

      <aside className="w-[270px] shrink-0 sticky top-20 self-start pb-6 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
        <div className="rounded-2xl border border-white/[0.07] bg-[--bg-card] shadow-2xl shadow-black/40 overflow-hidden">

          {/* ── Sırala ── */}
          <div className="px-5 pt-5 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/30 mb-3">Sırala</p>
            <div className="relative">
              <select
                value={sirala}
                onChange={e => setSirala(e.target.value)}
                className={selectCls}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#1a2035] text-white">
                    {o.label}
                  </option>
                ))}
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            </div>
            <button
              onClick={ara}
              className="mt-3 w-full py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #E11D48 0%, #be123c 100%)',
                boxShadow: '0 4px 14px rgba(225,29,72,0.30)',
              }}
            >
              Ara
            </button>
          </div>

          <Divider />

          {/* ── İzleme Servisleri ── */}
          {providers.length > 0 && (
            <>
              <SectionHeader label="İzleme Servisleri" open={providerOpen} onToggle={() => setProviderOpen(o => !o)} />
              {providerOpen && (
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm leading-none">🇹🇷</span>
                    <span className="text-[11px] text-white/50 font-medium">Türkiye</span>
                    {platform && (
                      <button
                        onClick={() => setPlatform('')}
                        className="ml-auto text-[10px] text-[--accent]/70 hover:text-[--accent] transition-colors"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {providers.map(p => {
                      const active = platform === String(p.provider_id)
                      return (
                        <button
                          key={p.provider_id}
                          onClick={() => setPlatform(active ? '' : String(p.provider_id))}
                          title={p.provider_name}
                          className={`w-9 h-9 rounded-lg overflow-hidden transition-all duration-200 ${
                            active
                              ? 'ring-2 ring-[--accent] ring-offset-2 ring-offset-[--bg-card] opacity-100 scale-105'
                              : 'opacity-45 hover:opacity-90 hover:scale-105'
                          }`}
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <Divider />
            </>
          )}

          {/* ── Dil ── */}
          <SectionHeader label="Dil" open={dilOpen} onToggle={() => setDilOpen(o => !o)} />
          {dilOpen && (
            <>
              <div className="px-5 pb-4">
                <div className="relative">
                  <select
                    value={dil}
                    onChange={e => setDil(e.target.value)}
                    className={selectCls}
                  >
                    {LANGUAGE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-[#1a2035] text-white">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* ── Filtreleme ── */}
          <SectionHeader label="Filtreleme" open={filterOpen} onToggle={() => setFilterOpen(o => !o)} />
          {filterOpen && (
            <div className="px-5 pb-5 space-y-5">

              {/* Tarih */}
              <div>
                <FilterLabel>İlk Gösterim Tarihi</FilterLabel>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-white/25 mb-1.5">Başlangıç</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="2000"
                      value={tarihten}
                      onChange={e => setTarihten(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-white/25 mb-1.5">Bitiş</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={String(new Date().getFullYear())}
                      value={tarihe}
                      onChange={e => setTarihe(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Türler */}
              <div>
                <FilterLabel>Türler</FilterLabel>
                <div className="flex flex-wrap gap-1.5">
                  {FILM_GENRES.map(g => {
                    const active = genres.includes(String(g.id))
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGenre(String(g.id))}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-150 ${
                          active
                            ? 'bg-[--gold]/10 border-[--gold]/60 text-[--gold] font-semibold shadow-sm shadow-[--gold]/10'
                            : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70 hover:bg-white/[0.04]'
                        }`}
                      >
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
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: '#D4A843' }}>
                    {minPuan.toFixed(1)}
                  </span>
                </div>
                <SliderTrack
                  min={0} max={10} step={0.5}
                  value={minPuan}
                  onChange={setMinPuan}
                  pct={(minPuan / 10) * 100}
                />
                <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>

              {/* En Az Kullanıcı Oyu */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FilterLabel>En Az Kullanıcı Oyu</FilterLabel>
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: '#D4A843' }}>
                    {minOy.toLocaleString('tr-TR')}
                  </span>
                </div>
                <SliderTrack
                  min={0} max={500} step={50}
                  value={minOy}
                  onChange={setMinOy}
                  pct={(minOy / 500) * 100}
                />
                <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
                  <span>0</span><span>250</span><span>500+</span>
                </div>
              </div>

              {/* Süre */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FilterLabel>Süre</FilterLabel>
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: '#D4A843' }}>
                    {minSure > 0 ? `${minSure}–` : ''}{maxSure >= 400 ? '400+ dk' : `${maxSure} dk`}
                  </span>
                </div>
                <div className="space-y-2">
                  <SliderTrack
                    min={0} max={400} step={10}
                    value={minSure}
                    onChange={v => setMinSure(Math.min(v, maxSure - 10))}
                    pct={(minSure / 400) * 100}
                  />
                  <SliderTrack
                    min={0} max={400} step={10}
                    value={maxSure}
                    onChange={v => setMaxSure(Math.max(v, minSure + 10))}
                    pct={(maxSure / 400) * 100}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
                  <span>0</span><span>200</span><span>400+</span>
                </div>
              </div>

              {/* Anahtar Sözcükler */}
              <div>
                <FilterLabel>Anahtar Sözcükler</FilterLabel>
                <input
                  type="text"
                  placeholder="Örn: uzay, dedektif..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && ara()}
                  className={inputCls}
                />
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={ara}
                  className="w-full py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #E11D48 0%, #be123c 100%)',
                    boxShadow: '0 4px 14px rgba(225,29,72,0.25)',
                  }}
                >
                  Ara
                </button>
                {hasFilters && (
                  <button
                    onClick={reset}
                    className="w-full py-2 rounded-xl border border-white/[0.07] text-white/35 text-[12px] hover:text-white/60 hover:border-white/15 transition-all"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </aside>
    </>
  )
}
