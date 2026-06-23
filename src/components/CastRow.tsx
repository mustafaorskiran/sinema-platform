import Link from 'next/link'

interface Person {
  id: number
  name: string
  profile_path: string | null
  character?: string
  job?: string
}

interface Props {
  cast: Person[]
  director?: Person | null
}

export default function CastRow({ cast, director }: Props) {
  if (!director && cast.length === 0) return null

  const people: (Person & { role: string; isDirector?: boolean })[] = []

  if (director) {
    people.push({ ...director, role: 'Yönetmen', isDirector: true })
  }

  for (const c of cast.slice(0, 12)) {
    people.push({ ...c, role: c.character ?? '' })
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-5" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
        Oyuncular & Ekip
      </h2>
      <div className="home-carousel-scroll flex gap-4 overflow-x-auto pb-3">
        {people.map((p) => (
          <Link
            key={`${p.id}-${p.role}`}
            href={p.isDirector ? `/yonetmen/${p.id}` : `/oyuncu/${p.id}`}
            className="group shrink-0 w-32"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div
              className="w-32 h-44 rounded-xl overflow-hidden transition-all duration-200 group-hover:-translate-y-1"
              style={{
                background: 'var(--bg-card)',
                border: p.isDirector
                  ? '1px solid rgba(225,29,72,0.45)'
                  : '1px solid var(--border)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              {p.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w342${p.profile_path}`}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                  <span className="text-4xl font-bold text-[--text-secondary] opacity-25">
                    {p.name[0]}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 text-[12.5px] font-semibold leading-tight line-clamp-1 transition-colors group-hover:text-[--accent]" style={{ color: 'var(--text-primary)' }}>
              {p.name}
            </p>
            <p className="mt-0.5 text-[11px] line-clamp-1" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              {p.isDirector ? '🎬 Yönetmen' : p.role}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
