import { Sk, SkText } from '@/components/skeletons'

export default function HaberlerLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Sk className="h-7 w-7 rounded-lg" />
        <Sk className="h-7 w-40" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sk className="h-5 w-5 rounded-full" />
              <Sk className="h-3 w-24" />
            </div>
            <SkText lines={2} />
            <Sk className="h-3 w-16 mt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
