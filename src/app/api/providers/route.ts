import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.TMDB_BEARER_TOKEN

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'movie'
  const region = req.nextUrl.searchParams.get('region') ?? 'TR'

  try {
    const url = `${BASE_URL}/watch/providers/${type}?watch_region=${region}&language=tr-TR`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}`, accept: 'application/json' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return NextResponse.json({ results: [] })
    const data = await res.json()
    const sorted = (data.results ?? [])
      .sort((a: { display_priority: number }, b: { display_priority: number }) => a.display_priority - b.display_priority)
      .slice(0, 40)
    return NextResponse.json({ results: sorted })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
