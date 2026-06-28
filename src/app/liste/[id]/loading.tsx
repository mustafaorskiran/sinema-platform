import { Sk, SkMovieCard, SkAvatar } from '@/components/skeletons'
export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start gap-4 mb-8">
        <SkAvatar size="lg" />
        <div className="flex-1 space-y-3">
          <Sk className="h-8 w-64" />
          <Sk className="h-4 w-40" />
          <Sk className="h-4 w-80" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
