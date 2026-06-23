import { Sk, SkAvatar, SkText } from '@/components/skeletons'

export default function AkisLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Sk className="h-7 w-7 rounded-lg" />
        <Sk className="h-8 w-24" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-[--bg-card] border border-[--border] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <SkAvatar />
              <div className="space-y-1.5 flex-1">
                <Sk className="h-3.5 w-28" />
                <Sk className="h-3 w-20" />
              </div>
              <Sk className="h-5 w-12 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Sk className="w-14 aspect-[2/3] rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk className="h-4 w-3/4" />
                <Sk className="h-7 w-20 rounded-md" />
              </div>
            </div>
            <SkText lines={2} />
          </div>
        ))}
      </div>
    </div>
  )
}
