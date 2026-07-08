import { Sk, SkText } from '@/components/skeletons'

export default function OnboardingLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <Sk className="h-8 w-48 mx-auto mb-3" />
      <SkText lines={2} className="mb-10" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Sk key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
