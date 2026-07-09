import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

/// Mobil Film Quiz için poster listesi — web'in /quiz sayfasındaki
/// fetchQuizFilms mantığının aynısı.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-quiz-filmler:${ip}`, 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const zorluk = req.nextUrl.searchParams.get('zorluk') ?? 'orta'
  const apiKey = process.env.TMDB_BEARER_TOKEN
  if (!apiKey) return NextResponse.json({ films: [] }, { status: 503 })

  const headers = { Authorization: `Bearer ${apiKey}`, accept: 'application/json' }
  const base = 'https://api.themoviedb.org/3'

  let url: string
  if (zorluk === 'kolay') {
    const page = Math.floor(Math.random() * 2) + 1
    url = `${base}/movie/popular?language=tr-TR&page=${page}`
  } else if (zorluk === 'zor') {
    const page = Math.floor(Math.random() * 5) + 4
    url = `${base}/movie/top_rated?language=tr-TR&page=${page}`
  } else {
    const page = Math.floor(Math.random() * 5) + 3
    url = `${base}/movie/popular?language=tr-TR&page=${page}`
  }

  try {
    const res = await fetch(url, { headers, next: { revalidate: 3600 } })
    if (!res.ok) return NextResponse.json({ films: [] })
    const data = await res.json()
    const films = (data.results ?? [])
      .filter((f: { poster_path?: string; title?: string }) => f.poster_path && f.title)
      .map((f: { id: number; title: string; poster_path: string }) => ({
        id: f.id, title: f.title, poster: `https://image.tmdb.org/t/p/w500${f.poster_path}`,
      }))
    return NextResponse.json({ films })
  } catch {
    return NextResponse.json({ films: [] }, { status: 500 })
  }
}
