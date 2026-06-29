import Link from 'next/link'
import Image from 'next/image'

const BASE = 'https://api.themoviedb.org/3'

async function fetchOnThisDay() {
  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const currentYear = today.getFullYear()

  const yearsAgo = [5, 10, 20, 30, 50].map(n => currentYear - n)

  const results = await Promise.all(
    yearsAgo.map(async year => {
      const dateStr = `${year}-${mm}-${dd}`
      try {
        const url = new URL(`${BASE}/discover/movie`)
        url.searchParams.set('language', 'tr-TR')
        url.searchParams.set('primary_release_date.gte', dateStr)
        url.searchParams.set('primary_release_date.lte', dateStr)
        url.searchParams.set('sort_by', 'popularity.desc')
        url.searchParams.set('vote_count.gte', '50')
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}`, accept: 'application/json' },
          next: { revalidate: 86400 },
        })
        if (!res.ok) return null
        const d = await res.json()
        const item = d.results?.[0]
        if (!item) return null
        return { ...item, yearsAgo: currentYear - year }
      } catch { return null }
    })
  )

  return results.filter(Boolean).slice(0, 4)
}

export default async function OnThisDayWidget() {
  const items = await fetchOnThisDay()
  if (items.length === 0) return null

  const today = new Date()
  const dateLabel = today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🗓️ {dateLabel}'de Geçmişte
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Bu gün vizyona giren unutulmaz filmler
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item: any) => {
          const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : null
          const title = item.title ?? item.name ?? ''

          return (
            <Link key={item.id} href={`/film/${item.id}`} className="group relative">
              <div className="aspect-[2/3] rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {poster
                  ? <Image src={poster} alt={title} width={160} height={240}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-xs p-2 text-center"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>{title}</div>
                }

                {/* Yıl badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{ background: 'rgba(225,29,72,0.9)', color: '#fff' }}>
                  {item.yearsAgo} yıl önce
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-semibold text-white line-clamp-2 leading-tight">{title}</p>
                  {item.vote_average > 0 && (
                    <p className="text-[10px] mt-0.5" style={{ color: '#D4A843' }}>★ {item.vote_average.toFixed(1)}</p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
