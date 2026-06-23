import { getPosterUrl } from '@/lib/tmdb'
import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.themoviedb.org/3'

type RawResult = {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  media_type: string
}

async function tmdbSearch(query: string, language: string): Promise<{ results: RawResult[] }> {
  const url = new URL(`${BASE_URL}/search/multi`)
  url.searchParams.set('query', query)
  url.searchParams.set('language', language)
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      accept: 'application/json',
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) return { results: [] }
  return res.json()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(Number(searchParams.get('limit') ?? '6'), 20)

  if (q.length < 2) return NextResponse.json({ results: [] })

  // Türkçe + orijinal dil aramasını paralel çalıştır
  const [trData, enData] = await Promise.all([
    tmdbSearch(q, 'tr-TR').catch(() => ({ results: [] as RawResult[] })),
    tmdbSearch(q, 'en-US').catch(() => ({ results: [] as RawResult[] })),
  ])

  // Merge + dedup: TR sonuçları öncelikli (lokalize başlık için)
  const seen = new Set<number>()
  const merged: RawResult[] = []
  for (const r of [...(trData.results ?? []), ...(enData.results ?? [])]) {
    if ((r.media_type === 'movie' || r.media_type === 'tv') && !seen.has(r.id)) {
      seen.add(r.id)
      merged.push(r)
    }
  }

  const results = merged.slice(0, limit).map((r) => ({
    id: r.id,
    title: r.title || r.name || '',
    original_title: r.original_title || r.original_name || null,
    type: r.media_type,
    poster: getPosterUrl(r.poster_path, 'w342'),
    year: (r.release_date || r.first_air_date || '').substring(0, 4) || null,
  }))

  return NextResponse.json({ results })
}
