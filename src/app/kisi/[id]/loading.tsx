import { Sk, SkMovieCard, SkAvatar } from '@/components/skeletons'
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start gap-6 mb-10">
        <SkAvatar size="lg" />
        <div className="flex-1 space-y-3">
          <Sk className="h-8 w-48" />
          <Sk className="h-4 w-32" />
          <Sk className="h-4 w-64" />
        </div>
      </div>
      <Sk className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {Array.from({ length: 16 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
