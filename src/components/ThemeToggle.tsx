'use client'

import { useEffect, useState } from 'react'
import { IconSun, IconMoon } from '@/components/icons'
import { useLocale } from '@/context/LocaleContext'

export default function ThemeToggle() {
  const { t } = useLocale()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const current = document.documentElement.classList.contains('light') ? 'light' : 'dark'
    setTheme(current)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.cookie = `theme=${next};path=/;max-age=31536000;SameSite=Lax`
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(next)
  }

  if (!mounted) return <div className="h-9 w-9" />

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
      className="p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-white/5 transition-colors"
    >
      {theme === 'dark'
        ? <IconSun className="h-5 w-5" />
        : <IconMoon className="h-5 w-5" />
      }
    </button>
  )
}
