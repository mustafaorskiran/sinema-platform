'use client'
import { useState, type ComponentType } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/LocaleContext'
import {
  IconMasks, IconCry, IconZap, IconSearch, IconLaugh, IconPalette, IconFilm, IconPopcorn,
} from '@/components/icons'

const QUESTIONS = [
  {
    qKey: 'sinezonTurum.q1',
    options: [
      { labelKey: 'sinezonTurum.q1o1', types: ['drama', 'sinefil'] },
      { labelKey: 'sinezonTurum.q1o2', types: ['aksiyon', 'thriller'] },
      { labelKey: 'sinezonTurum.q1o3', types: ['komedi', 'genel'] },
      { labelKey: 'sinezonTurum.q1o4', types: ['sinefil', 'arthouse'] },
    ]
  },
  {
    qKey: 'sinezonTurum.q2',
    options: [
      { labelKey: 'sinezonTurum.q2o1', types: ['aksiyon', 'genel'] },
      { labelKey: 'sinezonTurum.q2o2', types: ['nostalji', 'drama'] },
      { labelKey: 'sinezonTurum.q2o3', types: ['sinefil', 'arthouse'] },
      { labelKey: 'sinezonTurum.q2o4', types: ['genel', 'drama'] },
    ]
  },
  {
    qKey: 'sinezonTurum.q3',
    options: [
      { labelKey: 'sinezonTurum.q3o1', types: ['sinefil', 'arthouse'] },
      { labelKey: 'sinezonTurum.q3o2', types: ['drama', 'komedi'] },
      { labelKey: 'sinezonTurum.q3o3', types: ['aksiyon', 'genel'] },
      { labelKey: 'sinezonTurum.q3o4', types: ['nostalji', 'genel'] },
    ]
  },
  {
    qKey: 'sinezonTurum.q4',
    options: [
      { labelKey: 'sinezonTurum.q4o1', types: ['drama', 'sinefil'] },
      { labelKey: 'sinezonTurum.q4o2', types: ['aksiyon'] },
      { labelKey: 'sinezonTurum.q4o3', types: ['thriller', 'sinefil'] },
      { labelKey: 'sinezonTurum.q4o4', types: ['komedi', 'arthouse'] },
    ]
  },
  {
    qKey: 'sinezonTurum.q5',
    options: [
      { labelKey: 'sinezonTurum.q5o1', types: ['sinefil', 'arthouse'] },
      { labelKey: 'sinezonTurum.q5o2', types: ['drama', 'nostalji'] },
      { labelKey: 'sinezonTurum.q5o3', types: ['aksiyon', 'genel'] },
      { labelKey: 'sinezonTurum.q5o4', types: ['genel', 'komedi'] },
    ]
  },
]

const TYPE_DESCRIPTIONS: Record<string, { icon: ComponentType<{ size?: number; className?: string }>; nameKey: string; descKey: string; color: string }> = {
  'sinefil':  { icon: IconMasks,   nameKey: 'sinezonTurum.typeSinefilName',  descKey: 'sinezonTurum.typeSinefilDesc',  color: '#a78bfa' },
  'drama':    { icon: IconCry,     nameKey: 'sinezonTurum.typeDramaName',    descKey: 'sinezonTurum.typeDramaDesc',    color: '#60a5fa' },
  'aksiyon':  { icon: IconZap,     nameKey: 'sinezonTurum.typeAksiyonName',  descKey: 'sinezonTurum.typeAksiyonDesc',  color: '#f87171' },
  'thriller': { icon: IconSearch,  nameKey: 'sinezonTurum.typeThrillerName', descKey: 'sinezonTurum.typeThrillerDesc', color: '#34d399' },
  'komedi':   { icon: IconLaugh,   nameKey: 'sinezonTurum.typeKomediName',   descKey: 'sinezonTurum.typeKomediDesc',   color: '#fbbf24' },
  'arthouse': { icon: IconPalette, nameKey: 'sinezonTurum.typeArthouseName', descKey: 'sinezonTurum.typeArthouseDesc', color: '#f472b6' },
  'nostalji': { icon: IconFilm,    nameKey: 'sinezonTurum.typeNostaljiName', descKey: 'sinezonTurum.typeNostaljiDesc', color: '#D4A843' },
  'genel':    { icon: IconPopcorn, nameKey: 'sinezonTurum.typeGenelName',    descKey: 'sinezonTurum.typeGenelDesc',    color: '#94a3b8' },
}

export default function SinezonTurumPage() {
  const { t } = useLocale()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<string[][]>([])
  const [result, setResult] = useState<string | null>(null)

  function answer(types: string[]) {
    const newAnswers = [...answers, types]
    if (current + 1 >= QUESTIONS.length) {
      // Sonuç hesapla
      const freq: Record<string, number> = {}
      for (const a of newAnswers) for (const type of a) freq[type] = (freq[type] ?? 0) + 1
      const winner = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
      setResult(winner)
    } else {
      setAnswers(newAnswers)
      setCurrent(current + 1)
    }
  }

  function reset() { setCurrent(0); setAnswers([]); setResult(null) }

  const q = QUESTIONS[current]
  const info = result ? TYPE_DESCRIPTIONS[result] ?? TYPE_DESCRIPTIONS['genel'] : null

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{t('sinezonTurum.title')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('sinezonTurum.subtitle')}</p>
      </div>

      {result && info ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: `1px solid ${info.color}33` }}>
          <div className="mb-4 flex justify-center" style={{ color: info.color }}><info.icon size={48} /></div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: info.color }}>{t(info.nameKey)}</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>{t(info.descKey)}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={reset}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              {t('sinezonTurum.retry')}
            </button>
            <Link href="/filmler"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#E11D48,#be123c)', boxShadow: '0 4px 14px rgba(225,29,72,0.25)' }}>
              {t('sinezonTurum.exploreFilms')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                style={{ background: i <= current ? '#E11D48' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <p className="text-xs mb-3 font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {t('sinezonTurum.progress', { current: current + 1, total: QUESTIONS.length })}
          </p>
          <h2 className="text-lg font-bold text-white mb-5">{t(q.qKey)}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => answer(opt.types)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] hover:border-[--accent]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
