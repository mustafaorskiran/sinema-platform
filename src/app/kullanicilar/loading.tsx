export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-44 rounded-lg mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 flex flex-col items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-16 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-3.5 w-24 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-3 w-16 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
