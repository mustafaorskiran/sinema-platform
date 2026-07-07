import { getPosterUrl } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

const BASE = 'https://api.themoviedb.org/3'
const HEADERS = {
  Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  accept: 'application/json',
}

export async function GET() {
  const [movRes, tvRes] = await Promise.all([
    fetch(`${BASE}/movie/popular?language=tr-TR&page=1`, { headers: HEADERS, next: { revalidate: 3600 } }),
    fetch(`${BASE}/tv/popular?language=tr-TR&page=1`, { headers: HEADERS, next: { revalidate: 3600 } }),
  ])

  const [mov, tv] = await Promise.all([movRes.json(), tvRes.json()])

  type TmdbMovie = { id: number; title: string; original_title?: string; poster_path: string | null; release_date?: string }
  type TmdbTV = { id: number; name: string; original_name?: string; poster_path: string | null; first_air_date?: string }

  const results = [
    ...(mov.results ?? []).slice(0, 3).map((m: TmdbMovie) => ({
      id: m.id,
      type: 'movie',
      title: m.title,
      original_title: m.original_title ?? null,
      year: m.release_date?.slice(0, 4) ?? null,
      poster: getPosterUrl(m.poster_path, 'w342'),
    })),
    ...(tv.results ?? []).slice(0, 2).map((s: TmdbTV) => ({
      id: s.id,
      type: 'tv',
      title: s.name,
      original_title: s.original_name ?? null,
      year: s.first_air_date?.slice(0, 4) ?? null,
      poster: getPosterUrl(s.poster_path, 'w342'),
    })),
  ]

  return NextResponse.json({ results })
}
