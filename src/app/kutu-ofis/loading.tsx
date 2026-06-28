import { Sk } from '@/components/skeletons'

export default function KutuOfisLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Sk className="h-7 w-7 rounded-lg" />
        <Sk className="h-7 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Sk className="h-8 w-8 rounded-lg shrink-0" />
            <Sk className="h-[66px] w-[44px] rounded-lg shrink-0" />
            <div className="flex-1">
              <Sk className="h-4 w-1/2 mb-2" />
              <Sk className="h-3 w-1/3" />
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <Sk className="h-5 w-14 rounded" />
              <Sk className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
