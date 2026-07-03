'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { IconFilm, IconMasks } from '@/components/icons'

interface Props {
  username: string
}

interface AffiniteData {
  score: number
  shared: number
  myTotal: number
  theirTotal: number
  label: string
  message?: string
}

const LABEL_COLORS: Record<string, string> = {
  'Sinema İkizi': '#a78bfa',
  'Uyumlu': '#4ade80',
  'Farklı Zevkler': '#fbbf24',
  'Zıt Kutuplar': '#f87171',
}

export default function AffiniteSkoru({ username }: Props) {
  const { t } = useLocale()
  const [data, setData] = useState<AffiniteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/affinite?username=${encodeURIComponent(username)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [username])

  if (loading) return (
    <div className="rounded-xl px-4 py-3 flex items-center gap-2 animate-pulse"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="flex-1">
        <div className="h-2.5 w-24 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-1.5 w-16 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )

  if (!data || data.shared === 0) return (
    <div className="rounded-xl px-4 py-3 text-xs"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
      <span className="inline-flex items-center gap-1.5"><IconFilm size={14} />{t('affiniteSkoru.noShared')}</span>
    </div>
  )

  const color = LABEL_COLORS[data.label] ?? '#fff'
  const pct = Math.min(100, data.score)

  return (
    <div className="rounded-xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconMasks size={16} />
          <div>
            <p className="text-xs font-semibold text-white">{t('affiniteSkoru.title')}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {t('affiniteSkoru.sharedCount', { count: data.shared })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black" style={{ color }}>%{pct}</p>
          <p className="text-[10px] font-semibold" style={{ color }}>{data.label}</p>
        </div>
      </div>

      {/* Bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  )
}
