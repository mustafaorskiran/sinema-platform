import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const seriesId = req.nextUrl.searchParams.get('series_id')
  const season = req.nextUrl.searchParams.get('season')
  if (!seriesId || !season) return NextResponse.json({ episodes: [] })

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${season}?language=tr-TR`,
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}`, accept: 'application/json' },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return NextResponse.json({ episodes: [] })
    const data = await res.json()
    return NextResponse.json({
      episodes: (data.episodes ?? []).map((ep: { episode_number: number; name: string; air_date?: string; still_path?: string | null }) => ({
        episode_number: ep.episode_number,
        name: ep.name,
        air_date: ep.air_date,
        still_path: ep.still_path,
      })),
    })
  } catch {
    return NextResponse.json({ episodes: [] })
  }
}
