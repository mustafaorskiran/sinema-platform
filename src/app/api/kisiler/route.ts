import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getPopularPeople, getProfileUrl } from '@/lib/tmdb'

/// Mobil "Kişiler" gözatma ekranı için — popüler oyuncu/yönetmenler,
/// sayfalanmış. film/[id], dizi/[id] ile aynı desen.
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-kisiler:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('sayfa')) || 1)

  try {
    const data = await getPopularPeople(page)
    const results = (data.results ?? [])
      .filter(p => p.profile_path)
      .map(p => ({
        id: p.id,
        name: p.name,
        knownForDepartment: p.known_for_department ?? null,
        profile: getProfileUrl(p.profile_path, 'w185'),
      }))
    return NextResponse.json({ results, total_pages: data.total_pages ?? 1 })
  } catch {
    return NextResponse.json({ results: [], total_pages: 1 }, { status: 500 })
  }
}
