import Link from 'next/link'

interface Props {
  list: {
    id: string
    title: string
    subtitle: string | null
    emoji: string | null
    category: string | null
    slug: string | null
    list_type: string
    list_items: { count: number }[]
  }
  posters: string[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'Puanlama': 'bg-yellow-500/20 text-yellow-300',
  'Ödüller':  'bg-amber-500/20 text-amber-300',
  'Tematik':  'bg-blue-500/20 text-blue-300',
  'Yönetmen': 'bg-purple-500/20 text-purple-300',
  'Dönem':    'bg-green-500/20 text-green-300',
  'Ülke':     'bg-red-500/20 text-red-300',
  'Tür':      'bg-pink-500/20 text-pink-300',
  'Platform': 'bg-cyan-500/20 text-cyan-300',
}

export default function EditorialCard({ list, posters }: Props) {
  const href = list.slug ? `/liste/editorial/${list.slug}` : `/liste/${list.id}`
  const itemCount = list.list_items?.[0]?.count ?? 0
  const isDynamic = list.list_type?.startsWith('dynamic')

  // 4 poster slotu — 2x2 kolaj
  const slots = Array.from({ length: 4 }, (_, i) => posters[i] ?? null)

  return (
    <a href={href} className="group flex flex-col rounded-2xl rounded-xl overflow-hidden hover:border-[--accent]/60 transition-all hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* 2×2 poster kolajı */}
      <div className="relative h-40 overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-2 h-full">
          {slots.map((poster, i) => (
            <div key={i} className="relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {poster ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${poster}`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(14,20,32,0.8))' }} />
              )}
            </div>
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[--bg-card]/80 via-transparent to-transparent" />
        {/* Emoji badge */}
        <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center text-lg shadow-lg">
          {list.emoji ?? '📋'}
        </div>
        {/* Editörün seçimi rozeti */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[--accent]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
          ✦ Editöryal
        </div>
      </div>

      {/* Bilgi alanı */}
      <div className="flex flex-col flex-1 p-4">
        <h2 className="font-bold text-white text-sm leading-snug group-hover:text-[--accent] transition-colors line-clamp-2 mb-1">
          {list.title}
        </h2>
        {list.subtitle && (
          <p className="text-xs text-[--text-secondary] line-clamp-2 leading-relaxed mb-3">
            {list.subtitle}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[--border]/50">
          <div className="flex items-center gap-1.5">
            {list.category && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[list.category] ?? 'text-white/40'}`}
                style={CATEGORY_COLORS[list.category] ? {} : { background: 'rgba(255,255,255,0.06)' }}>
                {list.category}
              </span>
            )}
            {isDynamic && (
              <span className="text-[10px] text-white/40 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                dinamik
              </span>
            )}
          </div>
          <span className="text-[11px] text-[--text-secondary]">
            {isDynamic ? '250' : itemCount} film
          </span>
        </div>
      </div>
    </a>
  )
}
