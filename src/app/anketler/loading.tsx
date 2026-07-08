import { Sk, SkText } from '@/components/skeletons'

export default function AnketlerLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-8 w-40 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sk className="h-4 w-3/4 mb-4" />
            <SkText lines={3} />
          </div>
        ))}
      </div>
    </div>
  )
}
