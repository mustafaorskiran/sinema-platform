import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getMoodBySlug } from '@/lib/moods'
import { discoverMovieRaw, discoverTVRaw, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'

/// Mobil için /ruh-hali/[slug] sayfasının aynısı.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-mood:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  const mood = getMoodBySlug(slug)
  if (!mood) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  const tab = req.nextUrl.searchParams.get('tab') === 'diziler' ? 'diziler' : 'filmler'
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('sayfa')) || 1)
  const mediaType = tab === 'filmler' ? 'film' : 'dizi'

  const baseParams = { sort_by: mood.sortBy, 'vote_count.gte': String(mood.voteCountMin), 'vote_average.gte': '6.5' }

  try {
    const data = tab === 'filmler'
      ? await discoverMovieRaw({ ...baseParams, with_genres: mood.movieGenres.join(',') }, page).catch(() => ({ results: [], total_pages: 1 }))
      : await discoverTVRaw({ ...baseParams, with_genres: mood.tvGenres.join(','), 'vote_count.gte': String(Math.floor(mood.voteCountMin / 5)) }, page).catch(() => ({ results: [], total_pages: 1 }))

    const items = (data.results ?? []).map(m => ({
      id: m.id, mediaType,
      title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'),
      year: getMediaYear(m), rating: m.vote_average ?? null,
    }))

    return NextResponse.json({ title: mood.title, subtitle: mood.subtitle, items, totalPages: Math.min(data.total_pages ?? 1, 10) })
  } catch {
    return NextResponse.json({ items: [], totalPages: 1 }, { status: 500 })
  }
}
