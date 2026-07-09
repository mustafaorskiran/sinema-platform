import { getTrendingAll, getPosterUrl } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

export async function GET() {
  const trending = await getTrendingAll().catch(() => ({ results: [] as any[] }))

  const results = (trending.results ?? [])
    .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
    .slice(0, 20)
    .map((item: any) => ({
      id: item.id,
      type: item.media_type === 'tv' ? 'tv' : 'movie',
      title: item.title ?? item.name ?? '',
      original_title: item.original_title ?? item.original_name ?? null,
      year: (item.release_date ?? item.first_air_date)?.slice(0, 4) ?? null,
      poster: getPosterUrl(item.poster_path, 'w342'),
    }))

  return NextResponse.json({ results })
}
