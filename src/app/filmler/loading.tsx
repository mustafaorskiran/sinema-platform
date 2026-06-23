import { SkMovieCard, Sk } from '@/components/skeletons'

export default function FilmlerLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Sk className="h-7 w-7 rounded-lg" />
        <Sk className="h-8 w-32" />
      </div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-8">
        {[120, 100, 110, 130].map(w => (
          <Sk key={w} className="h-10 rounded-lg" style={{ width: w }} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
