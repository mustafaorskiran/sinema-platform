import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getActiveTMDbLanguage } from '@/lib/tmdb'
import { rateLimit } from '@/lib/rateLimit'

async function getAuthedClient(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await client.auth.getUser(authHeader.slice(7))
    return { supabase: client, user }
  }
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET(req: NextRequest) {
  const { supabase, user } = await getAuthedClient(req)
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const allowed = await rateLimit(`katki-arama:${user.id}`, 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const tip = searchParams.get('tip') ?? 'film'
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const tmdbKey = process.env.TMDB_BEARER_TOKEN
  const endpoint = tip === 'film' ? 'movie' : 'tv'
  const lang = await getActiveTMDbLanguage()
  let res: Response
  try {
    res = await fetch(
      `https://api.themoviedb.org/3/search/${endpoint}?query=${encodeURIComponent(q)}&language=${lang}&page=1`,
      { headers: { Authorization: `Bearer ${tmdbKey}` }, next: { revalidate: 0 } }
    )
  } catch {
    return NextResponse.json({ results: [] })
  }
  if (!res.ok) return NextResponse.json({ results: [] })
  const data = await res.json()
  const tmdbResults = (data.results ?? []).slice(0, 12)
  const tmdbIds = tmdbResults.map((r: any) => r.id)

  // Hangilerinin zaten local DB'de olduğunu kontrol et
  const table = tip === 'film' ? 'movies' : 'series'
  const { data: existing } = await supabase
    .from(table)
    .select('tmdb_id')
    .in('tmdb_id', tmdbIds)

  const existingSet = new Set((existing ?? []).map(e => e.tmdb_id))

  const results = tmdbResults.map((r: any) => ({
    id: r.id,
    title: r.title ?? r.name ?? '',
    originalTitle: r.original_title ?? r.original_name ?? '',
    overview: r.overview ?? '',
    posterPath: r.poster_path ?? null,
    year: (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
    voteAverage: r.vote_average ?? 0,
    exists: existingSet.has(r.id),
  }))

  return NextResponse.json({ results })
}
