export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-40 rounded-lg mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[2/3] rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 w-3/4 rounded mb-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-2.5 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
