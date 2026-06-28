import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dizi Takip | Sinezon',
  description: 'İzlediğin dizilerde nerede kaldığını takip et.',
}

export default async function DiziTakipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris?next=/dizi-takip')

  // Kullanıcının izlediği diziler (watchlist'te 'izliyorum' statüsü)
  const { data: watchingList } = await supabase
    .from('watchlist')
    .select('media_id, created_at')
    .eq('user_id', user.id)
    .eq('media_type', 'dizi')
    .eq('status', 'izliyorum')
    .order('created_at', { ascending: false })
    .limit(30)

  // Son izlenen bölümler
  const { data: lastWatched } = await supabase
    .from('episode_watches')
    .select('series_id, season_number, episode_number, watched_at')
    .eq('user_id', user.id)
    .order('watched_at', { ascending: false })

  // Her dizi için en son bölümü bul
  const lastEpisodeMap = new Map<number, { season: number; episode: number; date: string }>()
  for (const ew of lastWatched ?? []) {
    if (!lastEpisodeMap.has(ew.series_id)) {
      lastEpisodeMap.set(ew.series_id, {
        season: ew.season_number,
        episode: ew.episode_number,
        date: ew.watched_at,
      })
    }
  }

  // İzleme listesinden gelen diziler + episode_watches'tan gelip listede olmayan diziler
  const allSeriesIds = new Set<number>([
    ...(watchingList ?? []).map(w => w.media_id),
    ...Array.from(lastEpisodeMap.keys()),
  ])

  if (allSeriesIds.size === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">📺</p>
        <h1 className="text-2xl font-bold text-white mb-2">Henüz dizi izlemiyorsun</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Dizi sayfalarında "İzliyorum" ekle veya bölüm işaretle.
        </p>
        <Link href="/diziler"
          className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>
          Dizileri Keşfet
        </Link>
      </div>
    )
  }

  const enriched = await Promise.all(
    Array.from(allSeriesIds).slice(0, 24).map(async seriesId => {
      try {
        const detail = await getSeriesDetail(seriesId)
        const last = lastEpisodeMap.get(seriesId)
        const totalEpisodes = (detail.seasons ?? [])
          .filter((s: any) => s.season_number > 0)
          .reduce((sum: number, s: any) => sum + (s.episode_count ?? 0), 0)
        const totalSeasons = (detail.seasons ?? []).filter((s: any) => s.season_number > 0).length

        // Sıradaki bölümü hesapla
        let nextSeason: number | null = null
        let nextEpisode: number | null = null
        if (last) {
          const currentSeason = detail.seasons?.find((s: any) => s.season_number === last.season)
          if (currentSeason && last.episode < currentSeason.episode_count) {
            nextSeason = last.season
            nextEpisode = last.episode + 1
          } else if (last.season < totalSeasons) {
            nextSeason = last.season + 1
            nextEpisode = 1
          }
        }

        return {
          id: seriesId,
          title: getMediaTitle(detail),
          poster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null,
          totalSeasons,
          totalEpisodes,
          status: detail.status,
          lastSeason: last?.season ?? null,
          lastEpisode: last?.episode ?? null,
          lastWatchedAt: last?.date ?? null,
          nextSeason,
          nextEpisode,
        }
      } catch {
        return null
      }
    })
  )

  const shows = enriched.filter(Boolean) as NonNullable<typeof enriched[0]>[]
  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">📺 Dizi Takip</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {shows.length} dizi izliyorsun
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {shows.map(show => (
          <div key={show.id} className="flex gap-4 p-4 rounded-2xl" style={card}>
            <Link href={`/dizi/${show.id}`} className="shrink-0 w-16 h-24 rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              {show.poster
                ? <img src={show.poster} alt={show.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">📺</div>
              }
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/dizi/${show.id}`}
                className="font-bold text-sm text-white hover:text-[--accent] transition-colors line-clamp-1 block mb-1">
                {show.title}
              </Link>
              <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {show.totalSeasons} sezon · {show.totalEpisodes} bölüm
                {show.status === 'Ended' && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>Final</span>}
                {show.status === 'Returning Series' && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>Devam ediyor</span>}
              </p>

              {show.lastSeason && (
                <div className="mb-1.5">
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Son: <span className="text-white font-semibold">S{String(show.lastSeason).padStart(2,'0')}B{String(show.lastEpisode).padStart(2,'0')}</span>
                    {show.lastWatchedAt && (
                      <span className="ml-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        · {new Date(show.lastWatchedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {show.nextSeason && (
                <Link href={`/dizi/${show.id}/sezon/${show.nextSeason}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.15), rgba(190,18,60,0.1))', border: '1px solid rgba(225,29,72,0.25)', color: '#E11D48', minHeight: '32px' }}>
                  ▶ S{String(show.nextSeason).padStart(2,'0')}B{String(show.nextEpisode).padStart(2,'0')} izle
                </Link>
              )}

              {!show.lastSeason && (
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Henüz bölüm işaretlenmedi</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
