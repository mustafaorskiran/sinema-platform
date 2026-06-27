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

  const getBarColor = (i: number) => {
    if (i >= 7) return 'linear-gradient(180deg, #4ade80, #16a34a)'
    if (i >= 4) return 'linear-gradient(180deg, #facc15, #ca8a04)'
    return 'linear-gradient(180deg, #f87171, #dc2626)'
  }

  const avgNum = parseFloat(avg)
  const avgColor = avgNum >= 7 ? '#4ade80' : avgNum >= 5 ? '#facc15' : '#f87171'

  return (
    <div className="mt-10" id="puan-dagilimi">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #D4A843 0%, #E11D48 100%)' }} />
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Puan Dağılımı</h2>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
        {/* Özet satırı */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-0.5" style={{ color: 'rgba(212,168,67,0.4)' }}>
              Platform Puanı
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black" style={{ color: avgColor }}>{avg}</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>/10</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Toplam Oy
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{rated.length}</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-end gap-1.5 h-24">
            {counts.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {count > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity
                    text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{ background: 'rgba(14,20,32,0.95)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)' }}>
                    {count}
                  </div>
                )}
                <div className="w-full rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${Math.max(Math.round((count / max) * 80), count > 0 ? 4 : 0)}%`,
                    background: getBarColor(i),
                    opacity: count > 0 ? 0.85 : 0.1,
                    minHeight: count > 0 ? '4px' : '2px',
                  }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-2">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <div key={n} className="flex-1 text-center text-[10px] font-medium"
                style={{ color: n === Math.round(avgNum) ? '#D4A843' : 'rgba(255,255,255,0.2)' }}>
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
