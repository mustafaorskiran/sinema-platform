import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
}

export default async function AlsoWatched({ mediaId, mediaType }: Props) {
  const { t } = await getTranslations()
  const supabase = await createClient()

  // Bu filmi değerlendirmiş kullanıcılar
  const { data: raters } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .gte('rating', 6)
    .limit(100)

  if (!raters || raters.length === 0) return null

  const userIds = raters.map(r => r.user_id)

  // Bu kullanıcıların yüksek puan verdiği diğer içerikler
  const { data: others } = await supabase
    .from('reviews')
    .select('media_id, media_type, rating')
    .in('user_id', userIds.slice(0, 50))
    .neq('media_id', mediaId)
    .gte('rating', 7)
    .order('rating', { ascending: false })
    .limit(200)

  if (!others || others.length === 0) return null

  // Frekans hesapla
  const freq = new Map<string, { media_id: number; media_type: string; count: number; avgRating: number; totalRating: number }>()
  for (const o of others) {
    const key = `${o.media_type}-${o.media_id}`
    const existing = freq.get(key)
    if (existing) {
      existing.count++
      existing.totalRating += o.rating
      existing.avgRating = existing.totalRating / existing.count
    } else {
      freq.set(key, { media_id: o.media_id, media_type: o.media_type, count: 1, avgRating: o.rating, totalRating: o.rating })
    }
  }

  // En çok izleneni al
  const topItems = [...freq.values()].sort((a, b) => b.count - a.count).slice(0, 8)
  if (topItems.length < 2) return null

  // TMDb'den detay çek
  const withDetails = await Promise.all(
    topItems.map(async item => {
      try {
        const d = item.media_type === 'film' ? await getMovieDetail(item.media_id) : await getSeriesDetail(item.media_id)
        return { ...item, title: getMediaTitle(d), year: getMediaYear(d), poster: d.poster_path ? getPosterUrl(d.poster_path, 'w342') : null }
      } catch { return null }
    })
  )
  const valid = withDetails.filter(Boolean) as any[]
  if (valid.length < 2) return null

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-white mb-4">{t('alsoWatched.title')}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {valid.map(item => (
          <Link key={`${item.media_type}-${item.media_id}`} href={`/${item.media_type}/${item.media_id}`}
            className="group relative rounded-xl overflow-hidden aspect-[2/3] hover:-translate-y-1 transition-transform duration-200"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            {item.poster
              ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-[10px] text-white font-semibold line-clamp-2">{item.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
