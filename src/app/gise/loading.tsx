import { Sk } from '@/components/skeletons'

export default function GiseLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="flex items-center gap-2.5 mb-2">
        <Sk className="h-6 w-6 rounded-lg" />
        <Sk className="h-8 w-44" />
      </div>
      <Sk className="h-4 w-72 mb-8" />

      {/* Sekmeler */}
      <div className="flex gap-2 mb-8">
        <Sk className="h-9 w-28 rounded-full" />
        <Sk className="h-9 w-24 rounded-full" />
      </div>

      {/* Tablo satırları */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3"
            style={{
              background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)',
              borderBottom: i < 9 ? '1px solid var(--border)' : 'none',
            }}
          >
            <Sk className="w-8 h-5 shrink-0" />
            <Sk className="shrink-0 rounded-lg" style={{ width: 40, height: 60 }} />
            <div className="flex-1 space-y-2">
              <Sk className="h-4 w-3/4" />
              <Sk className="h-3 w-16" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Sk className="h-4 w-12" />
              <Sk className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
