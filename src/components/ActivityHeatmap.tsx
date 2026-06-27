'use client'

import { useMemo, useState } from 'react'

interface Props {
  entries: { date: string }[] // watched_at veya created_at
}

function getLastNWeeks(n: number) {
  const weeks: { key: string; days: { key: string; label: string }[] }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Pazar gününe hizala
  const dayOfWeek = today.getDay()
  const startOfThisWeek = new Date(today)
  startOfThisWeek.setDate(today.getDate() - dayOfWeek)

  for (let w = n - 1; w >= 0; w--) {
    const weekStart = new Date(startOfThisWeek)
    weekStart.setDate(startOfThisWeek.getDate() - w * 7)
    const weekKey = weekStart.toISOString().slice(0, 10)
    const days = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + d)
      const key = day.toISOString().slice(0, 10)
      const label = day.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
      days.push({ key, label })
    }
    weeks.push({ key: weekKey, days })
  }
  return weeks
}

const LEVEL_COLORS = [
  'bg-[--bg-secondary]',
  'bg-[--accent]/30',
  'bg-[--accent]/55',
  'bg-[--accent]/80',
  'bg-[--accent]',
]

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const DAY_LABELS = ['Paz', '', 'Sal', '', 'Per', '', 'Cmt']

export default function ActivityHeatmap({ entries }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const weeks = useMemo(() => getLastNWeeks(52), [])

  const countMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of entries) {
      const key = e.date.slice(0, 10)
      map[key] = (map[key] ?? 0) + 1
    }
    return map
  }, [entries])

  const maxCount = useMemo(() => Math.max(...Object.values(countMap), 1), [countMap])

  function level(count: number) {
    if (count === 0) return 0
    if (count <= maxCount * 0.25) return 1
    if (count <= maxCount * 0.5) return 2
    if (count <= maxCount * 0.75) return 3
    return 4
  }

  const totalThisYear = useMemo(() => {
    const year = new Date().getFullYear()
    return Object.entries(countMap).filter(([k]) => k.startsWith(String(year))).reduce((s, [, v]) => s + v, 0)
  }, [countMap])

  // Ay etiketleri için hafta başlarını bul
  const monthLabels: { label: string; weekIdx: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, idx) => {
    const month = new Date(week.days[0].key).getMonth()
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTH_LABELS[month], weekIdx: idx })
      lastMonth = month
    }
  })

  return (
    <div className="rounded-xl p-5 overflow-x-auto" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #E11D48, #D4A843)' }} />
          <p className="text-sm font-semibold text-white">Aktivite Haritası</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'rgba(225,29,72,0.7)' }}>{totalThisYear}</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>bu yıl</span>
        </div>
      </div>

      <div className="relative min-w-[680px]">
        {/* Ay etiketleri */}
        <div className="flex mb-1 pl-7" style={{ gap: 3 }}>
          {weeks.map((_, idx) => {
            const ml = monthLabels.find(m => m.weekIdx === idx)
            return (
              <div key={idx} style={{ width: 12, flexShrink: 0 }} className="text-[9px] text-[--text-secondary]">
                {ml ? ml.label : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0.5">
          {/* Gün etiketleri */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ height: 12 }} className="text-[9px] text-[--text-secondary] flex items-center justify-end pr-1 w-6">
                {d}
              </div>
            ))}
          </div>

          {/* Haftalar */}
          {weeks.map((week) => (
            <div key={week.key} className="flex flex-col gap-0.5">
              {week.days.map(day => {
                const count = countMap[day.key] ?? 0
                const lv = level(count)
                return (
                  <div
                    key={day.key}
                    className={`w-3 h-3 rounded-sm cursor-default transition-transform hover:scale-125 ${LEVEL_COLORS[lv]}`}
                    onMouseEnter={e => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect()
                      setTooltip({ text: `${count} aktivite · ${day.label}`, x: rect.left, y: rect.top - 30 })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Açıklama */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[9px] text-[--text-secondary]">Az</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[9px] text-[--text-secondary]">Çok</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg pointer-events-none shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
