import { Sk, SkText, SkAvatar } from '@/components/skeletons'

export default function ForumThreadLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Sk className="h-8 w-3/4 mb-2" />
      <Sk className="h-4 w-40 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3 mb-3">
              <SkAvatar />
              <div>
                <Sk className="h-3.5 w-24 mb-1.5" />
                <Sk className="h-3 w-16" />
              </div>
            </div>
            <SkText lines={3} />
          </div>
        ))}
      </div>
    </div>
  )
}
