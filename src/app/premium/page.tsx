import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import {
  IconFilm, IconClipboard, IconUsers, IconRobot, IconFolder, IconMedal, IconBookOpen, IconBell,
  IconSwords, IconPuzzle, IconBarChart, IconMessageSquare, IconCheck, IconGift, IconCoffee,
} from '@/components/icons'

export const metadata: Metadata = {
  title: 'Sinezon — Tüm Özellikler',
  description: 'Sinezon\'daki tüm özellikler sonsuza kadar ücretsizdir.',
}

const FEATURE_KEYS = [
  { icon: IconFilm, key: 'unlimitedReviews' },
  { icon: IconClipboard, key: 'watchlist' },
  { icon: IconUsers, key: 'friends' },
  { icon: IconRobot, key: 'aiRecommendations' },
  { icon: IconFolder, key: 'customLists' },
  { icon: IconMedal, key: 'badges' },
  { icon: IconBookOpen, key: 'diary' },
  { icon: IconBell, key: 'push' },
  { icon: IconSwords, key: 'filmVs' },
  { icon: IconPuzzle, key: 'quiz' },
  { icon: IconBarChart, key: 'stats' },
  { icon: IconMessageSquare, key: 'forum' },
]

export default async function PremiumPage() {
  const { t } = await getTranslations()
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
          <IconCheck size={13} /> {t('premium.freeBadge')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
          {t('premium.heroLine1')}<br />
          <span style={{ color: 'var(--accent)' }}>{t('premium.heroLine2')}</span>
        </h1>
        <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('premium.heroSubtitle')}
        </p>
      </div>

      {/* Özellikler Grid */}
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {FEATURE_KEYS.map(f => (
          <div key={f.key}
            className="flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <f.icon size={26} strokeWidth={1.5} className="shrink-0 text-[--accent]" />
            <div>
              <p className="text-sm font-semibold text-white">{t(`premium.features.${f.key}.label`)}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{t(`premium.features.${f.key}.desc`)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Destek / Ko-fi */}
      <div className="text-center rounded-3xl p-8"
        style={{ background: 'linear-gradient(160deg, rgba(255,216,77,0.06), rgba(14,20,32,0.95))', border: '1px solid rgba(255,216,77,0.15)' }}>
        <IconCoffee size={40} strokeWidth={1.5} className="mb-3 mx-auto text-[#FF5E5B]" />
        <p className="text-xl font-black text-white mb-2">{t('premium.supportTitle')}</p>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {t('premium.supportDesc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://ko-fi.com/sinezon" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF5E5B, #ff4040)', boxShadow: '0 4px 20px rgba(255,94,91,0.3)' }}>
            <IconCoffee size={16} /> {t('premium.kofiButton')}
          </a>
          <a href="https://www.patreon.com/sinezon" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 inline-flex items-center gap-2"
            style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c' }}>
            <IconGift size={16} /> {t('premium.patreonButton')}
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center rounded-3xl p-8"
        style={{ background: 'linear-gradient(160deg, rgba(225,29,72,0.08), rgba(14,20,32,0.95))', border: '1px solid rgba(225,29,72,0.15)' }}>
        <p className="text-xl font-black text-white mb-2">{t('premium.ctaTitle')}</p>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('premium.ctaDesc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/kayit"
            className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 20px rgba(225,29,72,0.3)' }}>
            {t('premium.ctaSignup')}
          </Link>
          <Link href="/filmler"
            className="px-8 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            {t('premium.ctaBrowse')}
          </Link>
        </div>
      </div>
    </div>
  )
}
