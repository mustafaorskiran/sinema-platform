'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const GENRES = [
  { id: 28, name: 'Aksiyon' }, { id: 35, name: 'Komedi' }, { id: 18, name: 'Drama' },
  { id: 27, name: 'Korku' }, { id: 878, name: 'Bilim Kurgu' }, { id: 9648, name: 'Gizem' },
  { id: 53, name: 'Gerilim' }, { id: 10749, name: 'Romantik' }, { id: 16, name: 'Animasyon' },
  { id: 99, name: 'Belgesel' }, { id: 80, name: 'Suç' }, { id: 12, name: 'Macera' },
]

const YEARS = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i)
const RATINGS = ['6', '7', '7.5', '8', '8.5', '9']
const LANGUAGES = [
  { code: 'tr', name: 'Türkçe' }, { code: 'en', name: 'İngilizce' },
  { code: 'fr', name: 'Fransızca' }, { code: 'de', name: 'Almanca' },
  { code: 'ja', name: 'Japonca' }, { code: 'ko', name: 'Korece' },
  { code: 'es', name: 'İspanyolca' }, { code: 'it', name: 'İtalyanca' },
]

interface Props {
  tip: string
  q: string
}

export default function AramaFiltreler({ tip, q }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const currentYil    = sp.get('yil') ?? ''
  const currentTur    = sp.get('tur') ?? ''
  const currentPuan   = sp.get('min_puan') ?? ''
  const currentDil    = sp.get('dil') ?? ''

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('sayfa')
    router.push(`/arama?${params.toString()}`)
  }, [sp, router])

  if (tip === 'kisi' || tip === 'kullanici') return null

  const hasFilters = currentYil || currentTur || currentPuan || currentDil

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 pb-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Yıl */}
      <select value={currentYil} onChange={e => update('yil', e.target.value)}
        className="rounded-lg px-3 py-1.5 text-[12px] font-medium outline-none cursor-pointer"
        style={{
          background: currentYil ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${currentYil ? 'rgba(212,168,67,0.35)' : 'rgba(255,255,255,0.1)'}`,
          color: currentYil ? '#D4A843' : 'rgba(255,255,255,0.5)',
        }}>
        <option value="">Yıl</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      {/* Tür */}
      {(tip === 'hepsi' || tip === 'film' || tip === 'dizi') && (
        <select value={currentTur} onChange={e => update('tur', e.target.value)}
          className="rounded-lg px-3 py-1.5 text-[12px] font-medium outline-none cursor-pointer"
          style={{
            background: currentTur ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${currentTur ? 'rgba(212,168,67,0.35)' : 'rgba(255,255,255,0.1)'}`,
            color: currentTur ? '#D4A843' : 'rgba(255,255,255,0.5)',
          }}>
          <option value="">Tür</option>
          {GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      )}

      {/* Min Puan */}
      <select value={currentPuan} onChange={e => update('min_puan', e.target.value)}
        className="rounded-lg px-3 py-1.5 text-[12px] font-medium outline-none cursor-pointer"
        style={{
          background: currentPuan ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${currentPuan ? 'rgba(212,168,67,0.35)' : 'rgba(255,255,255,0.1)'}`,
          color: currentPuan ? '#D4A843' : 'rgba(255,255,255,0.5)',
        }}>
        <option value="">Min Puan</option>
        {RATINGS.map(r => <option key={r} value={r}>⭐ {r}+</option>)}
      </select>

      {/* Dil */}
      {(tip === 'hepsi' || tip === 'film' || tip === 'dizi') && (
        <select value={currentDil} onChange={e => update('dil', e.target.value)}
          className="rounded-lg px-3 py-1.5 text-[12px] font-medium outline-none cursor-pointer"
          style={{
            background: currentDil ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${currentDil ? 'rgba(212,168,67,0.35)' : 'rgba(255,255,255,0.1)'}`,
            color: currentDil ? '#D4A843' : 'rgba(255,255,255,0.5)',
          }}>
          <option value="">Dil</option>
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      )}

      {/* Filtreleri temizle */}
      {hasFilters && (
        <button onClick={() => {
          const params = new URLSearchParams()
          if (q) params.set('q', q)
          if (tip && tip !== 'hepsi') params.set('tip', tip)
          router.push(`/arama?${params.toString()}`)
        }}
          className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all hover:opacity-80"
          style={{ background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.25)', color: 'rgba(225,29,72,0.8)' }}>
          ✕ Filtreleri Temizle
        </button>
      )}
    </div>
  )
}
