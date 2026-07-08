import { SkMovieCard, Sk } from '@/components/skeletons'

export default function KoleksiyonlarLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
