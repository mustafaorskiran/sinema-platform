import { Sk } from '@/components/skeletons'

export default function EnCokYorumlananLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Sk className="h-7 w-7 rounded-lg" />
        <Sk className="h-8 w-52" />
      </div>
      {/* Sekmeler */}
      <Sk className="h-11 w-60 rounded-xl mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-[--bg-card] border border-[--border] p-3">
            <Sk className="h-7 w-6 rounded shrink-0" />
            <Sk className="w-12 aspect-[2/3] rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-4 w-3/4" />
              <Sk className="h-3 w-32" />
            </div>
            <div className="space-y-1.5 items-end flex flex-col shrink-0">
              <Sk className="h-4 w-20" />
              <Sk className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
