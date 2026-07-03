'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/LocaleContext'

interface Entry {
  date: string
  mediaId: number
  mediaType: string
  title?: string
}

interface Props {
  entries: Entry[]
}

export default function WatchCalendar({ entries }: Props) {
  const { t } = useLocale()
  const DAYS_TR = [
    t('calendar.dayMon'), t('calendar.dayTue'), t('calendar.dayWed'), t('calendar.dayThu'),
    t('calendar.dayFri'), t('calendar.daySat'), t('calendar.daySun'),
  ]
  const MONTHS_TR = [
    t('calendar.monthJan'), t('calendar.monthFeb'), t('calendar.monthMar'), t('calendar.monthApr'),
    t('calendar.monthMay'), t('calendar.monthJun'), t('calendar.monthJul'), t('calendar.monthAug'),
    t('calendar.monthSep'), t('calendar.monthOct'), t('calendar.monthNov'), t('calendar.monthDec'),
  ]
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const dayMap = useMemo(() => {
    const map: Record<string, Entry[]> = {}
    for (const e of entries) {
      const d = e.date.slice(0, 10)
      if (!map[d]) map[d] = []
      map[d].push(e)
    }
    return map
  }, [entries])

  const firstDay = new Date(year, month, 1)
  // 0=Sun..6=Sat → convert to Mon-based (0=Mon..6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function next() {
    const futureYear = year + (month === 11 ? 1 : 0)
    const futureMonth = month === 11 ? 0 : month + 1
    if (futureYear > now.getFullYear() || (futureYear === now.getFullYear() && futureMonth > now.getMonth())) return
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isNextDisabled = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth())

  const todayStr = now.toISOString().slice(0, 10)

  return (
    <div className="rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Başlık + navigasyon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #E11D48, #D4A843)' }} />
          <p className="text-sm font-semibold text-white">{t('calendar.title')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-white/50 hover:text-white text-xs">‹</button>
          <span className="text-xs text-white/70 min-w-[90px] text-center">{MONTHS_TR[month]} {year}</span>
          <button onClick={next} disabled={isNextDisabled}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-white/50 hover:text-white text-xs disabled:opacity-30 disabled:cursor-not-allowed">›</button>
        </div>
      </div>

      {/* Gün başlıkları */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_TR.map(d => (
          <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{d}</div>
        ))}
      </div>

      {/* Hücreler */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayEntries = dayMap[dateStr] ?? []
          const isToday = dateStr === todayStr
          const hasActivity = dayEntries.length > 0

          return (
            <div
              key={dateStr}
              title={hasActivity ? dayEntries.map(e => e.title ?? `${e.mediaType}/${e.mediaId}`).join(', ') : undefined}
              className="aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all hover:scale-105 cursor-default"
              style={{
                background: hasActivity
                  ? `rgba(225,29,72,${Math.min(0.15 + dayEntries.length * 0.1, 0.6)})`
                  : isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: isToday ? '1px solid rgba(255,255,255,0.15)' : hasActivity ? '1px solid rgba(225,29,72,0.3)' : '1px solid transparent',
              }}
            >
              <span className={`text-[11px] font-medium ${
                isToday ? 'text-white font-bold' : hasActivity ? 'text-white' : 'text-white/40'
              }`}>{day}</span>
              {hasActivity && (
                <span className="text-[9px] font-bold" style={{ color: 'rgba(225,29,72,0.9)' }}>
                  {dayEntries.length > 1 ? `×${dayEntries.length}` : '●'}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Ay özeti */}
      {Object.keys(dayMap).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length > 0 && (
        <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('calendar.thisMonth')}</span>
          <span className="text-xs font-bold" style={{ color: 'rgba(225,29,72,0.8)' }}>
            {t('calendar.watchCount', { n: Object.entries(dayMap)
              .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
              .reduce((s, [, v]) => s + v.length, 0) })}
          </span>
        </div>
      )}
    </div>
  )
}
