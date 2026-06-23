import { Sk, SkMovieCard } from '@/components/skeletons'

export default function YeniGelenlerLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="flex items-center gap-2.5 mb-2">
        <Sk className="h-6 w-6 rounded-lg" />
        <Sk className="h-8 w-64" />
      </div>
      <Sk className="h-4 w-80 mb-8" />

      {/* Platform sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[80, 70, 110, 60].map((w, i) => (
          <Sk key={i} className="h-9 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Alt başlık */}
      <div className="flex items-center gap-3 mb-6">
        <Sk className="w-3 h-3 rounded-full" />
        <Sk className="h-5 w-48" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkMovieCard key={i} />
        ))}
      </div>
    </div>
  )
}
