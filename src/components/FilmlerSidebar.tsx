'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconChevronDown, IconSlidersHorizontal, IconClose } from '@/components/icons'
import { FILM_GENRES } from '@/lib/film-genres'
import { WATCH_REGIONS } from '@/lib/watch-regions'
import { useLocale } from '@/context/LocaleContext'

export { FILM_GENRES }

const SORT_OPTION_DEFS = [
  { value: 'popularity.desc',           labelKey: 'sidebarFilters.sortOptions.popularityDesc'    },
  { value: 'popularity.asc',            labelKey: 'sidebarFilters.sortOptions.popularityAsc'     },
  { value: 'vote_average.desc',         labelKey: 'sidebarFilters.sortOptions.ratingDesc'        },
  { value: 'vote_average.asc',          labelKey: 'sidebarFilters.sortOptions.ratingAsc'         },
  { value: 'primary_release_date.desc', labelKey: 'sidebarFilters.sortOptions.releaseDateDesc'   },
  { value: 'primary_release_date.asc',  labelKey: 'sidebarFilters.sortOptions.releaseDateAsc'    },
  { value: 'title.asc',                 labelKey: 'sidebarFilters.sortOptions.titleAsc'          },
  { value: 'revenue.desc',              labelKey: 'sidebarFilters.sortOptions.revenueDesc'       },
  { value: 'en-cok-puan',               labelKey: 'sidebarFilters.sortOptions.topRatedSinezon'   },
]

const LANGUAGE_OPTION_DEFS = [
  { value: '',   labelKey: 'sidebarFilters.languages.any' },
  { value: 'tr', labelKey: 'sidebarFilters.languages.tr'  },
  { value: 'en', labelKey: 'sidebarFilters.languages.en'  },
  { value: 'fr', labelKey: 'sidebarFilters.languages.fr'  },
  { value: 'de', labelKey: 'sidebarFilters.languages.de'  },
  { value: 'ja', labelKey: 'sidebarFilters.languages.ja'  },
  { value: 'ko', labelKey: 'sidebarFilters.languages.ko'  },
  { value: 'es', labelKey: 'sidebarFilters.languages.es'  },
  { value: 'it', labelKey: 'sidebarFilters.languages.it'  },
  { value: 'zh', labelKey: 'sidebarFilters.languages.zh'  },
  { value: 'hi', labelKey: 'sidebarFilters.languages.hi'  },
  { value: 'pt', labelKey: 'sidebarFilters.languages.pt'  },
  { value: 'ru', labelKey: 'sidebarFilters.languages.ru'  },
  { value: 'ar', labelKey: 'sidebarFilters.languages.ar'  },
]

const GOLD   = '#D4A843'
const GOLD_B = '#F0C060'
const RED    = '#E11D48'

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
}

const CERTIFICATION_OPTION_DEFS = [
  { value: '',      labelKey: 'sidebarFilters.certification.all'   },
  { value: 'G',     labelKey: 'sidebarFilters.certification.g'     },
  { value: 'PG',    labelKey: 'sidebarFilters.certification.pg'    },
  { value: 'PG-13', labelKey: 'sidebarFilters.certification.pg13'  },
  { value: 'R',     labelKey: 'sidebarFilters.certification.r'     },
  { value: 'NC-17', labelKey: 'sidebarFilters.certification.nc17'  },
]

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
  initialUlke?: string
  initialGoster?: string
  initialSertifikasyon?: string
  isLoggedIn?: boolean
}

/* ── Alt bölüm ayırıcısı – gold gradient ── */
function GoldDivider() {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.12) 30%, rgba(212,168,67,0.18) 50%, rgba(212,168,67,0.12) 70%, transparent 100%)`,
    }} />
  )
}

/* ── Section toggle başlığı ── */
function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-white/[0.015] transition-colors group"
    >
      <span
        className="text-[9.5px] font-bold uppercase tracking-[0.18em] transition-colors"
        style={{ color: open ? GOLD : 'rgba(212,168,67,0.45)' }}
      >
        {label}
      </span>
      <IconChevronDown
        className={`h-3 w-3 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
        style={{ color: open ? GOLD : 'rgba(212,168,67,0.3)' }}
      />
    </button>
  )
}

