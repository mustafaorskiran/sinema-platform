export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="text-center mb-10">
        <div className="h-10 w-56 rounded-lg mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="h-4 w-72 rounded mx-auto" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-6 flex flex-col items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-10 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-4 w-20 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
