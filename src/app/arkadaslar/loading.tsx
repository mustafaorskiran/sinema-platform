import { Sk, SkAvatar } from '@/components/skeletons'

export default function ArkadaslarLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-8 w-40 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <SkAvatar />
            <Sk className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
