'use client'

import { useLocale } from '@/context/LocaleContext'

interface GenreData { genre: string; count: number; avgRating: number }

interface Props {
  genreData: GenreData[]
}

export default function ZevkDNA({ genreData }: Props) {
  const { t } = useLocale()
  if (!genreData.length) return null
  const maxCount = Math.max(...genreData.map(g => g.count))

  return (
    <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-base font-bold text-white mb-1">🧬 {t('zevkDna.title')}</h3>
      <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('zevkDna.subtitle')}</p>
      <div className="space-y-3">
        {genreData.slice(0, 10).map(g => (
          <div key={g.genre} className="flex items-center gap-3">
            <span className="text-xs w-28 shrink-0 text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>{g.genre}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(g.count / maxCount) * 100}%`, background: `linear-gradient(90deg, #E11D48, #be123c)` }} />
            </div>
            <span className="text-[10px] w-8 text-right tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{g.count}</span>
            <span className="text-[10px] w-8 text-right tabular-nums" style={{ color: '#D4A843' }}>★{g.avgRating.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
