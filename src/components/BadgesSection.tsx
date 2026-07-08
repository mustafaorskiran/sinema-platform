'use client'

import { useState } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { computeBadges, ALL_BADGE_COUNT, type BadgeStats } from '@/lib/badges'
import { IconMedal, IconLock, IconPin } from '@/components/icons'

interface Props {
  stats: BadgeStats
  initialPinned: string[]
  isOwnProfile: boolean
}

const MAX_PINNED = 3

export default function BadgesSection({ stats, initialPinned, isOwnProfile }: Props) {
  const { t } = useLocale()
  const [pinned, setPinned] = useState<string[]>(initialPinned)
  const [saving, setSaving] = useState(false)

  const badges = computeBadges(stats, t)
  const earned = badges.filter(b => b.earned)
  const unearned = badges.filter(b => !b.earned)
  const pct = Math.round((earned.length / ALL_BADGE_COUNT) * 100)

  async function togglePin(id: string) {
    if (saving) return
    const next = pinned.includes(id)
      ? pinned.filter(p => p !== id)
      : pinned.length >= MAX_PINNED ? pinned : [...pinned, id]
    if (next === pinned) return
    setPinned(next)
    setSaving(true)
    try {
      await fetch('/api/pinned-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badges: next }),
      })
    } finally {
      setSaving(false)
    }
  }

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <>
      {/* İlerleme barı */}
      <div className="mb-8 p-5 rounded-2xl" style={card}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">{t('profile.badgesTab.overallProgress')}</span>
          <span className="text-sm font-bold" style={{ color: '#D4A843' }}>{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(90deg, #D4A843, #F0C060)'
                : 'linear-gradient(90deg, #E11D48, #be123c)',
            }} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t('profile.badgesTab.remaining', { count: ALL_BADGE_COUNT - earned.length })}
        </p>
      </div>

      {isOwnProfile && earned.length > 0 && (
        <p className="text-xs mb-4 -mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('profile.badgesTab.pinHint', { max: MAX_PINNED })}
        </p>
      )}

      {/* Kazanılan Rozetler */}
      {earned.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <IconMedal size={18} className="text-[--gold]" /> {t('profile.badgesTab.earnedBadges')}
            <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>({earned.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map(b => {
              const isPinned = pinned.includes(b.id)
              return (
                <div key={b.id} className="relative flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.2)' }}>
                  <b.icon size={26} strokeWidth={1.5} className="shrink-0 text-[--gold]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                    <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>{b.desc}</p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => togglePin(b.id)}
                      title={isPinned ? t('profile.badgesTab.unpin') : t('profile.badgesTab.pin')}
                      disabled={!isPinned && pinned.length >= MAX_PINNED}
                      className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                      style={isPinned
                        ? { background: 'var(--accent)', color: '#fff' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                      }
                    >
                      <IconPin size={13} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Kazanılmayan Rozetler */}
      {unearned.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <IconLock size={16} /> {t('profile.badgesTab.lockedBadges')}
            <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>({unearned.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unearned.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl opacity-50"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <b.icon size={26} strokeWidth={1.5} className="shrink-0 opacity-60" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                  <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
