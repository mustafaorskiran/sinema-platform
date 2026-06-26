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
  { value: '',   label: 'Herhangi' },
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

function SidebarSection({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
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

function SubLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-bold text-white mb-2 ${className}`}>{children}</p>
  )
}

const inputCls = 'w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[--accent] transition-colors'

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

  return (
    <aside className="w-[270px] shrink-0 sticky top-20 self-start space-y-2 pb-6 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">

      {/* ── Sırala ── */}
      <SidebarSection title="Sırala">
        <select value={sirala} onChange={e => setSirala(e.target.value)} className={inputCls}>
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

      {/* ── İzleme Servisleri ── */}
      {providers.length > 0 && (
        <SidebarSection title="İzleme Servisleri">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base leading-none">🇹🇷</span>
            <span className="text-[12px] text-white font-medium">Türkiye</span>
            {platform && (
              <button
                onClick={() => setPlatform('')}
                className="ml-auto text-[10px] text-[--accent] hover:underline"
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
        </SidebarSection>
      )}

      {/* ── Dil ── */}
      <SidebarSection title="Dil">
        <select value={dil} onChange={e => setDil(e.target.value)} className={inputCls}>
          {LANGUAGE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </SidebarSection>

      {/* ── Filtreleme Düğmeleri ── */}
      <SidebarSection title="Filtreleme Düğmeleri" defaultOpen>
        <div className="space-y-4">

          {/* Tarih Aralığı */}
          <div>
            <SubLabel>İlk Gösterim Tarihi</SubLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-[10px] text-[--text-secondary] mb-1">Başlangıç</p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="2000"
                  value={tarihten}
                  onChange={e => setTarihten(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
                  onChange={e => setTarihe(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full bg-[--bg-secondary] border border-[--border] rounded px-2 py-1.5 text-[12px] text-white placeholder:text-[--text-secondary] focus:outline-none focus:border-[--accent]"
                />
              </div>
            </div>
          </div>

          {/* Türler — çoklu seçim */}
          <div>
            <SubLabel>Türler</SubLabel>
            <div className="flex flex-wrap gap-1.5">
              {FILM_GENRES.map(g => {
                const active = genres.includes(String(g.id))
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(String(g.id))}
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

          {/* Kullanıcı Puanı */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <SubLabel className="mb-0">Kullanıcı Puanı</SubLabel>
              <span className="text-[11px] font-bold text-[--accent] tabular-nums">
                {minPuan.toFixed(1)}
              </span>
            </div>
            <input
              type="range" min="0" max="10" step="0.5"
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
            <div className="flex items-center justify-between mb-1.5">
              <SubLabel className="mb-0">En Az Kullanıcı Oyu</SubLabel>
              <span className="text-[11px] font-bold text-[--accent] tabular-nums">
                {minOy.toLocaleString('tr-TR')}
              </span>
            </div>
            <input
              type="range" min="0" max="500" step="50"
              value={minOy}
              onChange={e => setMinOy(Number(e.target.value))}
              className="w-full accent-[--accent] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>0</span><span>250</span><span>500+</span>
            </div>
          </div>

          {/* Süre */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <SubLabel className="mb-0">Süre (Dakika)</SubLabel>
              <span className="text-[11px] font-bold text-[--accent] tabular-nums">
                {minSure}–{maxSure >= 400 ? '400+' : maxSure}
              </span>
            </div>
            <div className="space-y-1">
              <input
                type="range" min="0" max="400" step="10"
                value={minSure}
                onChange={e => setMinSure(Math.min(Number(e.target.value), maxSure - 10))}
                className="w-full accent-[--accent] cursor-pointer"
              />
              <input
                type="range" min="0" max="400" step="10"
                value={maxSure}
                onChange={e => setMaxSure(Math.max(Number(e.target.value), minSure + 10))}
                className="w-full accent-[--accent] cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[--text-secondary] mt-0.5">
              <span>0</span><span>200</span><span>400+</span>
            </div>
          </div>

          {/* Anahtar Sözcükler */}
          <div>
            <SubLabel>Anahtar Sözcükler</SubLabel>
            <input
              type="text"
              placeholder="Birden fazla anahtar sözcük..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ara()}
              className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-1.5 text-[12px] text-white placeholder:text-[--text-secondary] focus:outline-none focus:border-[--accent]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-1 space-y-2">
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

        </div>
      </SidebarSection>
    </aside>
  )
}
