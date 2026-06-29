export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-48 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="h-3 w-64 rounded mb-8" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="flex gap-2 mb-6">
        {[60, 60, 80].map((w, i) => (
          <div key={i} className="h-8 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, g) => (
        <div key={g} className="mb-6">
          <div className="h-4 w-32 rounded mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="h-16 w-11 rounded-lg shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="flex-1">
                  <div className="h-4 w-48 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="h-3 w-32 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
