export default function AlintilarLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık skeleton */}
      <div className="mb-10">
        <div className="h-9 w-72 rounded-xl bg-[--bg-card] animate-pulse mb-2" />
        <div className="h-4 w-56 rounded-lg bg-[--bg-card] animate-pulse" />
      </div>

      {/* Hero skeleton */}
      <div
        className="mb-10 rounded-2xl bg-[--bg-card] border border-[--border] p-8"
        style={{ borderLeft: '4px solid var(--accent)' }}
      >
        <div className="h-3 w-32 rounded bg-[--bg-secondary] animate-pulse mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-7 rounded-lg bg-[--bg-secondary] animate-pulse" />
          <div className="h-7 w-4/5 rounded-lg bg-[--bg-secondary] animate-pulse" />
        </div>
        <div className="h-4 w-40 rounded bg-[--bg-secondary] animate-pulse mb-3" />
        <div className="h-4 w-24 rounded bg-[--bg-secondary] animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="columns-1 md:columns-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid bg-[--bg-card] border border-[--border] rounded-2xl p-6 mb-4"
          >
            <div className="space-y-2 mb-4">
              <div className="h-5 rounded bg-[--bg-secondary] animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-[--bg-secondary] animate-pulse" />
            </div>
            <div className="h-4 w-32 rounded bg-[--bg-secondary] animate-pulse mb-3" />
            <div className="flex justify-between mt-4 pt-3 border-t border-[--border]">
              <div className="h-3 w-16 rounded bg-[--bg-secondary] animate-pulse" />
              <div className="h-3 w-20 rounded bg-[--bg-secondary] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
