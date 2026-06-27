'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type SortOption = 'yeni' | 'populer' | 'puan_yuksek' | 'puan_dusuk'

const OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'yeni',        label: 'En Yeni' },
  { key: 'populer',     label: 'En Beğenilen' },
  { key: 'puan_yuksek', label: 'Puan ↑' },
  { key: 'puan_dusuk',  label: 'Puan ↓' },
]

export default function ReviewSortButton({ current }: { current: SortOption }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  function handleChange(key: SortOption) {
    const params = new URLSearchParams(sp.toString())
    if (key === 'yeni') params.delete('siralama')
    else params.set('siralama', key)
    router.push(`${pathname}?${params.toString()}#yorumlar`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {OPTIONS.map(o => (
        <button key={o.key} onClick={() => handleChange(o.key)}
          className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
          style={{
            background: current === o.key ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${current === o.key ? 'rgba(212,168,67,0.35)' : 'rgba(255,255,255,0.08)'}`,
            color: current === o.key ? '#D4A843' : 'rgba(255,255,255,0.4)',
          }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
