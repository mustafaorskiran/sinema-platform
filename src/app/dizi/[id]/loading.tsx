import { SkDetailHero, SkReviewCard, Sk, SkMovieCard } from '@/components/skeletons'

export default function DiziDetailLoading() {
  return (
    <div>
      <SkDetailHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Sk className="h-6 w-40" />
            <Sk className="h-32 w-full rounded-xl" />
            <Sk className="h-10 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Sk className="h-6 w-32" />
            {Array.from({ length: 3 }).map((_, i) => <SkReviewCard key={i} />)}
          </div>
        </div>
        <div className="mt-12">
          <Sk className="h-6 w-44 mb-5" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <SkMovieCard key={i} />)}
          </div>
        </div>
        <div className="pb-16" />
      </div>
    </div>
  )
}
