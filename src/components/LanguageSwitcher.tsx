'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALES, type Locale } from '@/lib/i18n-config'
import { useLocale } from '@/context/LocaleContext'
import { IconChevronDown } from '@/components/icons'
import { FlagIcon } from '@/components/icons/flags'

export default function LanguageSwitcher() {
  const { locale } = useLocale()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  function switchLocale(code: Locale) {
    document.cookie = `locale=${code};path=/;max-age=31536000;SameSite=Lax`
    setOpen(false)
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    // self-stretch: navbar yüksekliğine yayılır, top-full = navbar altı
    <div className="relative self-stretch flex items-center">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-[--text-secondary] hover:text-[--text-primary]"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
        aria-label="Language / Dil"
      >
        <FlagIcon code={current.code} size={18} className="shrink-0" />
        <span className="hidden lg:inline text-xs">{current.name}</span>
        <IconChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 z-[200] w-44 rounded-xl overflow-hidden py-1"
            style={{
              top: '100%',
              marginTop: '4px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
            }}
          >
            {LOCALES.map(lang => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors ${
                  lang.code === locale
                    ? 'font-medium'
                    : 'hover:bg-white/[.05] hover:text-[--text-primary]'
                }`}
                style={{
                  color: lang.code === locale ? 'var(--accent)' : 'var(--text-secondary)',
                  background: lang.code === locale ? 'rgba(225,29,72,0.08)' : undefined,
                }}
              >
                <FlagIcon code={lang.code} size={20} className="shrink-0" />
                <span>{lang.name}</span>
                {lang.code === locale && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