/* ── Filtre etiketi ── */
function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] mb-2.5"
       style={{ color: 'rgba(212,168,67,0.55)' }}>
      {children}
    </p>
  )
}

/* ── Premium slider ── */
function PremiumSlider({ min, max, step, value, onChange, pct }: {
  min: number; max: number; step: number
  value: number; onChange: (v: number) => void; pct: number
}) {
  return (
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="lux-range w-full cursor-pointer"
      style={{
        background: `linear-gradient(to right, ${GOLD} 0%, ${GOLD} ${pct}%, rgba(255,255,255,0.07) ${pct}%, rgba(255,255,255,0.07) 100%)`,
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
  initialUlke = 'TR',
  initialGoster = 'hepsi',
  initialSertifikasyon = '',
  isLoggedIn = false,
}: Props) {
  const { t } = useLocale()
  const router = useRouter()
  const sp = useSearchParams()

  const SORT_OPTIONS = SORT_OPTION_DEFS.map(o => ({ value: o.value, label: t(o.labelKey) }))
  const LANGUAGE_OPTIONS = LANGUAGE_OPTION_DEFS.map(o => ({ value: o.value, label: t(o.labelKey) }))
  const CERTIFICATION_OPTIONS = CERTIFICATION_OPTION_DEFS.map(o => ({ value: o.value, label: t(o.labelKey) }))

  const [sirala,        setSirala]        = useState(initialSirala || 'popularity.desc')
  const [genres,        setGenres]        = useState<string[]>(
    initialGenre ? initialGenre.split(',').filter(Boolean) : []
  )
  const [platform,      setPlatform]      = useState(initialPlatform)
  const [dil,           setDil]           = useState(initialDil)
  const [tarihten,      setTarihten]      = useState(initialTarihten)
  const [tarihe,        setTarihe]        = useState(initialTarihe)
  const [minPuan,       setMinPuan]       = useState(Number(initialMinPuan) || 0)
  const [minOy,         setMinOy]         = useState(Number(initialMinOy) || 0)
  const [minSure,       setMinSure]       = useState(Number(initialMinSure) || 0)
  const [maxSure,       setMaxSure]       = useState(Number(initialMaxSure) || 400)
  const [keyword,       setKeyword]       = useState(initialKeyword)
  const [ulke,          setUlke]          = useState(initialUlke || 'TR')
  const [goster,        setGoster]        = useState(initialGoster || 'hepsi')
  const [sertifikasyon, setSertifikasyon] = useState(initialSertifikasyon || '')
  const [providerList,  setProviderList]  = useState<Provider[]>(providers)
  const [loadingProv,   setLoadingProv]   = useState(false)

  const [gosterOpen,   setGosterOpen]   = useState(true)
  const [providerOpen, setProviderOpen] = useState(true)
  const [dilOpen,      setDilOpen]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(true)

  const changeRegion = useCallback(async (code: string) => {
    setUlke(code)
    setPlatform('')
    setLoadingProv(true)
    try {
      const res = await fetch(`/api/providers?type=movie&region=${code}`)
      const data = await res.json()
      setProviderList(data.results ?? [])
    } catch {
      setProviderList([])
    } finally {
      setLoadingProv(false)
    }
  }, [])

  function toggleGenre(id: string) {
    setGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
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
    if (ulke && ulke !== 'TR') params.set('ulke',  ulke)
    if (goster && goster !== 'hepsi') params.set('goster', goster)
    if (sertifikasyon)      params.set('sertifikasyon', sertifikasyon)
    return `/filmler${params.toString() ? `?${params}` : ''}`
  }

  function ara() { setDrawerOpen(false); router.push(buildUrl()) }

  function reset() {
    setGenres([]); setPlatform(''); setSirala('popularity.desc')
    setDil(''); setTarihten(''); setTarihe('')
    setMinPuan(0); setMinOy(0); setMinSure(0); setMaxSure(400); setKeyword('')
    setGoster('hepsi'); setSertifikasyon('')
    changeRegion('TR')
    const params = new URLSearchParams()
    const kategori = sp.get('kategori')
    if (kategori && kategori !== 'populer') params.set('kategori', kategori)
    router.push(`/filmler${params.toString() ? `?${params}` : ''}`)
  }

  const hasFilters = !!(genres.length > 0 || platform || sirala !== 'popularity.desc' ||
    dil || tarihten || tarihe || minPuan > 0 || minOy > 0 ||
    minSure > 0 || maxSure < 400 || keyword.trim() ||
    (goster && goster !== 'hepsi') || sertifikasyon)

  const [drawerOpen, setDrawerOpen] = useState(false)

  const selectCls = 'w-full rounded-xl px-3 py-2.5 text-[12.5px] text-white focus:outline-none transition-all appearance-none cursor-pointer pr-8'

  return (
    <>
      <style>{`
        .lux-range {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 9999px;
          outline: none;
        }
        .lux-range::-webkit-slider-thumb {
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
        .lux-range::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 0 0 3px ${GOLD}, 0 2px 12px rgba(212,168,67,0.55);
        }
        .lux-range::-moz-range-thumb {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: ${GOLD_B};
          border: 2px solid #0e1522;
          box-shadow: 0 0 0 2px ${GOLD};
          cursor: pointer;
        }
        .lux-select-wrap select {
          background-image: none;
        }
        .lux-input:focus {
          box-shadow: 0 0 0 2px rgba(212,168,67,0.15);
        }
      `}</style>

      {/* ── Mobil: backdrop ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobil: floating Filtrele butonu ── */}
      <button
        className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white active:scale-95 transition-transform"
        style={{
          background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`,
          boxShadow: '0 4px 24px rgba(225,29,72,0.45)',
          display: drawerOpen ? 'none' : undefined,
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <IconSlidersHorizontal className="h-4 w-4" />
        {t('sidebarFilters.filterButton')}
        {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#F0C060]" />}
      </button>

      {/* ── Sidebar: mobilde drawer, desktop'ta sticky ── */}
      <aside
        className={[
          'pb-6 overflow-y-auto scrollbar-thin',
          drawerOpen
            ? 'fixed top-0 right-0 h-full w-[290px] pt-3 px-3 z-50'
            : 'hidden',
          'lg:block lg:static lg:w-[270px] lg:shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)]',
        ].join(' ')}
        style={drawerOpen ? { background: '#0b0f19' } : undefined}
      >
        {/* Mobil kapat butonu */}
        {drawerOpen && (
          <div className="lg:hidden flex justify-between items-center px-1 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: 'rgba(212,168,67,0.5)' }}>{t('sidebarFilters.filterButton')}</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
        )}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #141c2f 0%, #0e1420 100%)',
            border: '1px solid rgba(212,168,67,0.10)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,168,67,0.04) inset',
          }}
        >

          {/* ── Gold top accent line ── */}
          <div style={{
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${GOLD} 30%, ${GOLD_B} 50%, ${GOLD} 70%, transparent 100%)`,
            opacity: 0.65,
          }} />

          {/* ── Gösterme Ölçütü ── */}
          <>
            <SectionHeader
              label={t('sidebarFilters.filmler.showCriteria')}
              open={gosterOpen}
              onToggle={() => setGosterOpen(o => !o)}
            />
            {gosterOpen && (
              <div className="px-5 pb-4 space-y-2">
                {[
                  { value: 'hepsi',         label: t('sidebarFilters.filmler.showAll') },
                  { value: 'gormediklerim', label: t('sidebarFilters.filmler.showUnwatched') },
                  { value: 'gorduklerim',   label: t('sidebarFilters.filmler.showWatched') },
                ].map(opt => {
                  const needsAuth = opt.value !== 'hepsi' && !isLoggedIn
                  const active = goster === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 cursor-pointer group ${needsAuth ? 'opacity-40' : ''}`}
                      title={needsAuth ? t('sidebarFilters.filmler.loginRequired') : undefined}
                    >
                      <div
                        onClick={() => !needsAuth && setGoster(opt.value)}
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={active
                          ? { borderColor: GOLD, background: GOLD }
                          : { borderColor: 'rgba(212,168,67,0.25)', background: 'transparent' }
                        }
                      >
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-[#0b0f19]" />}
                      </div>
                      <span
                        className="text-[12px] transition-colors"
                        style={{ color: active ? GOLD_B : needsAuth ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)' }}
                        onClick={() => !needsAuth && setGoster(opt.value)}
                      >
                        {opt.label}
                        {needsAuth && <span className="ml-1 text-[10px]">🔒</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
            <GoldDivider />
          </>

          {/* ── Sırala ── */}
          <div className="px-5 pt-5 pb-4">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-3"
               style={{ color: 'rgba(212,168,67,0.5)' }}>
              {t('sidebarFilters.sort')}
            </p>
            <div className="relative lux-select-wrap">
              <select
                value={sirala}
                onChange={e => setSirala(e.target.value)}
                className={selectCls}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(212,168,67,0.12)',
                }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#141c2f] text-white">
                    {o.label}
                  </option>
                ))}
              </select>
              <IconChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3"
                style={{ color: GOLD, opacity: 0.5 }}
              />
            </div>

            {/* Ara Butonu */}
            <button
              onClick={ara}
              className="mt-3 w-full py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98] tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`,
                boxShadow: `0 4px 18px rgba(225,29,72,0.32), 0 1px 0 rgba(255,255,255,0.08) inset`,
              }}
            >
              {t('sidebarFilters.search')}
            </button>
          </div>

          <GoldDivider />

          {/* ── İzleme Servisleri ── */}
          <>
            <SectionHeader
              label={t('sidebarFilters.watchProviders')}
              open={providerOpen}
              onToggle={() => setProviderOpen(o => !o)}
            />
            {providerOpen && (
              <div className="px-5 pb-4">
                {/* Ülke seçici */}
                <div className="relative mb-3">
                  <select
                    value={ulke}
                    onChange={e => changeRegion(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-[12px] text-white focus:outline-none appearance-none cursor-pointer pr-8"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(212,168,67,0.14)',
                    }}
                  >
                    {WATCH_REGIONS.map(r => (
                      <option key={r.code} value={r.code} className="bg-[#141c2f] text-white">
                        {r.flag} {r.name}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3"
                    style={{ color: GOLD, opacity: 0.5 }}
                  />
                </div>

                {/* Seçim temizle */}
                {platform && (
                  <button
                    onClick={() => setPlatform('')}
                    className="text-[10px] mb-2 transition-colors"
                    style={{ color: 'rgba(212,168,67,0.5)' }}
                  >
                    × {t('sidebarFilters.clearSelection')}
                  </button>
                )}

                {/* Provider logoları */}
                {loadingProv ? (
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-9 h-9 rounded-lg animate-pulse"
                           style={{ background: 'rgba(255,255,255,0.05)' }} />
                    ))}
                  </div>
                ) : providerList.length === 0 ? (
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {t('sidebarFilters.noProvidersInCountry')}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {providerList.map(p => {
                      const active = platform === String(p.provider_id)
                      return (
                        <button
                          key={p.provider_id}
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
                          <img
                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                            alt={p.provider_name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            <GoldDivider />
          </>

          {/* ── Dil ── */}
          <SectionHeader label={t('sidebarFilters.language')} open={dilOpen} onToggle={() => setDilOpen(o => !o)} />
          {dilOpen && (
            <>
              <div className="px-5 pb-4">
                <div className="relative lux-select-wrap">
                  <select
                    value={dil}
                    onChange={e => setDil(e.target.value)}
                    className={selectCls}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(212,168,67,0.12)',
                    }}
                  >
                    {LANGUAGE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-[#141c2f] text-white">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3"
                    style={{ color: GOLD, opacity: 0.5 }}
                  />
                </div>
              </div>
              <GoldDivider />
            </>
          )}

          {/* ── Filtreleme ── */}
          <SectionHeader label={t('sidebarFilters.filtering')} open={filterOpen} onToggle={() => setFilterOpen(o => !o)} />
          {filterOpen && (
            <div className="px-5 pb-5 space-y-5">

              {/* Tarih */}
              <div>
                <FilterLabel>{t('sidebarFilters.firstShowDate')}</FilterLabel>
                <div className="flex gap-2">
                  {[
                    { label: t('sidebarFilters.dateRange.start'), val: tarihten, set: setTarihten, ph: '2000' },
                    { label: t('sidebarFilters.dateRange.end'),   val: tarihe,   set: setTarihe,   ph: String(new Date().getFullYear()) },
                  ].map(f => (
                    <div key={f.label} className="flex-1">
                      <p className="text-[10px] mb-1.5" style={{ color: 'rgba(212,168,67,0.3)' }}>
                        {f.label}
                      </p>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={f.ph}
                        value={f.val}
                        onChange={e => f.set(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="lux-input w-full rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/15 focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,67,0.1)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Türler */}
              <div>
                <FilterLabel>{t('sidebarFilters.genres')}</FilterLabel>
                <div className="flex flex-wrap gap-1.5">
                  {FILM_GENRES.map(g => {
                    const active = genres.includes(String(g.id))
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGenre(String(g.id))}
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
                        }}
                      >
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sertifikasyon */}
              <div>
                <FilterLabel>{t('sidebarFilters.certificationLabel')}</FilterLabel>
                <div className="flex flex-wrap gap-1.5">
                  {CERTIFICATION_OPTIONS.map(cert => {
                    const active = sertifikasyon === cert.value
                    return (
                      <button
                        key={cert.value}
                        onClick={() => setSertifikasyon(active ? '' : cert.value)}
                        className="text-[11px] px-2.5 py-1 rounded-full transition-all duration-150"
                        title={cert.label}
                        style={active ? {
                          background: 'rgba(212,168,67,0.1)',
                          border: `1px solid rgba(212,168,67,0.45)`,
                          color: GOLD_B,
                          fontWeight: 600,
                        } : {
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {cert.value || t('sidebarFilters.certification.all')}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Kullanıcı Puanı */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FilterLabel>{t('sidebarFilters.userRating')}</FilterLabel>
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
                  <FilterLabel>{t('sidebarFilters.minVotes')}</FilterLabel>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: GOLD_B }}>
                    {minOy.toLocaleString('tr-TR')}
                  </span>
                </div>
                <PremiumSlider min={0} max={500} step={50} value={minOy} onChange={setMinOy} pct={(minOy / 500) * 100} />
                <div className="flex justify-between text-[10px] mt-1.5" style={{ color: 'rgba(212,168,67,0.2)' }}>
                  <span>0</span><span>250</span><span>500+</span>
                </div>
              </div>

              {/* Süre */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <FilterLabel>{t('sidebarFilters.duration')}</FilterLabel>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: GOLD_B }}>
                    {minSure > 0 ? `${minSure}–` : ''}{maxSure >= 400 ? `400+ ${t('film.runtime')}` : `${maxSure} ${t('film.runtime')}`}
                  </span>
                </div>
                <div className="space-y-2">
                  <PremiumSlider min={0} max={400} step={10} value={minSure}
                    onChange={v => setMinSure(Math.min(v, maxSure - 10))} pct={(minSure / 400) * 100} />
                  <PremiumSlider min={0} max={400} step={10} value={maxSure}
                    onChange={v => setMaxSure(Math.max(v, minSure + 10))} pct={(maxSure / 400) * 100} />
                </div>
                <div className="flex justify-between text-[10px] mt-1.5" style={{ color: 'rgba(212,168,67,0.2)' }}>
                  <span>0</span><span>200</span><span>400+</span>
                </div>
              </div>

              {/* Anahtar Sözcükler */}
              <div>
                <FilterLabel>{t('sidebarFilters.keywords')}</FilterLabel>
                <input
                  type="text"
                  placeholder={t('sidebarFilters.keywordsPlaceholder')}
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && ara()}
                  className="lux-input w-full rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/15 focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,67,0.1)' }}
                />
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={ara}
                  className="w-full py-2.5 rounded-xl font-semibold text-[13px] text-white tracking-wide transition-all hover:opacity-92 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${RED} 0%, #be123c 100%)`,
                    boxShadow: `0 4px 18px rgba(225,29,72,0.30), 0 1px 0 rgba(255,255,255,0.08) inset`,
                  }}
                >
                  {t('sidebarFilters.search')}
                </button>
                {hasFilters && (
                  <button
                    onClick={reset}
                    className="w-full py-2 rounded-xl text-[11.5px] transition-all"
                    style={{
                      border: '1px solid rgba(212,168,67,0.1)',
                      color: 'rgba(212,168,67,0.35)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,168,67,0.65)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.25)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(212,168,67,0.35)'
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.1)'
                    }}
                  >
                    {t('sidebarFilters.clearFilters')}
                  </button>
                )}
              </div>

            </div>
          )}

          {/* ── Bottom gold accent ── */}
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.08) 50%, transparent 100%)`,
          }} />

        </div>
      </aside>
    </>
  )
}
