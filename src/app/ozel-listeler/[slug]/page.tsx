import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CURATED_LISTS } from '@/lib/curated-lists'
import {
  discoverMovieRaw,
  discoverTVRaw,
  getTopRatedMoviesRaw,
  getTopRatedTVRaw,
  getPosterUrl,
  getMediaTitle,
  getMediaYear,
} from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sayfa?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const list = CURATED_LISTS.find(l => l.slug === slug)
  return { title: list ? `${list.emoji} ${list.title}` : 'Özel Liste' }
}

async function fetchListItems(list: (typeof CURATED_LISTS)[number], page: number) {
  switch (list.endpoint) {
    case 'discover_movie':
      return discoverMovieRaw(list.params, page)
    case 'discover_tv':
      return discoverTVRaw(list.params, page)
    case 'top_rated_movie':
      return getTopRatedMoviesRaw(list.params, page)
    case 'top_rated_tv':
      return getTopRatedTVRaw(list.params, page)
  }
}

export default async function OzelListeDetayPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)

  const list = CURATED_LISTS.find(l => l.slug === slug)
  if (!list) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const data = await fetchListItems(list, page).catch(() => ({ results: [], total_pages: 1 }))
  const items = data.results ?? []
  const totalPages = Math.min(data.total_pages ?? 1, 10)

  // Kullanıcının watchlist durumu
  let watchlistSet = new Set<string>()
  if (user) {
    const mediaIds = items.map(m => m.id)
    const { data: wl } = await supabase
      .from('watchlist')
      .select('media_id, status')
      .eq('user_id', user.id)
      .eq('media_type', list.mediaType)
      .in('media_id', mediaIds)
    for (const w of wl ?? []) watchlistSet.add(`${w.media_id}-${w.status}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[--text-secondary] mb-6">
        <Link href="/ozel-listeler" className="hover:text-white transition-colors">← Özel Listeler</Link>
      </div>

      {/* Başlık */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">{list.emoji}</span>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{list.title}</h1>
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
              list.mediaType === 'film'
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-purple-500/15 text-purple-400'
            }`}>
              {list.mediaType === 'film' ? '🎬 Film' : '📺 Dizi'}
            </span>
          </div>
          <p className="text-[--text-secondary] text-sm mt-1">{list.description}</p>
        </div>
      </div>

      {/* Sayfa bilgisi */}
      <p className="text-xs text-[--text-secondary] mb-6">
        Sayfa {page} / {totalPages} · {items.length} sonuç gösteriliyor
      </p>

      {/* İçerik ızgarası */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {items.map((item, idx) => {
          const poster = getPosterUrl(item.poster_path, 'w342')
          const title = getMediaTitle(item)
          const year = getMediaYear(item)
          const rank = (page - 1) * 20 + idx + 1
          const inWatchlist = watchlistSet.has(`${item.id}-izledim`) || watchlistSet.has(`${item.id}-izlemek-istiyorum`)

          return (
            <Link
              key={item.id}
              href={`/${list.mediaType}/${item.id}`}
              className="group relative"
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[--bg-card] border border-[--border] group-hover:border-[--accent]/50 transition-colors relative">
                {poster
                  ? <img src={poster} alt={title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center leading-tight">{title}</div>
                }
                {/* Sıra numarası */}
                <div className="absolute top-2 left-2 bg-black/80 rounded-md px-1.5 py-0.5">
                  <span className="text-[10px] font-bold text-white">#{rank}</span>
                </div>
                {/* TMDb puanı */}
                {item.vote_average > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5">
                    <span className="text-[10px] font-bold text-[--gold]">★ {item.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {/* Watchlist işareti */}
                {inWatchlist && (
                  <div className="absolute top-2 right-2 text-sm">✓</div>
                )}
              </div>
              <p className="mt-1.5 text-xs text-white font-medium line-clamp-1 group-hover:text-[--accent] transition-colors">{title}</p>
              <p className="text-[10px] text-[--text-secondary]">{year}</p>
            </Link>
          )
        })}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {page > 1 && (
            <Link
              href={`/ozel-listeler/${slug}?sayfa=${page - 1}`}
              className="px-4 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors"
            >
              ← Önceki
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i
            if (p > totalPages) return null
            return (
              <Link
                key={p}
                href={`/ozel-listeler/${slug}?sayfa=${p}`}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  p === page
                    ? 'bg-[--accent] border-[--accent] text-white'
                    : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white'
                }`}
              >
                {p}
              </Link>
            )
          })}
          {page < totalPages && (
            <Link
              href={`/ozel-listeler/${slug}?sayfa=${page + 1}`}
              className="px-4 py-2 rounded-lg bg-[--bg-card] border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
