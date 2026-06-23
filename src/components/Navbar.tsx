'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { IconSearch, IconFilm, IconTv, IconMenu, IconClose, IconChevronRight } from '@/components/icons'
import NotificationBell from './NotificationBell'
import LanguageSwitcher from './LanguageSwitcher'
import { NavDropdown } from './NavDropdown'
import UserDropdown from './UserDropdown'
import { useLocale } from '@/context/LocaleContext'

interface NavbarProps {
  user?: { id?: string; email?: string; username?: string; is_admin?: boolean } | null
}

interface SearchResult {
  id: number
  type: 'film' | 'dizi'
  title: string
  original_title?: string | null
  year?: string | null
  poster: string | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setShowDropdown(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`)
      if (!res.ok) return
      const data = await res.json()
      const results: SearchResult[] = (data.results ?? []).map((r: { id: number; title: string; type: string; poster: string | null; original_title?: string | null; year?: string | null }) => ({
        id: r.id,
        type: r.type === 'tv' ? 'dizi' as const : 'film' as const,
        title: r.title,
        original_title: r.original_title ?? null,
        year: r.year ?? null,
        poster: r.poster,
      }))
      setSuggestions(results)
      setShowDropdown(results.length > 0)
    } catch {}
    finally { setSearching(false) }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchSuggestions(query), 280)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, fetchSuggestions])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      setShowDropdown(false)
      setMobileSearchOpen(false)
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  function handleSuggestionClick() {
    setShowDropdown(false)
    setQuery('')
  }

  return (
    <nav className="sticky top-0 z-50 glass-panel" style={{ overflow: 'visible' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <IconFilm className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Sine<span style={{ color: 'var(--accent)' }}>zon</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-stretch gap-0.5 text-[13px] font-medium shrink-0">
            <NavDropdown
              label={t('nav.films')}
              href="/filmler"
              columns={2}
              items={[
                { label: 'Tüm Filmler',      href: '/filmler',                             description: 'Filtrele ve keşfet' },
                { label: 'En İyi Puanlı',    href: '/filmler?sirala=vote_average.desc',    description: 'Puana göre sıralı' },
                { label: 'Yeni Çıkanlar',    href: '/filmler?sirala=release_date.desc',    description: 'En son yayınlananlar' },
                { label: 'Yerli Filmler',    href: '/filmler?ozel=yerli-yapimlar',         description: 'Türk yapımı filmler' },
                { label: 'Oscar Kazananlar', href: '/filmler?ozel=oscar-kazananlar',       description: 'Ödüllü yapımlar' },
                { label: 'Kült Filmler',     href: '/filmler?ozel=kult-filmler',           description: 'Efsaneleşmiş filmler' },
              ]}
            />
            <NavDropdown
              label={t('nav.series')}
              href="/diziler"
              columns={2}
              items={[
                { label: 'Tüm Diziler',     href: '/diziler',                                description: 'Filtrele ve keşfet' },
                { label: 'En İyi Diziler',  href: '/diziler?sirala=vote_average.desc',       description: 'Puana göre sıralı' },
                { label: 'Yeni Diziler',    href: '/diziler?sirala=first_air_date.desc',     description: 'En güncel diziler' },
                { label: 'Yerli Diziler',   href: '/diziler?ozel=yerli-diziler',             description: 'Türk yapımı diziler' },
                { label: 'Anime',           href: '/diziler?ozel=anime',                     description: 'Japon animasyon dizileri' },
                { label: 'Polisiye',        href: '/diziler?ozel=polisiye',                  description: 'Dedektif ve suç dizileri' },
              ]}
            />
            <Link href="/en-cok-yorumlanan" className="self-stretch flex items-center px-2.5 text-[13px] font-medium transition-colors text-[--text-secondary] hover:text-[--text-primary]">
              Popüler
            </Link>
            <Link href="/ne-izlesem" className="self-stretch flex items-center px-2.5 text-[13px] font-medium transition-colors text-[--text-secondary] hover:text-[--text-primary]">
              Ne İzlesem?
            </Link>
            <Link href="/listeler" className="self-stretch flex items-center px-2.5 text-[13px] font-medium transition-colors text-[--text-secondary] hover:text-[--text-primary]">
              {t('nav.lists')}
            </Link>
            <Link href="/yayin-takvimi" className="self-stretch flex items-center px-2.5 text-[13px] font-medium transition-colors text-[--text-secondary] hover:text-[--text-primary]">
              Takvim
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs lg:max-w-md hidden md:block relative" ref={dropdownRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  placeholder={t('nav.search')}
                  className="w-full rounded-full bg-[--bg-card] border border-[--border] py-2 pl-9 pr-4 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </form>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-[--border] shadow-2xl z-[9999] overflow-hidden backdrop-blur-xl" style={{ background: 'rgba(11,15,25,0.97)' }}>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[--text-secondary]">Sonuçlar</p>
                </div>
                {suggestions.map(item => (
                  <a
                    key={`${item.type}-${item.id}`}
                    href={`/${item.type}/${item.id}`}
                    onClick={handleSuggestionClick}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                  >
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-[--bg-card] shrink-0 shadow-md">
                      {item.poster
                        ? <Image src={item.poster} alt={item.title} fill sizes="40px" className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[--text-secondary]">
                            {item.type === 'film' ? <IconFilm className="h-4 w-4 opacity-30" /> : <IconTv className="h-4 w-4 opacity-30" />}
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-[--accent] transition-colors">{item.title}</p>
                      {item.original_title && item.original_title !== item.title && (
                        <p className="text-[11px] text-[--text-secondary] truncate mt-0.5 leading-tight">{item.original_title}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          item.type === 'film'
                            ? 'bg-[--accent]/15 text-[--accent]'
                            : 'bg-blue-500/15 text-blue-400'
                        }`}>
                          {item.type === 'film' ? 'Film' : 'Dizi'}
                        </span>
                        {item.year && <span className="text-[10px] text-[--text-secondary]">{item.year}</span>}
                      </div>
                    </div>
                    <IconChevronRight className="h-3.5 w-3.5 text-[--text-secondary] opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                  </a>
                ))}
                <div className="border-t border-[--border]/50 mx-4" />
                <a
                  href={`/arama?q=${encodeURIComponent(query)}`}
                  onClick={handleSuggestionClick}
                  className="flex items-center justify-between px-4 py-3 text-xs text-[--text-secondary] hover:text-[--accent] transition-colors group"
                >
                  <span>"{query}" için tüm sonuçlar</span>
                  <IconChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            )}
          </div>

          {/* Auth + Language */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            {user?.id ? (
              <div className="flex items-center gap-2">
                <NotificationBell userId={user.id} />
                <UserDropdown user={{ id: user.id, email: user.email, username: user.username, is_admin: user.is_admin }} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/giris"
                  className="text-[13px] text-[--text-secondary] hover:text-white transition-colors px-3 py-1.5"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/kayit"
                  className="text-[13px] font-medium bg-[--accent] hover:bg-[--accent-hover] text-white px-4 py-1.5 rounded-full transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: search + menu toggles */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              className="p-2 text-[--text-secondary] hover:text-white transition-colors"
              onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMenuOpen(false) }}
              aria-label="Ara"
            >
              {mobileSearchOpen ? <IconClose className="h-5 w-5" /> : <IconSearch className="h-5 w-5" />}
            </button>
            <button
              className="p-2 text-[--text-secondary] hover:text-white transition-colors"
              onClick={() => { setMenuOpen(!menuOpen); setMobileSearchOpen(false) }}
              aria-label="Menü"
            >
              {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-[--border] bg-[--bg-primary] px-4 py-3" ref={mobileSearchRef}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary]" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Film, dizi, oyuncu ara..."
                className="w-full rounded-full bg-[--bg-card] border border-[--border] py-2.5 pl-9 pr-4 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent]"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </form>
          {showDropdown && suggestions.length > 0 && (
            <div className="mt-2 rounded-2xl border border-[--border] shadow-2xl overflow-hidden backdrop-blur-xl" style={{ background: 'rgba(11,15,25,0.97)' }}>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[--text-secondary]">Sonuçlar</p>
              </div>
              {suggestions.map(item => (
                <a
                  key={`mob-${item.type}-${item.id}`}
                  href={`/${item.type}/${item.id}`}
                  onClick={() => { setMobileSearchOpen(false); setShowDropdown(false); setQuery('') }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-[--bg-card] shrink-0 shadow-md">
                    {item.poster
                      ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center text-[--text-secondary]">
                          {item.type === 'film' ? <IconFilm className="h-4 w-4 opacity-30" /> : <IconTv className="h-4 w-4 opacity-30" />}
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    {item.original_title && item.original_title !== item.title && (
                      <p className="text-[11px] text-[--text-secondary] truncate mt-0.5 leading-tight">{item.original_title}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        item.type === 'film'
                          ? 'bg-[--accent]/15 text-[--accent]'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {item.type === 'film' ? 'Film' : 'Dizi'}
                      </span>
                      {item.year && <span className="text-[10px] text-[--text-secondary]">{item.year}</span>}
                    </div>
                  </div>
                </a>
              ))}
              <div className="border-t border-[--border]/50 mx-4" />
              <a
                href={`/arama?q=${encodeURIComponent(query)}`}
                onClick={() => { setMobileSearchOpen(false); setShowDropdown(false); setQuery('') }}
                className="flex items-center justify-between px-4 py-3 text-xs text-[--text-secondary] hover:text-[--accent] transition-colors"
              >
                <span>"{query}" için tüm sonuçlar</span>
                <IconChevronRight className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[--border] px-4 py-4 space-y-4" style={{ background: 'var(--bg-secondary)' }}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full rounded-full bg-[--bg-card] border border-[--border] py-2 pl-9 pr-4 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent]"
              />
            </div>
          </form>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
            <Link href="/filmler" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.films')}</Link>
            <Link href="/diziler" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.series')}</Link>
            <Link href="/en-cok-yorumlanan" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.popular')}</Link>
            <Link href="/ne-izlesem" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.whatToWatch')}</Link>
            <Link href="/listeler" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.lists')}</Link>
            <Link href="/fragmanlar" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.trailers')}</Link>
            <Link href="/yayin-takvimi" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Yayın Takvimi</Link>
            <Link href="/karsilastir" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Karşılaştır</Link>
            <Link href="/forum" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Forum</Link>
            {user && <Link href="/bildirimler" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Bildirimler</Link>}
            {user && <Link href="/akis" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.feed')}</Link>}
            {user && <Link href="/gunluk" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Günlük</Link>}
            {user && <Link href="/film-gecesi" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Film Gecesi</Link>}
            {user && <Link href="/izleme-listem" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>İzleme Listem</Link>}
            {user && <Link href="/mesajlar" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Mesajlar</Link>}
            {user && <Link href="/ortak-izlenenler" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Ortak İzlenenler</Link>}
            {user && <Link href="/arkadaslar" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Arkadaş Önerileri</Link>}
            {user && <Link href="/benzer-kullanicilar" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Benzer Kullanıcılar</Link>}
            <Link href="/sinema" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>🌍 Dünya Sineması</Link>
            <Link href="/donem" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>📅 Dönemlere Göre</Link>
            <Link href="/ruh-hali" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>✨ Ruh Haline Göre</Link>
            <Link href="/kullanicilar" className="py-2 text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>Kullanıcılar</Link>
            <div className="pt-2 border-t border-[--border]">
              <LanguageSwitcher />
            </div>
            {!user && (
              <div className="flex gap-2 pt-2 border-t border-[--border]">
                <Link href="/auth/giris" className="flex-1 text-center py-2 border border-[--border] rounded-full text-[--text-secondary] hover:text-white" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
                <Link href="/auth/kayit" className="flex-1 text-center py-2 bg-[--accent] rounded-full text-white font-medium" onClick={() => setMenuOpen(false)}>{t('nav.register')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
