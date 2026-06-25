'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MediaItem {
  id: number
  title: string
  poster: string | null
  date: string
  dateFormatted: string
  daysUntil: number | null
  rating: number
  type: 'film' | 'dizi'
}

interface Props {
  upcoming: MediaItem[]
  onAir: MediaItem[]
  today: MediaItem[]
  upcomingDiziler: MediaItem[]
}

const TABS = [
  { key: 'upcoming',         label: '🎬 Yakında Filmler'  },
  { key: 'upcomingDiziler',  label: '📺 Yakında Diziler'  },
  { key: 'onair',            label: '▶️ Bu Hafta Yayında' },
  { key: 'today',            label: '📅 Bugün Yayında'    },
] as const

type TabKey = typeof TABS[number]['key']

function DaysUntilBadge({ days }: { days: number | null }) {
  if (days === null) return null
  if (days < 0)  return <span className="text-[10px] bg-[--bg-secondary] text-[--text-secondary] px-2 py-0.5 rounded-full">Çıktı</span>
  if (days === 0) return <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full">Bugün!</span>
  if (days === 1) return <span className="text-[10px] bg-yellow-500/20 text-yellow-400 font-bold px-2 py-0.5 rounded-full">Yarın</span>
  if (days <= 7)  return <span className="text-[10px] bg-[--accent]/20 text-[--accent] font-semibold px-2 py-0.5 rounded-full">{days} gün</span>
  return <span className="text-[10px] bg-[--bg-secondary] text-[--text-secondary] px-2 py-0.5 rounded-full">{days} gün</span>
}

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link
      href={`/${item.type}/${item.id}`}
      className="group flex gap-3 p-3 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/40 transition-colors"
    >
      <div className="shrink-0 w-14 h-20 rounded-lg overflow-hidden bg-[--bg-secondary]">
        {item.poster
          ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
          : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-1 text-center">{item.title}</div>
        }
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[--accent] transition-colors">{item.title}</p>
        {item.dateFormatted && (
          <p className="text-xs text-[--text-secondary]">{item.dateFormatted}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          {item.daysUntil !== null && <DaysUntilBadge days={item.daysUntil} />}
          {item.rating > 0 && (
            <span className="text-[10px] text-[--gold]">★ {item.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function groupByWeek(items: MediaItem[]) {
  const groups: Record<string, MediaItem[]> = {}
  const now = new Date(); now.setHours(0, 0, 0, 0)

  for (const item of items) {
    if (!item.date) { (groups['Tarih Belirsiz'] ??= []).push(item); continue }
    const diff = Math.ceil((new Date(item.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    let label: string
    if (diff < 0)        label = 'Geçti'
    else if (diff === 0) label = 'Bugün'
    else if (diff <= 7)  label = 'Bu Hafta'
    else if (diff <= 14) label = 'Gelecek Hafta'
    else if (diff <= 30) label = 'Bu Ay'
    else if (diff <= 60) label = 'Önümüzdeki 2 Ay'
    else                 label = 'Daha Sonra'
    ;(groups[label] ??= []).push(item)
  }

  const order = ['Bugün', 'Bu Hafta', 'Gelecek Hafta', 'Bu Ay', 'Önümüzdeki 2 Ay', 'Daha Sonra', 'Geçti', 'Tarih Belirsiz']
  return order.filter(k => groups[k]).map(k => ({ label: k, items: groups[k] }))
}

export default function YayinTakvimiClient({ upcoming, onAir, today, upcomingDiziler }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')

  const counts: Record<TabKey, number> = {
    upcoming:        upcoming.length,
    upcomingDiziler: upcomingDiziler.length,
    onair:           onAir.length,
    today:           today.length,
  }

  const currentItems =
    activeTab === 'upcoming'        ? upcoming :
    activeTab === 'upcomingDiziler' ? upcomingDiziler :
    activeTab === 'onair'           ? onAir : today

  const useGrouped = activeTab === 'upcoming' || activeTab === 'upcomingDiziler'
  const grouped = useGrouped ? groupByWeek(currentItems) : null
  const groupLabel = activeTab === 'upcoming' ? 'film' : 'dizi'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Yayın Takvimi</h1>
        <p className="text-[--text-secondary] mt-1">Yakında çıkacak filmler & diziler, yayındakiler</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-0 mb-8 border-b border-[--border]">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[--accent] text-white'
                : 'border-transparent text-[--text-secondary] hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {currentItems.length === 0 ? (
        <div className="text-center py-20 text-[--text-secondary]">
          <p className="text-4xl mb-4">📅</p>
          <p>Şu an için içerik bulunamadı.</p>
        </div>
      ) : grouped ? (
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.label}>
              <h2 className="text-sm font-bold text-[--accent] uppercase tracking-wider mb-3 flex items-center gap-2">
                {group.label}
                <span className="flex-1 border-t border-[--border] ml-1" />
                <span className="text-[--text-secondary] font-normal normal-case">{group.items.length} {groupLabel}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {group.items.map(item => <MediaCard key={item.id} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {currentItems.map(item => <MediaCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
