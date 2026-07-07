'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconFilm, IconSearch, IconBell, IconUser } from '@/components/icons'
import { useLocale } from '@/context/LocaleContext'

interface BottomNavProps {
  user?: { id?: string; email?: string; username?: string; is_admin?: boolean } | null
}

export default function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname()
  const { t } = useLocale()

  const profileHref   = user?.username ? `/profil/${user.username}` : '/auth/giris'
  const profileActive = pathname.startsWith('/profil')

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const tabs = [
    { href: '/',              label: t('nav.home'),         Icon: IconHome },
    { href: '/filmler',       label: t('nav.explore'),      Icon: IconFilm },
    { href: '/arama',         label: t('nav.ariaSearch'),   Icon: IconSearch },
    { href: '/bildirimler',   label: t('nav.notifications'), Icon: IconBell },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(8,10,16,0.99)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -1px 0 rgba(212,168,67,0.1), 0 -12px 40px rgba(0,0,0,0.7)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <div className="flex items-center h-16">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative">
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #D4A843, #E11D48)' }} />
              )}
              <Icon className="h-[22px] w-[22px] transition-all duration-200"
                style={{ color: active ? 'var(--accent)' : 'rgba(255,255,255,0.55)' }} />
              <span className="text-[9.5px] font-bold tracking-wide transition-all duration-200"
                style={{ color: active ? 'rgba(225,29,72,0.9)' : 'rgba(255,255,255,0.45)' }}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* Profil */}
        <Link href={profileHref}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative">
          {profileActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
              style={{ background: 'linear-gradient(90deg, #D4A843, #E11D48)' }} />
          )}
          {user?.username ? (
            <div className="h-[22px] w-[22px] rounded-full flex items-center justify-center text-[9px] font-black text-white transition-all duration-200"
              style={{
                background: profileActive ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
                boxShadow: profileActive ? '0 0 10px rgba(225,29,72,0.5)' : 'none',
              }}>
              {user.username[0].toUpperCase()}
            </div>
          ) : (
            <IconUser className="h-[22px] w-[22px]"
              style={{ color: profileActive ? 'var(--accent)' : 'rgba(255,255,255,0.55)' }} />
          )}
          <span className="text-[9.5px] font-bold tracking-wide transition-all duration-200"
            style={{ color: profileActive ? 'rgba(225,29,72,0.9)' : 'rgba(255,255,255,0.45)' }}>
            {t('nav.profileShort')}
          </span>
        </Link>
      </div>
    </nav>
  )
}
