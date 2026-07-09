import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getActiveTMDbLanguage } from '@/lib/tmdb'

const BASE = 'https://api.themoviedb.org/3'

async function fetchMostAnticipated(type: 'movie' | 'tv', lang: string) {
  const today = new Date().toISOString().slice(0, 10)
  const inOneYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)

  const dateGte = type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte'
  const dateLte = type === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte'

  const url = new URL(`${BASE}/discover/${type}`)
  url.searchParams.set('language', lang)
  url.searchParams.set('region', 'TR')
  url.searchParams.set(dateGte, today)
  url.searchParams.set(dateLte, inOneYear)
  url.searchParams.set('sort_by', 'popularity.desc')
  url.searchParams.set('page', '1')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`, accept: 'application/json' },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).slice(0, 20)
}

/// Mobil için /en-beklenen sayfasının aynısı.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-en-beklenen:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const tip = req.nextUrl.searchParams.get('tip') === 'dizi' ? 'dizi' : 'film'
  const isMovie = tip === 'film'
  const lang = await getActiveTMDbLanguage()

  try {
    const results = await fetchMostAnticipated(isMovie ? 'movie' : 'tv', lang)
    const items = results.map((item: { id: number; title?: string; name?: string; release_date?: string; first_air_date?: string; poster_path: string | null; overview?: string; popularity: number }) => ({
      id: item.id,
      mediaType: tip,
      title: item.title ?? item.name ?? '',
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : null,
      releaseDate: item.release_date ?? item.first_air_date ?? null,
      overview: item.overview ?? null,
      popularity: Math.round(item.popularity ?? 0),
    }))
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
