import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import {
  IconShield,
  IconLayoutDashboard,
  IconUsers,
  IconMessageSquare,
  IconAlertTriangle,
  IconStar,
  IconList,
  IconEyeOff,
  IconClock,
} from '@/components/icons'

const NAV = [
  { href: '/admin',              label: 'Dashboard',    icon: IconLayoutDashboard },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: IconUsers },
  { href: '/admin/yorumlar',     label: 'Yorumlar',     icon: IconMessageSquare },
  { href: '/admin/moderasyon',   label: 'Moderasyon',   icon: IconEyeOff },
  { href: '/admin/alintilar',    label: 'Alıntılar',    icon: IconMessageSquare },
  { href: '/admin/raporlar',     label: 'Raporlar',     icon: IconAlertTriangle },
  { href: '/admin/ozel-secim',   label: 'Özel Seçim',   icon: IconStar },
  { href: '/admin/listeler',     label: 'Listeler',     icon: IconList },
  { href: '/admin/trivia',       label: 'Trivia',       icon: IconMessageSquare },
  { href: '/admin/loglar',       label: 'Loglar',       icon: IconClock },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[--border] bg-[--bg-secondary] p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <IconShield className="h-5 w-5 text-[--accent]" />
          <span className="font-bold text-white text-sm">Admin Panel</span>
        </div>
        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[--text-secondary] hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* İçerik */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
