export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-48 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="h-3 w-64 rounded mb-8" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-40" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="p-4">
              <div className="h-5 w-32 rounded mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
