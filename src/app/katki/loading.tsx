import { Sk, SkText } from '@/components/skeletons'

export default function KatkiLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-8 w-56 mb-3" />
      <SkText lines={2} className="mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sk className="h-4 w-1/3 mb-3" />
            <SkText lines={2} />
          </div>
        ))}
      </div>
    </div>
  )
}
