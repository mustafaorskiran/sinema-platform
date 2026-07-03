import Link from 'next/link'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ruh Haline Göre Film | Sinezon',
  description: 'Bugün nasıl hissediyorsun? Ruh haline göre film ve dizi önerisi al.',
}

const MOODS = [
  {
    id: 'mutlu',
    emoji: '😄',
    labelKey: 'mood.items.mutlu.label',
    descKey: 'mood.items.mutlu.desc',
    color: '#facc15',
    bg: 'rgba(250,204,21,0.08)',
    border: 'rgba(250,204,21,0.2)',
    filmParams: 'genre=35&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=35&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'heyecan',
    emoji: '⚡',
    labelKey: 'mood.items.heyecan.label',
    descKey: 'mood.items.heyecan.desc',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.2)',
    filmParams: 'genre=28&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=10759&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'dusunceli',
    emoji: '🤔',
    labelKey: 'mood.items.dusunceli.label',
    descKey: 'mood.items.dusunceli.desc',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
    filmParams: 'genre=18&sirala=vote_average.desc&min_puan=8',
    diziParams: 'genre=18&sirala=vote_average.desc&min_puan=8',
  },
  {
    id: 'romantik',
    emoji: '💕',
    labelKey: 'mood.items.romantik.label',
    descKey: 'mood.items.romantik.desc',
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.08)',
    border: 'rgba(251,113,133,0.2)',
    filmParams: 'genre=10749&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=10766&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'korku',
    emoji: '👻',
    labelKey: 'mood.items.korku.label',
    descKey: 'mood.items.korku.desc',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.07)',
    border: 'rgba(74,222,128,0.18)',
    filmParams: 'genre=27&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=27&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'macera',
    emoji: '🗺️',
    labelKey: 'mood.items.macera.label',
    descKey: 'mood.items.macera.desc',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
    filmParams: 'genre=12&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=10759&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'belgesel',
    emoji: '🎙️',
    labelKey: 'mood.items.belgesel.label',
    descKey: 'mood.items.belgesel.desc',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.2)',
    filmParams: 'genre=99&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=99&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'aile',
    emoji: '👨‍👩‍👧',
    labelKey: 'mood.items.aile.label',
    descKey: 'mood.items.aile.desc',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.07)',
    border: 'rgba(52,211,153,0.18)',
    filmParams: 'genre=10751&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=10762&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'gece',
    emoji: '🌙',
    labelKey: 'mood.items.gece.label',
    descKey: 'mood.items.gece.desc',
    color: '#c4b5fd',
    bg: 'rgba(196,181,253,0.07)',
    border: 'rgba(196,181,253,0.18)',
    filmParams: 'genre=53&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=80&sirala=vote_average.desc&min_puan=7',
  },
  {
    id: 'scifi',
    emoji: '🚀',
    labelKey: 'mood.items.scifi.label',
    descKey: 'mood.items.scifi.desc',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.07)',
    border: 'rgba(56,189,248,0.18)',
    filmParams: 'genre=878&sirala=vote_average.desc&min_puan=7',
    diziParams: 'genre=10765&sirala=vote_average.desc&min_puan=7',
  },
]

export default async function MoodPage() {
  const { t } = await getTranslations()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5 text-3xl"
          style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)' }}>
          🎭
        </div>
        <h1 className="text-3xl font-black text-white mb-2">{t('mood.pageTitle')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('mood.pageSubtitle')}
        </p>
      </div>

      {/* Mood Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOODS.map(mood => (
          <div key={mood.id} className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: mood.bg, border: `1px solid ${mood.border}` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{mood.emoji}</span>
              <div>
                <p className="font-bold text-white text-sm">{t(mood.labelKey)}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t(mood.descKey)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/filmler?${mood.filmParams}`}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80"
                style={{ background: mood.color, color: '#000' }}>
                🎬 {t('genre.film')}
              </Link>
              <Link href={`/diziler?${mood.diziParams}`}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.08)', color: mood.color, border: `1px solid ${mood.border}` }}>
                📺 {t('genre.dizi')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Alt linkler */}
      <div className="text-center mt-10">
        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t('mood.moreOptions')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/ne-izlesem"
            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
            🎲 {t('mood.leaveToLuck')}
          </Link>
          <Link href="/oneri"
            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
            🤖 {t('mood.getAiSuggestion')}
          </Link>
        </div>
      </div>
    </div>
  )
}
