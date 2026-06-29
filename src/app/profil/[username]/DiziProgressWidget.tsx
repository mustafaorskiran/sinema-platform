import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

interface Props {
  userId: string
  username: string
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function getSeriesInfo(seriesId: number) {
  try {
    const res = await fetch(`${TMDB_BASE}/tv/${seriesId}?language=tr-TR`, {
      headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}`, accept: 'application/json' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export default async function DiziProgressWidget({ userId, username }: Props) {
  const supabase = await createClient()

  // episode_watches tablosundan izlenen bölümleri seri bazında say
  const { data: watches } = await supabase
    .from('episode_watches')
    .select('series_id, season_number, episode_number')
    .eq('user_id', userId)
    .order('series_id')

  if (!watches || watches.length === 0) return null

  // Her seri için unique izlenen bölüm sayısı
  const seriesMap = new Map<number, Set<string>>()
  for (const w of watches) {
    if (!seriesMap.has(w.series_id)) seriesMap.set(w.series_id, new Set())
    seriesMap.get(w.series_id)!.add(`${w.season_number}x${w.episode_number}`)
  }

  // En çok ilerleme kaydedilen seriler
  const sortedSeries = Array.from(seriesMap.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 6)

  if (sortedSeries.length === 0) return null

  // TMDb'den seri detayları
  const seriesDetails = await Promise.all(
    sortedSeries.map(async ([id, episodes]) => {
      const info = await getSeriesInfo(id)
      return {
        id,
        watchedEpisodes: episodes.size,
        total: info?.number_of_episodes ?? 0,
        name: info?.name ?? info?.original_name ?? `Dizi #${id}`,
        poster: info?.poster_path ?? null,
        status: info?.status ?? '',
      }
    })
  )

  const validSeries = seriesDetails.filter(s => s.total > 0)

  if (validSeries.length === 0) return null

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          📺 Dizi İlerlemesi
        </h2>
        <Link href={`/dizi-takip`}
          className="text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Tümünü gör →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {validSeries.map(s => {
          const pct = s.total > 0 ? Math.min(100, Math.round((s.watchedEpisodes / s.total) * 100)) : 0
          const isFinished = pct >= 100
          const poster = s.poster ? `https://image.tmdb.org/t/p/w92${s.poster}` : null

          return (
            <Link key={s.id} href={`/dizi/${s.id}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Poster */}
              <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {poster
                  ? <Image src={poster} alt={s.name} width={40} height={56} className="w-full h-full object-cover" />
                  : <div className="w-full h-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                }
              </div>

              {/* Bilgi + Progress */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-[--accent] transition-colors line-clamp-1 mb-1">
                  {s.name}
                </p>

                {/* Progress bar */}
                <div className="relative h-1.5 rounded-full overflow-hidden mb-1"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isFinished
                        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                        : 'linear-gradient(90deg, var(--accent), #f97316)',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {s.watchedEpisodes}/{s.total} bölüm
                  </p>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: isFinished ? '#4ade80' : 'rgba(255,255,255,0.4)' }}
                  >
                    {isFinished ? '✓ Bitti' : `%${pct}`}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
