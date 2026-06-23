'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconChevronDown, IconShield } from '@/components/icons'

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

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initial = (user.username || user.email || 'U')[0].toUpperCase()
  const displayName = user.username ?? user.email?.split('@')[0] ?? 'Kullanıcı'

  return (
    <div ref={ref} className="relative" style={{ overflow: 'visible' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 group"
        aria-label="Kullanıcı menüsü"
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
            overflow: 'hidden',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {/* Kullanıcı başlık */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
            {user.email && (
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </p>
            )}
          </div>

          {/* Linkler */}
          <div className="py-1.5">
            <DropLink href={`/profil/${user.username ?? ''}`} label="Profilim" />
            <DropLink href="/izleme-listem" label="Listem" />
            <DropLink href="/mesajlar" label="Mesajlar" />
            <DropLink href="/akis" label="Akış" />
            <DropLink href="/oneriler" label="Öneriler" />
            <DropLink href="/film-gecesi" label="Film Gecesi" />

            <div className="my-1.5 mx-3" style={{ borderTop: '1px solid var(--border)' }} />

            <DropLink href="/profil/duzenle" label="Ayarlar" />

            {user.is_admin && (
              <DropLink
                href="/admin"
                label="Admin Paneli"
                icon={<IconShield className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />}
                accent
              />
            )}

            <div className="my-1.5 mx-3" style={{ borderTop: '1px solid var(--border)' }} />
          </div>

          {/* Çıkış */}
          <form action="/auth/signout" method="post" className="px-2 pb-2">
            <button
              type="submit"
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 hover:bg-white/[.06] text-left"
              style={{ color: 'var(--accent)' }}
            >
              Çıkış Yap
            </button>
          </form>
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
