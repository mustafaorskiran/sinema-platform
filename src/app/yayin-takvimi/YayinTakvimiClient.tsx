'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ScheduleItem } from './page'

interface Props {
  filmItems: ScheduleItem[]
  tvItems: ScheduleItem[]
  tvBolumItems: ScheduleItem[]
}

const GENRES: Record<number, string> = {
  28: 'Aksiyon', 12: 'Macera', 16: 'Animasyon', 35: 'Komedi',
  80: 'Suç', 99: 'Belgesel', 18: 'Drama', 10751: 'Aile',
  14: 'Fantezi', 36: 'Tarih', 27: 'Korku', 10402: 'Müzik',
  9648: 'Gizem', 10749: 'Romantik', 878: 'Bilim Kurgu',
  53: 'Gerilim', 10752: 'Savaş', 37: 'Western',
  10759: 'Aksiyon & Macera', 10762: 'Çocuk',
  10765: 'Sci-Fi & Fantezi', 10767: 'Talk Show', 10768: 'Savaş & Politika',
}

function formatDateHeader(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getToday() {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function getWeekStart() {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toISOString().split('T')[0]
}

type Group = { label: string; key: string; items: ScheduleItem[]; isBuHafta: boolean }

function groupItems(items: ScheduleItem[]): Group[] {
  const todayStr    = getToday()
  const weekStartStr = getWeekStart()

  const thisWeek: ScheduleItem[] = []
  const byDate: Record<string, ScheduleItem[]> = {}

  for (const item of items) {
    if (!item.date) continue
    if (item.date >= weekStartStr && item.date < todayStr) {
      thisWeek.push(item)
    } else if (item.date >= todayStr) {
      ;(byDate[item.date] ??= []).push(item)
    }
  }

  const groups: Group[] = []
  if (thisWeek.length > 0) {
    groups.push({ label: 'Bu Hafta', key: 'bu-hafta', items: thisWeek, isBuHafta: true })
  }
  for (const date of Object.keys(byDate).sort()) {
    groups.push({ label: formatDateHeader(date), key: date, items: byDate[date], isBuHafta: false })
  }
  return groups
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function ItemRow({ item }: { item: ScheduleItem }) {
  const genres = item.genreIds.slice(0, 3).map(id => GENRES[id]).filter(Boolean)
  const days = item.date ? daysUntil(item.date) : null

  return (
    <Link
      href={`/${item.type}/${item.id}`}
      className="group flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      {/* Poster */}
      <div className="shrink-0 w-11 h-16 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {item.poster
          ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-[8px] text-[--text-secondary] p-0.5 text-center leading-tight">{item.title}</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white group-hover:text-[--accent] transition-colors line-clamp-1 leading-snug">
          {item.title}
        </p>
        {genres.length > 0 && (
          <p className="text-[11px] text-[--text-secondary] mt-0.5 leading-snug">
            {genres.join(' · ')}
          </p>
        )}
        {item.rating > 0 && (
          <p className="text-[11px] text-[--gold] mt-0.5">★ {item.rating.toFixed(1)}</p>
        )}
      </div>

      {/* Days badge */}
      {days !== null && days >= 0 && (
        <div className="shrink-0 text-right">
          {days === 0
            ? <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded">Bugün</span>
            : days === 1
            ? <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Yarın</span>
            : days <= 7
            ? <span className="text-[10px] text-[--accent] px-2 py-0.5 rounded">{days} gün</span>
            : null
          }
        </div>
      )}
    </Link>
  )
}

function DateGroup({ group, itemLabel }: { group: Group; itemLabel: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-0.5 py-1">
        <h2 className={`text-[11px] font-bold uppercase tracking-wider shrink-0 ${
          group.isBuHafta ? 'text-[--accent]' : 'text-[--text-secondary]'
        }`}>
          {group.label}
        </h2>
        <div className="flex-1 border-t border-[--border]" />
        <span className="text-[10px] text-[--text-secondary] shrink-0">
          {group.items.length} {itemLabel}
        </span>
      </div>
      <div>
        {group.items.map(item => <ItemRow key={item.id} item={item} />)}
      </div>
    </div>
  )
}

const TABS = [
  { key: 'film',    label: 'FİLM'      },
  { key: 'tv',      label: 'TV'        },
  { key: 'tvbolum', label: 'TV BÖLÜMÜ' },
] as const
type TabKey = typeof TABS[number]['key']

export default function YayinTakvimiClient({ filmItems, tvItems, tvBolumItems }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('film')

  const filmGroups    = groupItems(filmItems)
  const tvGroups      = groupItems(tvItems)

  // TV BÖLÜMÜ: tüm item'lar bugünün tarihini taşıyor, tek grup "Bugün Yayında"
  const tvBolumGroups: Group[] = tvBolumItems.length > 0
    ? [{ label: 'Bugün Yayında', key: 'bugun', items: tvBolumItems, isBuHafta: true }]
    : []

  const groups     = activeTab === 'film' ? filmGroups : activeTab === 'tv' ? tvGroups : tvBolumGroups
  const itemLabel  = activeTab === 'film' ? 'film' : 'dizi'

  const counts = { film: filmItems.length, tv: tvItems.length, tvbolum: tvBolumItems.length }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Yayın Takvimi</h1>
        <p className="text-[--text-secondary] text-sm mt-0.5">Yakında çıkacak filmler &amp; diziler</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[--border] mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[--accent] text-[--accent]'
                : 'border-transparent text-[--text-secondary] hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 font-normal opacity-40 normal-case tracking-normal text-[10px]">
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <div className="text-center py-20 text-[--text-secondary]">
          <p className="text-3xl mb-3">📅</p>
          <p className="text-sm">Şu an için içerik bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(group => (
            <DateGroup key={group.key} group={group} itemLabel={itemLabel} />
          ))}
        </div>
      )}
    </div>
  )
}
