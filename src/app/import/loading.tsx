import { Sk, SkText } from '@/components/skeletons'

export default function ImportLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-8 w-40 mb-3" />
      <SkText lines={2} className="mb-8" />
      <Sk className="h-40 rounded-xl" />
    </div>
  )
}
