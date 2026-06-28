import { Sk } from '@/components/skeletons'
export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Sk className="h-7 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(20,28,47,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sk className="h-7 w-14 mx-auto" />
            <Sk className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
      <Sk className="h-40 rounded-2xl" />
      <Sk className="h-52 rounded-2xl" />
    </div>
  )
}
