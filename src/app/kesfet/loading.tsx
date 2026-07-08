import { SkMovieCard, Sk } from '@/components/skeletons'

export default function KesfetLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Sk className="h-8 w-40 mb-2" />
      <Sk className="h-4 w-64 mb-8" />
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="mb-10">
          <Sk className="h-5 w-48 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkMovieCard key={i} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
