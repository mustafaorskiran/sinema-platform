const base = 'animate-pulse rounded'
const bg   = 'bg-[--skeleton]'

export function Sk({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`${base} ${bg} ${className}`} style={style} />
}

export function SkText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${base} ${bg} h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-20 w-20' : 'h-10 w-10'
  return <div className={`${base} ${bg} rounded-full shrink-0 ${s}`} />
}

export function SkMovieCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className={`${base} ${bg} aspect-[2/3] w-full rounded-xl`} />
      <div className={`${base} ${bg} h-3.5 w-4/5`} />
      <div className={`${base} ${bg} h-3 w-1/2`} />
    </div>
  )
}

export function SkReviewCard() {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <SkAvatar />
        <div className="space-y-1.5 flex-1">
          <div className={`${base} ${bg} h-3.5 w-28`} />
          <div className={`${base} ${bg} h-3 w-20`} />
        </div>
        <div className={`${base} ${bg} h-7 w-16 rounded-full`} />
      </div>
      <SkText lines={3} />
    </div>
  )
}

export function SkDetailHero() {
  return (
    <div>
      <div className={`${base} ${bg} h-[50vh] min-h-[300px] w-full rounded-none`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative">
        <div className="flex gap-8 items-end">
          <div className={`${base} ${bg} w-48 aspect-[2/3] rounded-xl shrink-0 hidden md:block`} />
          <div className="flex-1 pb-4 space-y-4">
            <div className={`${base} ${bg} h-10 w-3/4`} />
            <div className={`${base} ${bg} h-4 w-1/2`} />
            <div className="flex gap-2">
              {[60, 48, 56, 52].map(w => (
                <div key={w} className={`${base} ${bg} h-7 rounded-full`} style={{ width: w }} />
              ))}
            </div>
            <SkText lines={3} />
          </div>
        </div>
      </div>
    </div>
  )
}
