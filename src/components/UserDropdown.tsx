'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconChevronDown, IconShield } from '@/components/icons'
import { useLocale } from '@/context/LocaleContext'

interface Props {
  user: {
    id: string
    email?: string
    username?: string
    is_admin?: boolean
  }
}

export default function UserDropdown({ user }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { t } = useLocale()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initial = (user.username || user.email || 'U')[0].toUpperCase()
  const displayName = user.username ?? user.email?.split('@')[0] ?? t('nav.userFallback')

  return (
    <div ref={ref} className="relative" style={{ overflow: 'visible' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 group"
        aria-label={t('nav.userMenuAria')}
      >
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-200 group-hover:ring-2 group-hover:ring-[--accent]/40"
          style={{ background: 'var(--accent)' }}
        >
          {initial}
        </div>
        <span
          className="hidden lg:block text-[13px] font-medium max-w-[80px] truncate transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.color = 'var(--text-secondary)' }}
        >
          {displayName}
        </span>
        <IconChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className="absolute right-0 z-[200]"
        style={{
          top: '100%',
          paddingTop: '8px',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
          transition: 'opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: open ? 'auto' : 'none',
          minWidth: '220px',
        }}
      >
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.97)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)',
            borderRadius: '14px',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'min(520px, calc(100vh - 90px))',
            overflow: 'hidden',
          }}
        >
          {/* Kullanıcı başlık — sabit */}
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
            {user.email && (
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </p>
            )}
          </div>

          {/* Linkler — kaydırılabilir alan */}
          <div className="py-1.5 overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            <DropLink href={`/profil/${user.username ?? ''}`} label={t('nav.myProfile')} />
            <DropLink href="/izleme-listem" label={t('nav.myList')} />
            <DropLink href="/mesajlar" label={t('nav.messages')} />
            <DropLink href="/akis" label={t('nav.feedShort')} />
            <DropLink href="/oneriler" label={t('nav.recommendationsShort')} />
            <DropLink href="/oneri" label={t('nav.aiRecommendationShort')} />
            <DropLink href="/film-gecesi" label={t('nav.movieNight')} />
            <DropLink href="/quiz" label={t('nav.filmQuiz')} />
            <DropLink href="/versus/turnuva" label={t('nav.tournamentShort')} />
            <DropLink href="/gorevler" label={t('nav.dailyTasks')} />
            <DropLink href="/meydan-okumalar" label={t('nav.challenges')} />
            <DropLink href="/sinezon-turum" label={t('nav.megaMenu.explore.sinezonType')} />
            <DropLink href="/import" label={t('nav.importData')} />
            <DropLink href="/katki" label={t('nav.megaMenu.explore.addContent')} />

            <div className="my-1.5 mx-3" style={{ borderTop: '1px solid var(--border)' }} />

            <DropLink href="/profil/duzenle" label={t('nav.settings')} />

            {user.is_admin && (
              <DropLink
                href="/admin"
                label={t('nav.adminPanelLink')}
                icon={<IconShield className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />}
                accent
              />
            )}
          </div>

          {/* Çıkış — her zaman altta sabit */}
          <div className="shrink-0 px-2 pb-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 hover:bg-red-500/10 text-left"
                style={{ color: 'var(--accent)' }}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('nav.logout')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function DropLink({
  href,
  label,
  icon,
  accent = false,
}: {
  href: string
  label: string
  icon?: React.ReactNode
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-all duration-150 hover:bg-white/[.06] hover:text-[--text-primary]"
      style={{ color: accent ? 'var(--accent)' : 'var(--text-secondary)' }}
    >
      {icon}
      {label}
    </Link>
  )
}
