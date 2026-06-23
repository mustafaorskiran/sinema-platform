import { NextResponse } from 'next/server'
import { getPopularPeople } from '@/lib/tmdb'

export async function GET() {
  try {
    const data = await getPopularPeople()
    const actors = data.results
      .filter(p => p.profile_path)
      .slice(0, 32)
    return NextResponse.json(actors)
  } catch {
    return NextResponse.json([])
  }
}
