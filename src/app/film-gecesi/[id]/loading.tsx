import { Sk, SkMovieCard, SkAvatar } from '@/components/skeletons'
export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Sk className="h-8 w-72" />
      <Sk className="h-4 w-56" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <SkAvatar key={i} size="sm" />)}
      </div>
      <Sk className="h-6 w-32 mt-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
