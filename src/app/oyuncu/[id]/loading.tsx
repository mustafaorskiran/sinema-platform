import { Sk, SkText, SkMovieCard } from '@/components/skeletons'

export default function OyuncuLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row gap-8 mb-12">
        <Sk className="w-48 aspect-[2/3] rounded-2xl shrink-0 mx-auto sm:mx-0" />
        <div className="flex-1 space-y-4 pt-2">
          <Sk className="h-9 w-56" />
          <Sk className="h-4 w-32" />
          <div className="flex gap-4">
            <Sk className="h-4 w-24" />
            <Sk className="h-4 w-28" />
          </div>
          <SkText lines={5} />
        </div>
      </div>
      <Sk className="h-6 w-40 mb-5" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {Array.from({ length: 16 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
