export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-32 rounded-lg mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="h-12 w-12 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="flex-1">
              <div className="h-3.5 w-32 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-3 w-48 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="h-3 w-10 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
