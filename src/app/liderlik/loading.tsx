import { Sk, SkAvatar } from '@/components/skeletons'

export default function LiderlikLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Sk className="h-7 w-7 rounded-lg" />
        <Sk className="h-7 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="rounded-xl p-3 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Sk className="h-7 w-7 rounded-lg shrink-0" />
            <SkAvatar size="sm" />
            <Sk className="h-4 w-32 flex-1" />
            <Sk className="h-6 w-12 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
