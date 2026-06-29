export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-44 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="h-3 w-56 rounded mb-8" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, s) => (
          <div key={s} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-5 w-32 rounded mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
