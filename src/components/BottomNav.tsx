'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconFilm, IconSearch, IconList, IconUser } from '@/components/icons'

interface BottomNavProps {
  user?: { id?: string; email?: string; username?: string; is_admin?: boolean } | null
}

export default function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname()

  const profileHref   = user?.username ? `/profil/${user.username}` : '/auth/giris'
  const profileActive = pathname.startsWith('/profil')

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const tabs = [
    { href: '/',         label: 'Ana Sayfa', Icon: IconHome },
    { href: '/filmler',  label: 'Keşfet',    Icon: IconFilm },
    { href: '/arama',    label: 'Arama',     Icon: IconSearch },
    { href: '/listeler', label: 'Listeler',  Icon: IconList },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(8, 10, 15, 0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center h-14">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-all duration-200"
            >
              <div
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200"
                style={
                  active
                    ? { background: 'rgba(225,29,72,0.18)', color: 'var(--accent)' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                <Icon className="h-5 w-5" />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {label}
                </span>
              </div>
            </Link>
          )
        })}

        {/* Profil */}
        <Link
          href={profileHref}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
        >
          <div
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200"
            style={
              profileActive
                ? { background: 'rgba(225,29,72,0.18)', color: 'var(--accent)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {user?.username ? (
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                style={{
                  background: profileActive
                    ? 'var(--accent)'
                    : 'linear-gradient(135deg, var(--accent), #7F0D2E)',
                  boxShadow: profileActive ? '0 0 8px rgba(225,29,72,0.5)' : 'none',
                }}
              >
                {user.username[0].toUpperCase()}
              </div>
            ) : (
              <IconUser className="h-5 w-5" />
            )}
            <span
              className="text-[10px] font-semibold"
              style={{ color: profileActive ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              Profil
            </span>
          </div>
        </Link>
      </div>
    </nav>
  )
}
