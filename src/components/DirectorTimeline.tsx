import Link from 'next/link'
import Image from 'next/image'

interface Credit {
  id: number
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  poster_path?: string | null
  vote_average?: number
  media_type?: string
  job?: string
  character?: string
}

interface Props {
  credits: Credit[]
  personName: string
}

export default function DirectorTimeline({ credits, personName }: Props) {
  // Yönetmen/yapımcı rollerini filtrele, tarihe göre sırala
  const directorCredits = credits
    .filter(c => c.release_date || c.first_air_date)
    .sort((a, b) => {
      const dateA = a.release_date ?? a.first_air_date ?? ''
      const dateB = b.release_date ?? b.first_air_date ?? ''
      return dateA.localeCompare(dateB)
    })

  if (directorCredits.length === 0) return null

  // Yıl bazında grupla
  const byYear: Record<string, Credit[]> = {}
  for (const c of directorCredits) {
    const year = (c.release_date ?? c.first_air_date ?? '????').slice(0, 4)
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(c)
  }

  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a)).slice(0, 15)

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        🎬 Kariyer Zaman Çizelgesi
      </h2>

      <div className="relative pl-4" style={{ borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
        {years.map(year => (
          <div key={year} className="mb-8 relative">
            {/* Yıl marker */}
            <div className="absolute -left-[21px] flex items-center justify-center w-8 h-8 rounded-full text-xs font-black text-white"
              style={{ background: 'var(--accent)', top: '0' }}>
              {year.slice(2)}
            </div>

            <div className="ml-6">
              <p className="text-sm font-bold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{year}</p>
              <div className="flex flex-wrap gap-2">
                {byYear[year].map((c, i) => {
                  const title = c.title ?? c.name ?? ''
                  const isMovie = !c.media_type || c.media_type === 'movie'
                  const href = `/${isMovie ? 'film' : 'dizi'}/${c.id}`
                  const poster = c.poster_path
                    ? `https://image.tmdb.org/t/p/w92${c.poster_path}`
                    : null

                  return (
                    <Link key={`${c.id}-${i}`} href={href}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:-translate-y-0.5 group"
                      style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)', maxWidth: '220px' }}>
                      {poster && (
                        <div className="w-7 h-10 rounded overflow-hidden shrink-0"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                          <Image src={poster} alt={title} width={28} height={40} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white group-hover:text-[--accent] transition-colors line-clamp-1">{title}</p>
                        {c.vote_average && c.vote_average > 0 && (
                          <p className="text-[10px] mt-0.5" style={{ color: '#D4A843' }}>★ {c.vote_average.toFixed(1)}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
