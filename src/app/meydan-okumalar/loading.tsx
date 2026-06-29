export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 w-52 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="h-3 w-40 rounded mb-8" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-between mb-3">
          <div className="h-4 w-28 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="h-4 w-20 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
        <div className="h-2 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="flex-1">
                <div className="h-4 w-44 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-3 w-64 rounded mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-1.5 rounded-full w-1/3" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
