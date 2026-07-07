import { createClient } from '@/lib/supabase/server'
import { getPosterUrl } from '@/lib/tmdb'
import { sanitizeSearchInput } from '@/lib/sanitizeSearch'
import { rateLimit } from '@/lib/rateLimit'
import { NextRequest, NextResponse } from 'next/server'

interface Result {
  id: number
  title: string
  original_title: string | null
  type: 'movie' | 'tv'
  poster: string | null
  year: string | null
  popularity: number
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`search:${ip}`, 60 * 1000, 30)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const q = sanitizeSearchInput(searchParams.get('q')?.trim() ?? '')
  const limit = Math.min(Number(searchParams.get('limit') ?? '6'), 20)

  if (q.length < 2) return NextResponse.json({ results: [] })

  const supabase = await createClient()
  const perType = limit + 5

  // Türkçe (title/name) veya orijinal dil (original_title/original_name) başlığına göre eşleşir
  const [{ data: movies }, { data: series }] = await Promise.all([
    supabase.from('movies')
      .select('tmdb_id, title, original_title, poster_path, release_date, popularity')
      .or(`title.ilike.%${q}%,original_title.ilike.%${q}%`)
      .order('popularity', { ascending: false })
      .limit(perType),
    supabase.from('series')
      .select('tmdb_id, name, original_name, poster_path, first_air_date, popularity')
      .or(`name.ilike.%${q}%,original_name.ilike.%${q}%`)
      .order('popularity', { ascending: false })
      .limit(perType),
  ])

  const combined: Result[] = [
    ...(movies ?? []).map((m): Result => ({
      id: m.tmdb_id,
      title: m.title,
      original_title: m.original_title ?? null,
      type: 'movie',
      poster: getPosterUrl(m.poster_path, 'w342'),
      year: (m.release_date ?? '').slice(0, 4) || null,
      popularity: m.popularity ?? 0,
    })),
    ...(series ?? []).map((s): Result => ({
      id: s.tmdb_id,
      title: s.name,
      original_title: s.original_name ?? null,
      type: 'tv',
      poster: getPosterUrl(s.poster_path, 'w342'),
      year: (s.first_air_date ?? '').slice(0, 4) || null,
      popularity: s.popularity ?? 0,
    })),
  ]

  const results = combined
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
    .map(({ popularity: _popularity, ...rest }) => rest)

  return NextResponse.json({ results })
}
