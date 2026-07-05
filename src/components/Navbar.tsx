'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { IconSearch, IconFilm, IconTv, IconMenu, IconClose, IconChevronRight } from '@/components/icons'
import Logo from './Logo'
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

const SEARCH_HISTORY_KEY = 'sinezon_search_history'
const MAX_HISTORY = 5

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) ?? '[]') } catch { return [] }
}
function addToHistory(term: string) {
  const prev = getHistory().filter(h => h !== term)
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([term, ...prev].slice(0, MAX_HISTORY)))
}
function removeFromHistory(term: string) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(getHistory().filter(h => h !== term)))
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
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [popularItems, setPopularItems] = useState<SearchResult[]>([])
  const [popularFetched, setPopularFetched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPopular = useCallback(async () => {
    if (popularFetched) return
    try {
      const res = await fetch('/api/popular')
      if (!res.ok) return
      const data = await res.json()
      setPopularItems((data.results ?? []).map((r: { id: number; title: string; original_title?: string | null; type: string; poster: string | null; year?: string | null }) => ({
        id: r.id,
        type: r.type === 'tv' ? 'dizi' as const : 'film' as const,
        title: r.title,
        original_title: r.original_title ?? null,
        year: r.year ?? null,
        poster: r.poster,
      })))
      setPopularFetched(true)
    } catch { /* ignore */ }
  }, [popularFetched])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setShowDropdown(false); return }
    setShowHistory(false)
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`)
      if (!res.ok) return
      const data = await res.json()
      const results: SearchResult[] = (data.results ?? []).map((r: {
        id: number; title: string; type: string; poster: string | null
        original_title?: string | null; year?: string | null
      }) => ({
        id: r.id,
        type: r.type === 'tv' ? 'dizi' as const : 'film' as const,
        title: r.title,
        original_title: r.original_title ?? null,
        year: r.year ?? null,
        poster: r.poster,
      }))
      setSuggestions(results)
      setShowDropdown(results.length > 0)
    } catch { /* ignore */ }
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
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      addToHistory(query.trim())
      setSearchHistory(getHistory())
      setShowDropdown(false)
      setShowHistory(false)
      setMobileSearchOpen(false)
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  function handleSuggestionClick() {
    setShowDropdown(false)
    setShowHistory(false)
    setQuery('')
  }

  function handleSearchFocus() {
    const history = getHistory()
    setSearchHistory(history)
    if (suggestions.length === 0 && query.length < 2) {
      setShowHistory(true)
      fetchPopular()
    }
  }

  function handleHistoryClick(term: string) {
    addToHistory(term)
    setShowHistory(false)
    router.push(`/arama?q=${encodeURIComponent(term)}`)
  }

  function handleRemoveHistory(term: string, e: React.MouseEvent) {
    e.stopPropagation()
    removeFromHistory(term)
    setSearchHistory(getHistory())
    if (getHistory().length === 0) setShowHistory(false)
  }

  const suggestionDropdown = showDropdown && (
    <div
      className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-[--border] shadow-2xl z-[9999] overflow-y-auto max-h-[70vh] backdrop-blur-xl"
      style={{ background: 'rgba(11,15,25,0.97)' }}
    >
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[--text-secondary]">{t('nav.searchResultsHeading')}</p>
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
                item.type === 'film' ? 'bg-[--accent]/15 text-[--accent]' : 'bg-blue-500/15 text-blue-400'
              }`}>
                {item.type === 'film' ? t('nav.badgeFilm') : t('nav.badgeSeries')}
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
        <span>{t('nav.allResultsFor', { query })}</span>
        <IconChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  )

  const historyDropdown = showHistory && popularItems.length > 0 && (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-[--border] shadow-2xl z-[9999] overflow-y-auto max-h-[70vh] backdrop-blur-xl"
      style={{ background: 'rgba(11,15,25,0.97)' }}>
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{t('nav.popular')}</p>
      </div>
      {popularItems.map(item => (
        <a
          key={`popular-${item.type}-${item.id}`}
          href={`/${item.type}/${item.id}`}
          onClick={handleSuggestionClick}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
        >
          <div className="relative w-8 h-11 rounded-md overflow-hidden bg-[--bg-card] shrink-0 shadow-md">
            {item.poster
              ? <Image src={item.poster} alt={item.title} fill sizes="32px" className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[--text-secondary]">
                  {item.type === 'film' ? <IconFilm className="h-3 w-3 opacity-30" /> : <IconTv className="h-3 w-3 opacity-30" />}
                </div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-[--accent] transition-colors">{item.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                item.type === 'film' ? 'bg-[--accent]/15 text-[--accent]' : 'bg-blue-500/15 text-blue-400'
              }`}>
                {item.type === 'film' ? t('nav.badgeFilm') : t('nav.badgeSeries')}
              </span>
              {item.year && <span className="text-[10px] text-[--text-secondary]">{item.year}</span>}
            </div>
          </div>
          <IconChevronRight className="h-3.5 w-3.5 text-[--text-secondary] opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
        </a>
      ))}
    </div>
  )


  return (
    <nav className="sticky top-0 z-50 glass-panel" style={{ overflow: 'visible' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>

        {/* ── Desktop row (md+) ── */}
        <div
          className="hidden md:grid h-16 items-center gap-3"
          style={{ gridTemplateColumns: 'auto 1fr auto' }}
        >
          {/* LEFT: Logo + Nav links (lg+) */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/" className="flex items-center gap-2 shrink-0 group mr-5">
              <Logo variant="horizontal" size="sm" className="transition-transform duration-300 group-hover:scale-105" />
            </Link>

            {/* Nav links — visible only on lg+ to prevent overflow on md */}
            <div className="hidden lg:flex items-stretch gap-0.5 text-[13px] font-medium">
              <NavDropdown
                label={t('nav.films')}
                href="/filmler"
                columns={2}
                items={[
                  { label: t('nav.megaMenu.films.allMovies'),        href: '/filmler',                              description: t('nav.megaMenu.films.allMoviesDesc') },
                  { label: t('nav.megaMenu.films.topRated'),         href: '/filmler?sirala=vote_average.desc',     description: t('nav.megaMenu.films.topRatedDesc') },
                  { label: t('nav.megaMenu.films.newest'),           href: '/filmler?sirala=release_date.desc',     description: t('nav.megaMenu.films.newestDesc') },
                  { label: t('nav.megaMenu.films.domestic'),         href: '/filmler?ozel=yerli-yapimlar',          description: t('nav.megaMenu.films.domesticDesc') },
                  { label: t('nav.megaMenu.films.oscarWinners'),     href: '/filmler?ozel=oscar-kazananlar',        description: t('nav.megaMenu.films.oscarWinnersDesc') },
                  { label: t('nav.megaMenu.films.cult'),             href: '/filmler?ozel=kult-filmler',            description: t('nav.megaMenu.films.cultDesc') },
                  { label: t('nav.megaMenu.films.boxOffice'),        href: '/kutu-ofis',                            description: t('nav.megaMenu.films.boxOfficeDesc') },
                  { label: t('nav.megaMenu.films.newOnPlatforms'),   href: '/yeni-gelenler',                        description: t('nav.megaMenu.films.newOnPlatformsDesc') },
                  { label: t('nav.megaMenu.films.news'),             href: '/haberler',                             description: t('nav.megaMenu.films.newsDesc') },
                  { label: t('nav.megaMenu.films.top10'),            href: '/top10',                                description: t('nav.megaMenu.films.top10Desc') },
                ]}
              />
              <NavDropdown
                label={t('nav.series')}
                href="/diziler"
                columns={2}
                items={[
                  { label: t('nav.megaMenu.series.allSeries'), href: '/diziler',                              description: t('nav.megaMenu.series.allSeriesDesc') },
                  { label: t('nav.megaMenu.series.topRated'),  href: '/diziler?sirala=vote_average.desc',     description: t('nav.megaMenu.series.topRatedDesc') },
                  { label: t('nav.megaMenu.series.newest'),    href: '/diziler?sirala=first_air_date.desc',   description: t('nav.megaMenu.series.newestDesc') },
                  { label: t('nav.megaMenu.series.domestic'),  href: '/diziler?ozel=yerli-diziler',           description: t('nav.megaMenu.series.domesticDesc') },
                  { label: t('nav.megaMenu.series.anime'),     href: '/diziler?ozel=anime',                   description: t('nav.megaMenu.series.animeDesc') },
                  { label: t('nav.megaMenu.series.crime'),     href: '/diziler?ozel=polisiye',                description: t('nav.megaMenu.series.crimeDesc') },
                ]}
              />
              <NavDropdown
                label={t('nav.explore')}
                href="/en-cok-yorumlanan"
                columns={2}
                items={[
                  { label: t('nav.megaMenu.explore.mostCommented'),    href: '/en-cok-yorumlanan',    description: t('nav.megaMenu.explore.mostCommentedDesc') },
                  { label: t('nav.whatToWatch'),                        href: '/ne-izlesem',           description: t('nav.megaMenu.explore.whatToWatchDesc') },
                  { label: t('nav.megaMenu.explore.moodPick'),          href: '/mood',                 description: t('nav.megaMenu.explore.moodPickDesc') },
                  { label: t('nav.megaMenu.explore.similarUsers'),      href: '/benzer-kullanicilar',  description: t('nav.megaMenu.explore.similarUsersDesc') },
                  { label: t('nav.megaMenu.explore.friendSuggestions'), href: '/sosyal-oneri',          description: t('nav.megaMenu.explore.friendSuggestionsDesc') },
                  { label: t('nav.megaMenu.explore.filmVsFilm'),        href: '/versus',               description: t('nav.megaMenu.explore.filmVsFilmDesc') },
                  { label: t('nav.megaMenu.explore.tournament'),        href: '/versus/turnuva',       description: t('nav.megaMenu.explore.tournamentDesc') },
                  { label: t('nav.megaMenu.explore.quiz'),              href: '/quiz',                 description: t('nav.megaMenu.explore.quizDesc') },
                  { label: t('nav.megaMenu.explore.sinezonType'),       href: '/sinezon-turum',        description: t('nav.megaMenu.explore.sinezonTypeDesc') },
                  { label: t('nav.megaMenu.explore.curatedLists'),      href: '/ozel-listeler',        description: t('nav.megaMenu.explore.curatedListsDesc') },
                  { label: t('nav.megaMenu.explore.cinemaUniverses'),   href: '/evren',                description: t('nav.megaMenu.explore.cinemaUniversesDesc') },
                  { label: t('nav.megaMenu.explore.addContent'),        href: '/katki',                description: t('nav.megaMenu.explore.addContentDesc') },
                  { label: t('nav.megaMenu.explore.releaseCalendar'),   href: '/yayin-takvimi',        description: t('nav.megaMenu.explore.releaseCalendarDesc') },
                  { label: t('nav.megaMenu.explore.mostAnticipated'),   href: '/en-beklenen',          description: t('nav.megaMenu.explore.mostAnticipatedDesc') },
                  { label: t('nav.megaMenu.explore.completeCollection'), href: '/koleksiyonlar',       description: t('nav.megaMenu.explore.completeCollectionDesc') },
                  { label: t('nav.megaMenu.explore.upcoming'),          href: '/yakinda',              description: t('nav.megaMenu.explore.upcomingDesc') },
                  { label: t('nav.megaMenu.explore.hiddenGems'),        href: '/kesfet',               description: t('nav.megaMenu.explore.hiddenGemsDesc') },
                  { label: t('nav.megaMenu.films.boxOffice'),           href: '/kutu-ofis',            description: t('nav.megaMenu.films.boxOfficeDesc') },
                  { label: t('nav.megaMenu.explore.quotes'),            href: '/alintilar',            description: t('nav.megaMenu.explore.quotesDesc') },
                  { label: t('nav.megaMenu.explore.leaderboard'),       href: '/liderlik',             description: t('nav.megaMenu.explore.leaderboardDesc') },
                  { label: t('nav.megaMenu.explore.aiRecommendation'),  href: '/oneri',                description: t('nav.megaMenu.explore.aiRecommendationDesc') },
                  { label: t('nav.megaMenu.explore.weeklyDigest'),      href: '/haftalik',             description: t('nav.megaMenu.explore.weeklyDigestDesc') },
                ]}
              />
              <Link href="/listeler" className="self-stretch flex items-center px-2.5 transition-colors text-[--text-secondary] hover:text-[--text-primary]">
                {t('nav.lists')}
              </Link>
              <Link href="/kisiler" className="self-stretch flex items-center px-2.5 transition-colors text-[--text-secondary] hover:text-[--text-primary]">
                {t('nav.people')}
              </Link>
            </div>
          </div>

          {/* CENTER: Search box — truly centered in 1fr column */}
          <div className="flex justify-center" ref={dropdownRef}>
            <div className="relative w-full max-w-[320px] lg:max-w-[400px] xl:max-w-[580px]">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary] pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowDropdown(true)
                      else handleSearchFocus()
                    }}
                    placeholder={t('nav.searchPlaceholder')}
                    className="w-full rounded-full rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </form>
              {suggestionDropdown}
              {historyDropdown}
            </div>
          </div>

          {/* RIGHT: Notification + Theme + Language + User */}
          <div className="flex items-center gap-2 shrink-0">
            {user?.id && <NotificationBell userId={user.id} />}
            <LanguageSwitcher />
            {user?.id ? (
              <UserDropdown user={{ id: user.id, email: user.email, username: user.username, is_admin: user.is_admin }} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/giris" className="text-[13px] text-[--text-secondary] hover:text-white transition-colors px-3 py-1.5">
                  {t('nav.login')}
                </Link>
                <Link href="/auth/kayit" className="text-[13px] font-medium bg-[--accent] hover:bg-[--accent-hover] text-white px-4 py-1.5 rounded-full transition-colors">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile row (< md) ── */}
        <div className="flex md:hidden h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Logo variant="icon" size="md" className="transition-transform duration-300 group-hover:scale-110" />
          </Link>

          <div className="flex items-center gap-1">
            {user?.id && <NotificationBell userId={user.id} />}
            <button
              className="p-2 text-[--text-secondary] hover:text-white transition-colors"
              onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMenuOpen(false) }}
              aria-label={t('nav.ariaSearch')}
            >
              {mobileSearchOpen ? <IconClose className="h-5 w-5" /> : <IconSearch className="h-5 w-5" />}
            </button>
            <button
              className="p-2 text-[--text-secondary] hover:text-white transition-colors"
              onClick={() => { setMenuOpen(!menuOpen); setMobileSearchOpen(false) }}
              aria-label={t('nav.ariaMenu')}
            >
              {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-[--border] bg-[--bg-primary] px-4 py-3">
          <div ref={dropdownRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary] pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full rounded-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent]" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </form>
            {showDropdown && suggestions.length > 0 && (
              <div className="mt-2 rounded-2xl border border-[--border] shadow-2xl overflow-hidden backdrop-blur-xl" style={{ background: 'rgba(11,15,25,0.97)' }}>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[--text-secondary]">{t('nav.searchResultsHeading')}</p>
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
                          item.type === 'film' ? 'bg-[--accent]/15 text-[--accent]' : 'bg-blue-500/15 text-blue-400'
                        }`}>
                          {item.type === 'film' ? t('nav.badgeFilm') : t('nav.badgeSeries')}
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
                  <span>{t('nav.allResultsFor', { query })}</span>
                  <IconChevronRight className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[--border] overflow-y-auto" style={{ background: 'var(--bg-secondary)', maxHeight: 'calc(100dvh - 128px)' }}>
          <div className="px-4 py-3 flex flex-col gap-0.5 text-sm">
            {/* Ana Menü */}
            <div className="grid grid-cols-2 gap-x-4">
              <Link href="/" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
              <Link href="/filmler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.films')}</Link>
              <Link href="/diziler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.series')}</Link>
              <Link href="/top10" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.top10Short')}</Link>
              <Link href="/en-cok-yorumlanan" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.popular')}</Link>
              <Link href="/ne-izlesem" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.whatToWatch')}</Link>
              <Link href="/listeler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.lists')}</Link>
              <Link href="/kisiler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.people')}</Link>
              <Link href="/forum" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.forum')}</Link>
            </div>

            {/* Filmler */}
            <div className="pt-3 pb-1 mt-1 border-t border-[--border]">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('nav.films')}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <Link href="/filmler?sirala=vote_average.desc" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.films.topRated')}</Link>
              <Link href="/filmler?sirala=release_date.desc" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.films.newest')}</Link>
              <Link href="/filmler?ozel=yerli-yapimlar" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.films.domestic')}</Link>
              <Link href="/filmler?ozel=oscar-kazananlar" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.films.oscarWinners')}</Link>
              <Link href="/filmler?ozel=kult-filmler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.films.cult')}</Link>
              <Link href="/yeni-gelenler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.newArrivalsMobile')}</Link>
            </div>

            {/* Diziler */}
            <div className="pt-3 pb-1 mt-1 border-t border-[--border]">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('nav.series')}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <Link href="/diziler?sirala=vote_average.desc" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.series.topRated')}</Link>
              <Link href="/diziler?sirala=first_air_date.desc" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.series.newest')}</Link>
              <Link href="/diziler?ozel=yerli-diziler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.series.domestic')}</Link>
              <Link href="/diziler?ozel=anime" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.series.anime')}</Link>
              <Link href="/diziler?ozel=polisiye" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.series.crime')}</Link>
            </div>

            {/* Keşfet */}
            <div className="pt-3 pb-1 mt-1 border-t border-[--border]">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('nav.explore')}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <Link href="/fragmanlar" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.trailers')}</Link>
              <Link href="/yayin-takvimi" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.releaseCalendar')}</Link>
              <Link href="/kutu-ofis" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.films.boxOffice')}</Link>
              <Link href="/haberler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.newsShort')}</Link>
              <Link href="/evren" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.cinemaUniverses')}</Link>
              <Link href="/versus" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.filmVsFilm')}</Link>
              <Link href="/sinema" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.worldCinema')}</Link>
              <Link href="/ruh-hali" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.moodAlt')}</Link>
              <Link href="/benzer-kullanicilar" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.similarUsers')}</Link>
              <Link href="/sosyal-oneri" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.friendSuggestions')}</Link>
              <Link href="/versus/turnuva" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.tournament')}</Link>
              <Link href="/quiz" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.quiz')}</Link>
              <Link href="/sinezon-turum" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.sinezonType')}</Link>
              <Link href="/ozel-listeler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.curatedLists')}</Link>
              <Link href="/katki" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.addContent')}</Link>
              <Link href="/en-beklenen" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.mostAnticipated')}</Link>
              <Link href="/koleksiyonlar" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.collectionsMobile')}</Link>
              <Link href="/yakinda" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.upcomingMobile')}</Link>
              <Link href="/kesfet" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.hiddenGems')}</Link>
              <Link href="/alintilar" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.quotes')}</Link>
              <Link href="/liderlik" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.leaderboard')}</Link>
              <Link href="/oneri" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.aiRecommendation')}</Link>
              <Link href="/haftalik" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.megaMenu.explore.weeklyDigest')}</Link>
            </div>

            {/* Authenticated section */}
            {user && (
              <>
                <div className="pt-3 pb-1 mt-1 border-t border-[--border]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('nav.accountHeading')}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  <Link href={`/profil/${user.username ?? ''}`} className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.myProfile')}</Link>
                  <Link href="/akis" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.feedShort')}</Link>
                  <Link href="/izleme-listem" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.myWatchlist')}</Link>
                  <Link href="/dizi-takip" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.seriesTracker')}</Link>
                  <Link href="/oneriler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.recommendationsShort')}</Link>
                  <Link href="/film-gecesi" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.movieNight')}</Link>
                  <Link href="/mesajlar" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.messages')}</Link>
                  <Link href="/bildirimler" className="py-2.5 text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.notifications')}</Link>
                </div>
              </>
            )}

            <div className="pt-3 mt-1 border-t border-[--border]">
              <LanguageSwitcher />
            </div>

            {!user ? (
              <div className="flex gap-2 pt-3 mt-1 border-t border-[--border]">
                <Link href="/auth/giris" className="flex-1 text-center py-2 border border-[--border] rounded-full text-[--text-secondary] hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
                <Link href="/auth/kayit" className="flex-1 text-center py-2 bg-[--accent] rounded-full text-white font-medium" onClick={() => setMenuOpen(false)}>{t('nav.register')}</Link>
              </div>
            ) : (
              <div className="pt-3 mt-1 border-t border-[--border]">
                <form action="/auth/signout" method="post">
                  <button type="submit" className="py-2 text-[--accent] hover:text-white text-sm font-medium transition-colors">
                    {t('nav.logout')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
