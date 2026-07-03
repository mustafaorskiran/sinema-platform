import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import ShelfView from './ShelfView'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ gorunum?: string; format?: string }>
}

export function getFormatLabels(t: (key: string) => string): Record<string, { label: string; emoji: string; color: string }> {
  return {
    dijital: { label: t('collection.formatDigital'), emoji: '💻', color: '#3b82f6' },
    bluray:  { label: t('collection.formatBluray'), emoji: '💿', color: '#0ea5e9' },
    dvd:     { label: t('collection.formatDvd'), emoji: '📀', color: '#8b5cf6' },
    vhs:     { label: t('collection.formatVhs'), emoji: '📼', color: '#f59e0b' },
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} — Koleksiyon` }
}

export default async function KoleksiyonPage({ params, searchParams }: Props) {
  const { username } = await params
  const { gorunum = 'raf', format: filterFormat } = await searchParams
  const supabase = await createClient()
  const { t } = await getTranslations()
  const FORMAT_LABELS = getFormatLabels(t)

  const { data: profile } = await supabase.from('profiles').select('id, username').eq('username', username).single()
  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  let query = supabase.from('collection').select('*').eq('user_id', profile.id).order('added_at', { ascending: false })
  if (filterFormat) query = query.eq('format', filterFormat)

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
        }
      } catch {
        return { ...item, title: `#${item.media_id}`, year: '', poster: null }
      }
    })
  )

  const formatCounts: Record<string, number> = {}
  for (const item of items ?? []) {
    formatCounts[item.format] = (formatCounts[item.format] ?? 0) + 1
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-[--text-secondary] mb-6">
        <Link href={`/profil/${username}`} className="hover:text-white transition-colors">← {username}</Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('profile.collectionTab.title')}</h1>
          <p className="text-[--text-secondary] text-sm mt-1">{t('profile.collectionTab.itemCount', { count: withMedia.length })}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Format filtre */}
          <div className="flex gap-1">
            <Link href={`/profil/${username}/koleksiyon?gorunum=${gorunum}`}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${!filterFormat ? 'border-[--accent] text-white bg-[--accent]/10' : 'border-[--border] text-[--text-secondary] hover:text-white'}`}>
              {t('common.all')}
            </Link>
            {Object.entries(FORMAT_LABELS).filter(([f]) => formatCounts[f]).map(([f, info]) => (
              <Link key={f} href={`/profil/${username}/koleksiyon?gorunum=${gorunum}&format=${f}`}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${filterFormat === f ? 'border-[--accent] text-white bg-[--accent]/10' : 'border-[--border] text-[--text-secondary] hover:text-white'}`}>
                {info.emoji} {info.label} ({formatCounts[f]})
              </Link>
            ))}
          </div>

          {/* Görünüm toggle */}
          <div className="flex items-center rounded-xl rounded-lg overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Link href={`/profil/${username}/koleksiyon?gorunum=raf${filterFormat ? `&format=${filterFormat}` : ''}`}
              className={`px-3 py-2 text-xs font-medium transition-colors ${gorunum === 'raf' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              🗄️ {t('profile.collectionTab.shelfView')}
            </Link>
            <Link href={`/profil/${username}/koleksiyon?gorunum=grid${filterFormat ? `&format=${filterFormat}` : ''}`}
              className={`px-3 py-2 text-xs font-medium transition-colors ${gorunum === 'grid' ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              ⊞ {t('profile.collectionTab.gridView')}
            </Link>
          </div>
        </div>
      </div>

      {withMedia.length === 0 ? (
        <div className="text-center py-20 text-[--text-secondary]">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-medium text-white mb-1">{t('profile.collectionTab.empty')}</p>
          <p className="text-sm">{t('profile.collectionTab.emptyHint')}</p>
        </div>
      ) : gorunum === 'raf' ? (
        <ShelfView items={withMedia} />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {withMedia.map(item => (
            <Link key={item.id} href={`/${item.media_type}/${item.media_id}`} className="group">
              <div className="aspect-[2/3] rounded-lg overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                {item.poster
                  ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-[10px] p-1 text-center">{item.title}</div>
                }
              </div>
              <p className="mt-1 text-[10px] text-white line-clamp-1">{item.title}</p>
              <p className="text-[9px] text-[--text-secondary]">{item.year}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
