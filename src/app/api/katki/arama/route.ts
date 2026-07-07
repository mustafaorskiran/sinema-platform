import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const tip = searchParams.get('tip') ?? 'film'
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const tmdbKey = process.env.TMDB_BEARER_TOKEN
  const endpoint = tip === 'film' ? 'movie' : 'tv'
  const res = await fetch(
    `https://api.themoviedb.org/3/search/${endpoint}?query=${encodeURIComponent(q)}&language=tr-TR&page=1`,
    { headers: { Authorization: `Bearer ${tmdbKey}` }, next: { revalidate: 0 } }
  )
  if (!res.ok) return NextResponse.json({ results: [] })
  const data = await res.json()
  const tmdbResults = (data.results ?? []).slice(0, 12)

  const supabase = await createClient()
  const tmdbIds = tmdbResults.map((r: any) => r.id)

  // Hangilerinin zaten local DB'de olduğunu kontrol et
  const table = tip === 'film' ? 'movies' : 'series'
  const { data: existing } = await supabase
    .from(table)
    .select('tmdb_id')
    .in('tmdb_id', tmdbIds)

  const existingSet = new Set((existing ?? []).map(e => e.tmdb_id))

  const results = tmdbResults.map((r: any) => ({
    id: r.id,
    title: r.title ?? r.name ?? '',
    originalTitle: r.original_title ?? r.original_name ?? '',
    overview: r.overview ?? '',
    posterPath: r.poster_path ?? null,
    year: (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
    voteAverage: r.vote_average ?? 0,
    exists: existingSet.has(r.id),
  }))

  return NextResponse.json({ results })
}
