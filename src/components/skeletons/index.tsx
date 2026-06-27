const shimmer = 'relative overflow-hidden after:absolute after:inset-0 after:translate-x-[-100%] after:animate-[shimmer_1.6s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent rounded'
const bg = 'bg-[rgba(255,255,255,0.04)]'

export function Sk({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`${shimmer} ${bg} ${className}`} style={style} />
}

export function SkText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${shimmer} ${bg} h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-20 w-20' : 'h-10 w-10'
  return <div className={`${shimmer} ${bg} rounded-full shrink-0 ${s}`} />
}

export function SkMovieCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className={`${shimmer} ${bg} aspect-[2/3] w-full rounded-xl`} />
      <div className={`${shimmer} ${bg} h-3.5 w-4/5`} />
      <div className={`${shimmer} ${bg} h-3 w-1/2`} />
    </div>
  )
}

export function SkReviewCard() {
  return (
    <div className="rounded-xl p-5 space-y-4"
      style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.8), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3">
        <SkAvatar />
        <div className="space-y-1.5 flex-1">
          <div className={`${shimmer} ${bg} h-3.5 w-28`} />
          <div className={`${shimmer} ${bg} h-3 w-20`} />
        </div>
        <div className={`${shimmer} ${bg} h-7 w-16 rounded-full`} />
      </div>
      <SkText lines={3} />
    </div>
  )
}

export function SkDetailHero() {
  return (
    <div>
      <div className={`${shimmer} ${bg} h-[56vh] min-h-[320px] w-full rounded-none`}
        style={{ background: 'rgba(12,16,26,0.9)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 relative">
        <div className="flex gap-8 items-end">
          <div className={`${shimmer} ${bg} w-48 aspect-[2/3] rounded-2xl shrink-0 hidden md:block`}
            style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="flex-1 pb-4 space-y-4">
            <div className={`${shimmer} ${bg} h-10 w-3/4 rounded-lg`} />
            <div className={`${shimmer} ${bg} h-4 w-1/2 rounded`} />
            <div className="flex gap-2">
              {[60, 48, 56, 52, 44].map((w, i) => (
                <div key={i} className={`${shimmer} ${bg} h-7 rounded-full`} style={{ width: w }} />
              ))}
            </div>
            <SkText lines={3} />
          </div>
        </div>
      </div>
    </div>
  )
}
