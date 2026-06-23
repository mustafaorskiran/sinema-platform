'use client'

interface Props {
  reviews: { rating: number }[]
}

export default function RatingDistribution({ reviews }: Props) {
  const rated = reviews.filter(r => r.rating > 0)
  if (rated.length < 3) return null

  const counts: number[] = Array(10).fill(0)
  for (const r of rated) {
    const idx = Math.min(Math.max(Math.floor(r.rating) - 1, 0), 9)
    counts[idx]++
  }
  const max = Math.max(...counts, 1)
  const avg = (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1)

  const COLOR = (i: number) => {
    if (i >= 7) return 'bg-green-500'
    if (i >= 4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="mt-10" id="puan-dagilimi">
      <h2 className="text-xl font-bold text-white mb-1">📊 Puan Dağılımı</h2>
      <p className="text-sm text-[--text-secondary] mb-4">{rated.length} puan · Ortalama <span className="text-white font-semibold">{avg}/10</span></p>
      <div className="bg-[--bg-card] border border-[--border] rounded-2xl p-5">
        <div className="flex items-end gap-1.5 h-28">
          {counts.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[--text-secondary]">{count || ''}</span>
              <div
                className={`w-full rounded-t transition-all ${COLOR(i)}`}
                style={{ height: `${Math.round((count / max) * 80)}px`, minHeight: count ? '4px' : '0' }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <div key={n} className="flex-1 text-center text-[10px] text-[--text-secondary]">{n}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
