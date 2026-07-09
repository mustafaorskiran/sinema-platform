import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { getCollection } from '@/lib/tmdb'

/// Mobil için /koleksiyon/[id] sayfasının aynısı (TMDb film serisi/koleksiyonu).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-koleksiyon:${ip}`, 60 * 1000, 60)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { id } = await params
  const colId = Number(id)
  if (!colId) return NextResponse.json({ error: 'Geçersiz koleksiyon' }, { status: 400 })

  try {
    const col = await getCollection(colId)
    const sorted = [...col.parts].sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''))

    return NextResponse.json({
      id: col.id,
      name: col.name,
      overview: col.overview || null,
      poster: col.poster_path ? `https://image.tmdb.org/t/p/w500${col.poster_path}` : null,
      backdrop: col.backdrop_path ? `https://image.tmdb.org/t/p/w1280${col.backdrop_path}` : null,
      parts: sorted.map(p => ({
        id: p.id,
        title: p.title,
        year: p.release_date ? p.release_date.slice(0, 4) : null,
        poster: p.poster_path ? `https://image.tmdb.org/t/p/w342${p.poster_path}` : null,
        rating: p.vote_average ?? null,
        overview: p.overview ? p.overview.slice(0, 120) : null,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Koleksiyon bulunamadı' }, { status: 404 })
  }
}
