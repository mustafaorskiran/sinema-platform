export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div>
            <div className="h-6 w-32 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
        <div className="h-9 w-40 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div className="flex gap-2 mb-6">
        {[80, 100, 90, 80, 90].map((w, i) => (
          <div key={i} className="h-7 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="h-10 w-10 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex-1">
              <div className="h-3.5 w-3/4 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-2.5 w-16 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
