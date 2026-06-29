export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="text-center mb-8">
        <div className="h-12 w-12 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-8 w-56 rounded-lg mx-auto mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="h-3 w-64 rounded mx-auto" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-5 w-40 rounded mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="h-2 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex gap-3">
          <div className="h-10 flex-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-10 w-24 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </div>
  )
}
