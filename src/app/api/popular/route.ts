import { getPosterUrl, getPopularMovies, getPopularSeries } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

export async function GET() {
  const [mov, tv] = await Promise.all([
    getPopularMovies(1),
    getPopularSeries(1),
  ])

  const results = [
    ...(mov.results ?? []).slice(0, 3).map((m) => {
      const raw = m as typeof m & { original_title?: string; original_name?: string }
      return {
        id: raw.id,
        type: 'movie',
        title: raw.title ?? raw.name ?? '',
        original_title: raw.original_title ?? null,
        year: raw.release_date?.slice(0, 4) ?? null,
        poster: getPosterUrl(raw.poster_path, 'w342'),
      }
    }),
    ...(tv.results ?? []).slice(0, 2).map((s) => {
      const raw = s as typeof s & { original_title?: string; original_name?: string }
      return {
        id: raw.id,
        type: 'tv',
        title: raw.name ?? raw.title ?? '',
        original_title: raw.original_name ?? null,
        year: raw.first_air_date?.slice(0, 4) ?? null,
        poster: getPosterUrl(raw.poster_path, 'w342'),
      }
    }),
  ]

  return NextResponse.json({ results })
}
