'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconChevronDown } from '@/components/icons'
import { FILM_GENRES } from '@/lib/film-genres'

const SORT_OPTIONS = [
  { value: 'popularity.desc',           label: 'Popülerlik Azalan'         },
  { value: 'popularity.asc',            label: 'Popülerlik Artan'          },
  { value: 'vote_average.desc',         label: 'En Yüksek Puan'            },
  { value: 'vote_average.asc',          label: 'En Düşük Puan'             },
  { value: 'primary_release_date.desc', label: 'Çıkış Tarihi (Yeni → Eski)'},
  { value: 'primary_release_date.asc',  label: 'Çıkış Tarihi (Eski → Yeni)'},
  { value: 'title.asc',                 label: 'Başlık (A → Z)'            },
  { value: 'revenue.desc',              label: 'Gişe Hasılatı'             },
]

export { FILM_GENRES }

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
}

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-[--border] bg-[--bg-card] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/[.03] transition-colors"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-[--text-secondary]">
          {title}
        </span>
        <IconChevronDown
          className={`h-3.5 w-3.5 text-[--text-secondary] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-[--border] px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
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
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [genre,     setGenre]     = useState(initialGenre)
  const [platform,  setPlatform]  = useState(initialPlatform)
  const [sirala,    setSirala]    = useState(initialSirala || 'popularity.desc')
  const [tarihten,  setTarihten]  = useState(initialTarihten)
  const [tarihe,    setTarihe]    = useState(initialTarihe)
  const [minPuan,   setMinPuan]   = useState(Number(initialMinPuan) || 0)
  const [minOy,     setMinOy]     = useState(Number(initialMinOy) || 0)

  function buildUrl(overrides: Partial<{
    genre: string; platform: string; sirala: string
    tarihten: string; tarihe: string; minPuan: number; minOy: number
  }> = {}) {
    const g  = overrides.genre    !== undefined ? overrides.genre    : genre
    const pl = overrides.platform !== undefined ? overrides.platform : platform
    const s  = overrides.sirala   !== undefined ? overrides.sirala   : sirala
    const tf = overrides.tarihten !== undefined ? overrides.tarihten : tarihten
    const tt = overrides.tarihe   !== undefined ? overrides.tarihe   : tarihe
    const mp = overrides.minPuan  !== undefined ? overrides.minPuan  : minPuan
    const mo = overrides.minOy    !== undefined ? overrides.minOy    : minOy

    const params = new URLSearchParams()
    const kategori = searchParams.get('kategori')
    if (kategori && kategori !== 'populer') params.set('kategori', kategori)
    if (g)  params.set('genre',    g)
    if (pl) params.set('platform', pl)
    if (s && s !== 'popularity.desc') params.set('sirala', s)
    if (tf) params.set('tarihten', tf)
    if (tt) params.set('tarihe',   tt)
    if (mp > 0) params.set('min_puan', String(mp))
    if (mo > 0) params.set('min_oy',   String(mo))
    return `/filmler${params.toString() ? `?${params}` : ''}`
  }

  function ara() {
    router.push(buildUrl())
  }

  function reset() {
    setGenre(''); setPlatform(''); setSirala('popularity.desc')
    setTarihten(''); setTarihe(''); setMinPuan(0); setMinOy(0)
    const params = new URLSearchParams()
    const kategori = searchParams.get('kategori')
    if (kategori && kategori !== 'populer') params.set('kategori', kategori)
    router.push(`/filmler${params.toString() ? `?${params}` : ''}`)
  }

  const hasFilters = genre || platform || sirala !== 'popularity.desc' ||
    tarihten || tarihe || minPuan > 0 || minOy > 0

  return (
    <aside className="w-[260px] shrink-0 sticky top-20 self-start space-y-2 pb-6 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">

      {/* Sıralama */}
      <SidebarSection title="Sırala">
        <select
          value={sirala}
          onChange={e => setSirala(e.target.value)}
          className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[--accent] transition-colors"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={ara}
          className="mt-3 w-full py-2 rounded-lg bg-[--accent] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
        >
          Ara
        </button>
      </SidebarSection>

      {/* Streaming Servisleri */}
      {providers.length > 0 && (
        <SidebarSection title="İzleme Servisleri">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg leading-none">🇹🇷</span>
            <span className="text-xs text-white font-medium">Türkiye</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {providers.map(p => {
              const active = platform === String(p.provider_id)
              return (
                <button
                  key={p.provider_id}
                  onClick={() => setPlatform(active ? '' : String(p.provider_id))}
                  title={p.provider_name}
                  className={`w-10 h-10 rounded-lg overflow-hidden transition-all ${
                    active
                      ? 'ring-2 ring-[--accent] ring-offset-1 ring-offset-[--bg-card] opacity-100'
                      : 'opacity-60 hover:opacity-100'
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
          {platform && (
            <button
              onClick={() => setPlatform('')}
              className="mt-2 text-[11px] text-[--accent] hover:underline"
            >
              Platformu Temizle
            </button>
          )}
        </SidebarSection>
      )}

      {/* Filtreleme */}
      <SidebarSection title="Filtreleme Düğmeleri">
        <div className="space-y-5">

          {/* Türler */}
          <div>
            <p className="text-[11px] font-semibold text-[--text-secondary] mb-2">Türler</p>
            <div className="flex flex-wrap gap-1.5">
              {FILM_GENRES.map(g => {
                const active = genre === String(g.id)
                return (
                  <button
                    key={g.id}
                    onClick={() => setGenre(active ? '' : String(g.id))}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      active
                        ? 'bg-[--accent]/15 border-[--accent] text-[--accent] font-semibold'
                        : 'border-[--border] text-[--text-secondary] hover:border-[--accent]/40 hover:text-white'
                    }`}
                  >
                    {g.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* İlk Gösterim Tarihi */}
          <div>
            <p className="text-[11px] font-semibold text-[--text-secondary] mb-2">İlk Gösterim Tarihi</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-[10px] text-[--text-secondary] mb-1">Başlangıç</p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="2000"
                  value={tarihten}
                  onChange={e => setTarihten(e.target.value.replace(/\D/, '').slice(0, 4))}
                  className="w-full bg-[--bg-secondary] border border-[--border] rounded px-2 py-1.5 text-[12px] text-white placeholder:text-[--text-secondary] focus:outline-none focus:border-[--accent]"
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-[--text-secondary] mb-1">Bitiş</p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={String(new Date().getFullYear())}
                  value={tarihe}
                  onChange={e => setTarihe(e.target.value.replace(/\D/, '').slice(0, 4))}
                  className="w-full bg-[--bg-secondary] border border-[--border] rounded px-2 py-1.5 text-[12px] text-white placeholder:text-[--text-secondary] focus:outline-none focus:border-[--accent]"
                />
              </div>
            </div>
          </div>

          {/* En Az Puan */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-semibold text-[--text-secondary]">En Az Puan</p>
              <span className="text-[11px] font-bold text-white tabular-nums">{minPuan.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0" max="10" step="0.5"
              value={minPuan}
              onChange={e => setMinPuan(Number(e.target.value))}
              className="w-full accent-[--accent] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>0</span><span>5</span><span>10</span>
            </div>
          </div>

          {/* En Az Kullanıcı Oyu */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-semibold text-[--text-secondary]">En Az Kullanıcı Oyu</p>
              <span className="text-[11px] font-bold text-white tabular-nums">{minOy}</span>
            </div>
            <input
              type="range"
              min="0" max="500" step="50"
              value={minOy}
              onChange={e => setMinOy(Number(e.target.value))}
              className="w-full accent-[--accent] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>0</span><span>250</span><span>500</span>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={ara}
            className="w-full py-2 rounded-lg bg-[--accent] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
          >
            Ara
          </button>
          {hasFilters && (
            <button
              onClick={reset}
              className="w-full py-1.5 rounded-lg border border-[--border] text-[--text-secondary] text-[12px] hover:text-white hover:border-[--accent]/40 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </SidebarSection>
    </aside>
  )
}
