import { Sk, SkMovieCard } from '@/components/skeletons'

export default function NeIzlesemLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Sk className="h-8 w-48 mb-2" />
      <Sk className="h-4 w-72 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
