import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'

/// Mobil için — web'in /en-cok-yorumlanan sayfasındaki aynı gruplama
/// mantığı, server-side hesaplanıp JSON olarak döner.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-en-cok-yorumlanan:${ip}`, 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const tab = req.nextUrl.searchParams.get('tab') ?? 'tumu'
  const supabase = await createClient()

  const { data: rows } = await supabase.from('reviews').select('media_id, media_type, rating')
  if (!rows || rows.length === 0) return NextResponse.json({ items: [] })

  const grouped: Record<string, { media_id: number; media_type: string; count: number; ratingSum: number }> = {}
  for (const row of rows) {
    const key = `${row.media_type}-${row.media_id}`
    if (!grouped[key]) grouped[key] = { media_id: row.media_id, media_type: row.media_type, count: 0, ratingSum: 0 }
    grouped[key].count++
    grouped[key].ratingSum += row.rating
  }

  let entries = Object.values(grouped).sort((a, b) => b.count - a.count)
  if (tab === 'film') entries = entries.filter(e => e.media_type === 'film')
  else if (tab === 'dizi') entries = entries.filter(e => e.media_type === 'dizi')

  const top = entries.slice(0, 25)

  const items = await Promise.all(top.map(async entry => {
    try {
      const media = entry.media_type === 'film' ? await getMovieDetail(entry.media_id) : await getSeriesDetail(entry.media_id)
      return {
        id: entry.media_id,
        mediaType: entry.media_type,
        reviewCount: entry.count,
        avgRating: entry.ratingSum / entry.count,
        title: getMediaTitle(media),
        poster: getPosterUrl(media.poster_path, 'w342'),
        year: getMediaYear(media),
      }
    } catch {
      return {
        id: entry.media_id, mediaType: entry.media_type, reviewCount: entry.count,
        avgRating: entry.ratingSum / entry.count, title: `#${entry.media_id}`, poster: null, year: null,
      }
    }
  }))

  return NextResponse.json({ items })
}
