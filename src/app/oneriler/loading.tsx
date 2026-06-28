import { Sk, SkMovieCard } from "@/components/skeletons"
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Sk className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => <SkMovieCard key={i} />)}
      </div>
    </div>
  )
}
