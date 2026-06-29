export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-40 rounded-lg mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-24 w-16 rounded-lg shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="flex-1">
              <div className="h-4 w-48 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-3 w-24 rounded mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-3 w-32 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
