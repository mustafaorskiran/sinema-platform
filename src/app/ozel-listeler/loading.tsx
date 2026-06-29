export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-40 rounded-lg mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-32" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="p-4">
              <div className="h-4 w-40 rounded mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
