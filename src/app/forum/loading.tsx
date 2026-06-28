import { Sk, SkText, SkAvatar } from '@/components/skeletons'

export default function ForumLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Sk className="h-8 w-8 rounded-lg" />
        <Sk className="h-7 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <SkAvatar size="sm" />
            <div className="flex-1">
              <Sk className="h-4 w-3/5 mb-2" />
              <Sk className="h-3 w-2/5" />
            </div>
            <Sk className="h-6 w-10 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
