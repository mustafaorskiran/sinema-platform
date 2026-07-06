'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Entry {
  id: string
  media_id: number
  media_type: string
  watched_at: string
  rating: number | null
  note: string | null
  title: string
  poster: string | null
}

interface Props {
  grouped: Record<string, Entry[]>
  totalPages: number
  currentPage: number
}

function formatMonthKey(key: string) {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', weekday: 'short' })
}

export default function DiaryPageClient({ grouped, totalPages, currentPage }: Props) {
  const [deleted, setDeleted] = useState<Set<string>>(new Set())

  async function handleDelete(id: string) {
    if (!confirm('Bu kaydı silmek istiyor musun?')) return
    await fetch(`/api/diary/${id}`, { method: 'DELETE' })
    setDeleted(prev => new Set([...prev, id]))
  }

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      {months.map(month => {
        const entries = grouped[month].filter(e => !deleted.has(e.id))
        if (entries.length === 0) return null
        return (
          <div key={month} className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[--text-secondary] mb-4">
              {formatMonthKey(month)}
              <span className="ml-2 text-xs normal-case">({entries.length} film)</span>
            </h2>

            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
                  style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Tarih */}
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-lg font-bold text-white leading-none">
                      {new Date(entry.watched_at).getDate()}
                    </p>
                    <p className="text-[10px] text-[--text-secondary] uppercase">
                      {new Date(entry.watched_at).toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </p>
                  </div>

                  {/* Poster */}
                  <Link href={`/${entry.media_type}/${entry.media_id}`} className="shrink-0" prefetch={false}>
                    <div className="w-10 h-14 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {entry.poster
                        ? <img src={entry.poster} alt={entry.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-[8px] p-0.5 text-center leading-tight">{entry.title}</div>
                      }
                    </div>
                  </Link>

                  {/* Bilgi */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${entry.media_type}/${entry.media_id}`}
                      className="text-sm font-medium text-white hover:text-[--accent] transition-colors line-clamp-1"
                    >
                      {entry.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        entry.media_type === 'film'
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-purple-500/15 text-purple-400'
                      }`}>
                        {entry.media_type === 'film' ? 'Film' : 'Dizi'}
                      </span>
                      {entry.rating && (
                        <span className="text-xs font-semibold text-[--gold]">★ {entry.rating}/10</span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-xs text-[--text-secondary] mt-1 line-clamp-1 italic">"{entry.note}"</p>
                    )}
                  </div>

                  {/* Sil */}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs text-[--text-secondary] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {currentPage > 1 && (
            <Link href={`/gunluk?sayfa=${currentPage - 1}`}
              className="px-5 py-2 rounded-lg text-sm transition-all hover:text-white hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              ← Önceki
            </Link>
          )}
          <span className="px-5 py-2 text-sm text-[--text-secondary] flex items-center">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/gunluk?sayfa=${currentPage + 1}`}
              className="px-5 py-2 rounded-lg text-sm transition-all hover:text-white hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
