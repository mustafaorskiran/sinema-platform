import { Sk, SkText } from '@/components/skeletons'

export default function PremiumLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <Sk className="h-10 w-64 mx-auto mb-4" />
      <SkText lines={2} className="mb-10" />
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Sk key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
