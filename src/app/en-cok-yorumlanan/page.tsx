import React from 'react'
import Link from 'next/link'
import { IconFilm, IconMessageSquare, IconStar, IconTrendingUp, IconTv } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'En Çok Yorumlanan' }

interface Props {
  searchParams: Promise<{ tab?: string }>
}

interface RankedItem {
  media_id: number
  media_type: string
  review_count: number
  avg_rating: number
  media: Awaited<ReturnType<typeof getMovieDetail>> | null
}

export default async function EnCokYorumlananPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const activeTab = tab === 'film' ? 'film' : tab === 'dizi' ? 'dizi' : 'tumu'

  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('reviews')
    .select('media_id, media_type, rating')

  if (!rows || rows.length === 0) {
    return <EmptyState />
  }

  // Gruplama: media_id + media_type bazında sayım ve ortalama
  const grouped: Record<string, { media_id: number; media_type: string; count: number; ratingSum: number }> = {}
  for (const row of rows) {
    const key = `${row.media_type}-${row.media_id}`
    if (!grouped[key]) {
      grouped[key] = { media_id: row.media_id, media_type: row.media_type, count: 0, ratingSum: 0 }
    }
    grouped[key].count++
    grouped[key].ratingSum += row.rating
  }

  let entries = Object.values(grouped)
    .sort((a, b) => b.count - a.count)

  if (activeTab === 'film') entries = entries.filter(e => e.media_type === 'film')
  else if (activeTab === 'dizi') entries = entries.filter(e => e.media_type === 'dizi')

  const top = entries.slice(0, 25)

  // TMDb detaylarını paralel çek
  const items: RankedItem[] = await Promise.all(
    top.map(async (entry, idx) => {
      try {
        const media = entry.media_type === 'film'
          ? await getMovieDetail(entry.media_id)
          : await getSeriesDetail(entry.media_id)
        return {
          media_id: entry.media_id,
          media_type: entry.media_type,
          review_count: entry.count,
          avg_rating: entry.ratingSum / entry.count,
          media,
        }
      } catch {
        return {
          media_id: entry.media_id,
          media_type: entry.media_type,
          review_count: entry.count,
          avg_rating: entry.ratingSum / entry.count,
          media: null,
        }
      }
    })
  )

  const tabCls = (t: string) =>
    `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
      activeTab === t
        ? 'text-white'
        : 'text-[--text-secondary] hover:text-white'
    }`

  const tabStyle = (t: string): React.CSSProperties => activeTab === t
    ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
    : {}

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-8">
        <IconTrendingUp className="h-7 w-7 text-[--accent]" />
        <h1 className="text-3xl font-bold text-white">En Çok Yorumlanan</h1>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 mb-8 rounded-xl p-1 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/en-cok-yorumlanan" className={tabCls('tumu')} style={tabStyle('tumu')}>Tümü</Link>
        <Link href="/en-cok-yorumlanan?tab=film" className={tabCls('film')} style={tabStyle('film')}>
          <IconFilm className="h-4 w-4" />
          Filmler
        </Link>
        <Link href="/en-cok-yorumlanan?tab=dizi" className={tabCls('dizi')} style={tabStyle('dizi')}>
          <IconTv className="h-4 w-4" />
          Diziler
        </Link>
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const poster = item.media ? getPosterUrl(item.media.poster_path, 'w342') : null
            const title = item.media ? getMediaTitle(item.media) : `İçerik #${item.media_id}`
            const year = item.media ? getMediaYear(item.media) : null
            const href = `/${item.media_type}/${item.media_id}`
            const rank = idx + 1

            return (
              <Link
                key={`${item.media_type}-${item.media_id}`}
                href={href}
                className="flex items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5 group"
                style={{
                  background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
                  border: `1px solid ${rank <= 3 ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {/* Sıra numarası */}
                <div className={`w-8 text-center text-lg font-bold shrink-0 ${
                  rank === 1 ? 'text-yellow-400' :
                  rank === 2 ? 'text-slate-300' :
                  rank === 3 ? 'text-amber-600' :
                  'text-[--text-secondary]'
                }`}>
                  {rank}
                </div>

                {/* Poster */}
                <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {poster
                    ? <img src={poster} alt={title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs">?</div>
                  }
                </div>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-[--accent] transition-colors leading-snug line-clamp-1">
                    {title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {year && <span className="text-xs text-[--text-secondary]">{year}</span>}
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      item.media_type === 'film'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {item.media_type === 'film' ? 'Film' : 'Dizi'}
                    </span>
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 text-[--text-secondary]">
                    <IconMessageSquare className="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold text-white">{item.review_count}</span>
                    <span className="text-xs">yorum</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconStar className="h-3.5 w-3.5 fill-[--gold] text-[--gold]" />
                    <span className="text-sm font-semibold text-[--gold]">{item.avg_rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24 text-[--text-secondary]">
      <IconMessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
      <p className="text-lg font-medium">Henüz yorum yapılmamış.</p>
      <p className="text-sm mt-1">İlk yorumu yapan sen ol!</p>
      <Link
        href="/filmler"
        className="inline-block mt-6 bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
      >
        Filmlere Göz At
      </Link>
    </div>
  )
}
