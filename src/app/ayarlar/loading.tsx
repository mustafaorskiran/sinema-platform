import { Sk } from '@/components/skeletons'

export default function AyarlarLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-8 w-40 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sk className="h-4 w-32" />
            <Sk className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
