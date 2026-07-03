'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

export default function KeyboardShortcuts({ username }: { username?: string }) {
  const { t } = useLocale()
  const router = useRouter()
  const [showHelp, setShowHelp] = useState(false)

  const SHORTCUTS = [
    { key: '/', desc: t('keyboardShortcuts.items.search') },
    { key: 'g h', desc: t('keyboardShortcuts.items.goHome') },
    { key: 'g f', desc: t('keyboardShortcuts.items.goFilms') },
    { key: 'g d', desc: t('keyboardShortcuts.items.goSeries') },
    { key: 'g p', desc: t('keyboardShortcuts.items.goProfile') },
    { key: 'g l', desc: t('keyboardShortcuts.items.watchlist') },
    { key: '?', desc: t('keyboardShortcuts.items.toggleHelp') },
    { key: 'Esc', desc: t('keyboardShortcuts.items.close') },
  ]
  const [pendingG, setPendingG] = useState(false)

  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable
    if (isInput && e.key !== 'Escape') return

    if (e.key === 'Escape') {
      setShowHelp(false)
      setPendingG(false)
      return
    }

    if (e.key === '?' && !isInput) {
      setShowHelp(v => !v)
      return
    }

    if (e.key === '/' && !isInput) {
      e.preventDefault()
      const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="ara"]')
      searchInput?.focus()
      return
    }

    if (pendingG) {
      setPendingG(false)
      switch (e.key) {
        case 'h': router.push('/'); break
        case 'f': router.push('/filmler'); break
        case 'd': router.push('/diziler'); break
        case 'p': if (username) router.push(`/profil/${username}`); break
        case 'l': router.push('/izleme-listem'); break
      }
      return
    }

    if (e.key === 'g' && !isInput) {
      setPendingG(true)
      setTimeout(() => setPendingG(false), 1500)
    }
  }, [pendingG, router, username])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!showHelp) return (
    pendingG ? (
      <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-mono text-white"
        style={{ background: 'rgba(14,20,32,0.95)', border: '1px solid rgba(255,255,255,0.15)' }}>
        g + <span style={{ color: 'var(--accent)' }}>h</span> {t('keyboardShortcuts.hint.home')} · <span style={{ color: 'var(--accent)' }}>f</span> {t('keyboardShortcuts.hint.films')} · <span style={{ color: 'var(--accent)' }}>d</span> {t('keyboardShortcuts.hint.series')} · <span style={{ color: 'var(--accent)' }}>p</span> {t('keyboardShortcuts.hint.profile')}
      </div>
    ) : null
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={() => setShowHelp(false)}>
      <div className="w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.98), rgba(14,20,32,0.99))', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{t('keyboardShortcuts.title')}</h2>
          <button onClick={() => setShowHelp(false)} className="text-white/40 hover:text-white text-xl transition-colors">×</button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-4 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {t('keyboardShortcuts.footerPrefix')} <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>?</kbd> {t('keyboardShortcuts.footerSuffix')}
        </p>
      </div>
    </div>
  )
}
