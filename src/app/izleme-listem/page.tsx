import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IconBookmark, IconStar, IconShuffle } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import PriorityButton from './PriorityButton'
import RandomPickButton from './RandomPickButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'İzleme Listem | SineMa' }

interface Props {
  searchParams: Promise<{ sirala?: string; tip?: string }>
}

export default async function IzlemeLisTemPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { sirala = 'eklenme', tip = 'hepsi' } = await searchParams

  let query = supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'izlemek-istiyorum')

  if (tip !== 'hepsi') query = query.eq('media_type', tip)
  if (sirala === 'oncelik') query = query.order('priority', { ascending: false }).order('created_at', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: items } = await query

  const withMedia = await Promise.all(
    (items ?? []).map(async item => {
      try {
        const media = item.media_type === 'film'
          ? await getMovieDetail(item.media_id)
          : await getSeriesDetail(item.media_id)
        return {
          ...item,
          title: getMediaTitle(media),
          year: getMediaYear(media),
          poster: getPosterUrl(media.poster_path, 'w342'),
          rating: media.vote_average,
          runtime: (media as any).runtime ?? null,
        }
      } catch {
        return { ...item, title: `#${item.media_id}`, year: '', poster: null, rating: 0, runtime: null }
      }
    })
  )

  const tabs = [
    { key: 'hepsi', label: 'Tümü' },
    { key: 'film', label: 'Filmler' },
    { key: 'dizi', label: 'Diziler' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <IconBookmark className="h-7 w-7 text-[--accent]" />
          <h1 className="text-2xl font-bold text-white">İzlemek İstiyorum</h1>
          <span className="text-sm text-[--text-secondary]">{withMedia.length} içerik</span>
        </div>
        {withMedia.length > 0 && (
          <RandomPickButton items={withMedia.map(i => ({ id: i.media_id, type: i.media_type, title: i.title, poster: i.poster }))} />
        )}
      </div>

      {/* Sekmeler + Sıralama */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 border-b border-[--border]">
          {tabs.map(t => (
            <Link key={t.key} href={`/izleme-listem?tip=${t.key}&sirala=${sirala}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tip === t.key ? 'border-[--accent] text-white' : 'border-transparent text-[--text-secondary] hover:text-white'}`}>
              {t.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-lg overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[{ key: 'eklenme', label: 'En Yeni' }, { key: 'oncelik', label: '⭐ Öncelik' }].map(s => (
            <Link key={s.key} href={`/izleme-listem?tip=${tip}&sirala=${s.key}`}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${sirala === s.key ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {withMedia.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <IconBookmark className="h-12 w-12 mx-auto mb-4 text-[--text-secondary] opacity-30" />
          <p className="font-medium text-white mb-2">Listeniz boş</p>
          <p className="text-sm text-[--text-secondary] mb-5">Film ve dizi sayfalarından "İzlemek İstiyorum" ekleyebilirsin.</p>
          <Link href="/filmler" className="inline-block bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
            Film Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {withMedia.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl transition-all hover:-translate-y-0.5 group"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Sıra */}
              <span className="text-sm font-bold text-[--text-secondary] w-6 text-center shrink-0">{idx + 1}</span>

              {/* Poster */}
              <Link href={`/${item.media_type}/${item.media_id}`} className="shrink-0">
                <div className="w-10 aspect-[2/3] rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {item.poster
                    ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full" />
                  }
                </div>
              </Link>

              {/* Bilgi */}
              <div className="flex-1 min-w-0">
                <Link href={`/${item.media_type}/${item.media_id}`}>
                  <p className="text-sm font-semibold text-white group-hover:text-[--accent] transition-colors truncate">{item.title}</p>
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[--text-secondary]">{item.year}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${item.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {item.media_type === 'film' ? 'Film' : 'Dizi'}
                  </span>
                  {item.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[--gold]">
                      <IconStar className="h-2.5 w-2.5" /> {item.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Öncelik */}
              <PriorityButton itemId={item.id} priority={item.priority ?? 0} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
