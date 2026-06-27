'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { TMDbPersonCredit } from '@/lib/types'

type CreditWithRole = TMDbPersonCredit & { role: string }
type Section = 'oyuncu' | 'yonetmen' | 'senaryo'
type SortKey = 'puan' | 'yil'
type TypeFilter = 'hepsi' | 'film' | 'dizi'

interface Props {
  castCredits: CreditWithRole[]
  directorCredits: CreditWithRole[]
  writerCredits: CreditWithRole[]
}

export default function FilmografiClient({ castCredits, directorCredits, writerCredits }: Props) {
  const hasCast = castCredits.length > 0
  const hasDir = directorCredits.length > 0
  const hasWriter = writerCredits.length > 0

  const defaultSection: Section = hasCast ? 'oyuncu' : hasDir ? 'yonetmen' : 'senaryo'
  const [section, setSection] = useState<Section>(defaultSection)
  const [sort, setSort] = useState<SortKey>('puan')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('hepsi')
  const [showAll, setShowAll] = useState(false)

  const baseCredits = section === 'oyuncu' ? castCredits : section === 'yonetmen' ? directorCredits : writerCredits

  const filtered = useMemo(() => {
    let list = baseCredits
    if (typeFilter !== 'hepsi') list = list.filter(c => (typeFilter === 'film' ? c.media_type === 'movie' : c.media_type === 'tv'))
    if (sort === 'yil') list = [...list].sort((a, b) => {
      const ya = (a.release_date ?? a.first_air_date ?? '').slice(0, 4)
      const yb = (b.release_date ?? b.first_air_date ?? '').slice(0, 4)
      return yb.localeCompare(ya)
    })
    else list = [...list].sort((a, b) => b.vote_average - a.vote_average)
    return list
  }, [baseCredits, sort, typeFilter])

  const PAGE = 24
  const shown = showAll ? filtered : filtered.slice(0, PAGE)

  if (!hasCast && !hasDir && !hasWriter) return null

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 rounded-xl rounded-xl p-1" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {hasCast && (
            <button onClick={() => { setSection('oyuncu'); setShowAll(false) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === 'oyuncu' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              Oyunculuk <span className="text-xs opacity-70">({castCredits.length})</span>
            </button>
          )}
          {hasDir && (
            <button onClick={() => { setSection('yonetmen'); setShowAll(false) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === 'yonetmen' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              Yönetmenlik <span className="text-xs opacity-70">({directorCredits.length})</span>
            </button>
          )}
          {hasWriter && (
            <button onClick={() => { setSection('senaryo'); setShowAll(false) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === 'senaryo' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              Senaryo <span className="text-xs opacity-70">({writerCredits.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Tür filtresi */}
          <div className="flex items-center gap-1 rounded-xl rounded-xl p-1" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['hepsi', 'film', 'dizi'] as TypeFilter[]).map(t => (
              <button key={t} onClick={() => { setTypeFilter(t); setShowAll(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${typeFilter === t ? 'bg-[--bg-secondary] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
                {t === 'hepsi' ? 'Hepsi' : t === 'film' ? 'Filmler' : 'Diziler'}
              </button>
            ))}
          </div>
          {/* Sıralama */}
          <div className="flex items-center gap-1 rounded-xl rounded-xl p-1" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setSort('puan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === 'puan' ? 'bg-[--bg-secondary] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              En İyi
            </button>
            <button onClick={() => setSort('yil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === 'yil' ? 'bg-[--bg-secondary] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              En Yeni
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[--text-secondary] text-sm py-8 text-center">Bu kategoride içerik bulunamadı.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {shown.map((credit, i) => (
              <CreditCard key={`${credit.media_type}-${credit.id}-${i}`} credit={credit} />
            ))}
          </div>
          {!showAll && filtered.length > PAGE && (
            <div className="mt-6 text-center">
              <button onClick={() => setShowAll(true)}
                className="px-6 py-2.5 rounded-xl border border-[--border] text-sm text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors">
                Tümünü Gör ({filtered.length})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CreditCard({ credit }: { credit: CreditWithRole }) {
  const href = credit.media_type === 'movie' ? `/film/${credit.id}` : `/dizi/${credit.id}`
  const title = credit.title ?? credit.name ?? '?'
  const year = (credit.release_date ?? credit.first_air_date ?? '').slice(0, 4)

  return (
    <Link href={href} className="group">
      <div className="aspect-[2/3] rounded-lg overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        {credit.poster_path ? (
          <img src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`} alt={title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 text-center text-[--text-secondary] text-xs">{title}</div>
        )}
        {credit.vote_average > 0 && (
          <div className="absolute top-1 right-1 bg-black/70 rounded px-1 py-0.5 text-[10px] text-[--gold] font-semibold">
            {credit.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <p className="mt-1.5 text-xs text-[--text-secondary] line-clamp-1 group-hover:text-white transition-colors">{title}</p>
      <p className="text-[10px] text-[--text-secondary]/60">{year}</p>
      {credit.role && (
        <p className="text-[10px] text-[--accent]/70 line-clamp-1">{credit.role}</p>
      )}
    </Link>
  )
}
