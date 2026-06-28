import { Sk } from '@/components/skeletons'
export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-7 w-40 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: 'rgba(20,28,47,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sk className="h-14 w-14 rounded-full" />
            <Sk className="h-4 w-24" />
            <Sk className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
