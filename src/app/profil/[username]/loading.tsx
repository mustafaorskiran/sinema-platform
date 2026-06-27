import { Sk, SkText, SkAvatar, SkMovieCard } from '@/components/skeletons'

export default function ProfilLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profil başlığı */}
      <div className="flex items-start gap-6 mb-8">
        <SkAvatar size="lg" />
        <div className="flex-1 space-y-3">
          <Sk className="h-8 w-48" />
          <Sk className="h-4 w-36" />
          <div className="flex gap-5">
            <Sk className="h-4 w-20" />
            <Sk className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl animate-pulse" style={{ background: 'rgba(20,28,47,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sk className="h-8 w-12 mx-auto" />
            <Sk className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Watchlist */}
      <div className="mb-8">
        <Sk className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: 10 }).map((_, i) => <SkMovieCard key={i} />)}
        </div>
      </div>

      {/* Yorumlar */}
      <Sk className="h-6 w-32 mb-5" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl animate-pulse" style={{ background: 'rgba(20,28,47,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sk className="w-14 aspect-[2/3] rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-5 w-48" />
              <Sk className="h-3.5 w-24" />
              <SkText lines={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
