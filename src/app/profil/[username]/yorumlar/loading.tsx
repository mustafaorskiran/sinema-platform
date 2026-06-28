import { Sk, SkReviewCard } from '@/components/skeletons'
export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-7 w-48 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <SkReviewCard key={i} />)}
      </div>
    </div>
  )
}
