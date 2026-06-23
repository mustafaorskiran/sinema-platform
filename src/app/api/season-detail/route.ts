import { NextRequest, NextResponse } from 'next/server'
import { getSeasonDetail } from '@/lib/tmdb'

export async function GET(req: NextRequest) {
  const seriesId = Number(req.nextUrl.searchParams.get('series_id'))
  const seasonNumber = Number(req.nextUrl.searchParams.get('season'))

  if (!seriesId || isNaN(seasonNumber)) {
    return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
  }

  try {
    const data = await getSeasonDetail(seriesId, seasonNumber)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'TMDb hatası' }, { status: 500 })
  }
}
