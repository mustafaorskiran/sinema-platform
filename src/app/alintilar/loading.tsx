export default function AlintilarLoading() {
  const skBg = { background: 'rgba(255,255,255,0.07)' }
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <div className="h-9 w-72 rounded-xl animate-pulse mb-2" style={skBg} />
        <div className="h-4 w-56 rounded-lg animate-pulse" style={skBg} />
      </div>

      <div className="mb-10 rounded-2xl p-8"
        style={{ background: 'rgba(20,28,47,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '4px solid var(--accent)' }}>
        <div className="h-3 w-32 rounded animate-pulse mb-4" style={skBg} />
        <div className="space-y-2 mb-4">
          <div className="h-7 rounded-lg animate-pulse" style={skBg} />
          <div className="h-7 w-4/5 rounded-lg animate-pulse" style={skBg} />
        </div>
        <div className="h-4 w-40 rounded animate-pulse mb-3" style={skBg} />
        <div className="h-4 w-24 rounded animate-pulse" style={skBg} />
      </div>

      <div className="columns-1 md:columns-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="break-inside-avoid rounded-2xl p-6 mb-4"
            style={{ background: 'rgba(20,28,47,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="space-y-2 mb-4">
              <div className="h-5 rounded animate-pulse" style={skBg} />
              <div className="h-5 w-3/4 rounded animate-pulse" style={skBg} />
            </div>
            <div className="h-4 w-32 rounded animate-pulse mb-3" style={skBg} />
            <div className="flex justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-3 w-16 rounded animate-pulse" style={skBg} />
              <div className="h-3 w-20 rounded animate-pulse" style={skBg} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
