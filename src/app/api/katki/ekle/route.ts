import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTMDbLanguage } from '@/lib/tmdb'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { tmdbId, mediaType } = await req.json()
  if (!tmdbId || !mediaType) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })

  const tmdbKey = process.env.TMDB_BEARER_TOKEN
  const endpoint = mediaType === 'film' ? 'movie' : 'tv'
  const table = mediaType === 'film' ? 'movies' : 'series'

  // Zaten var mı?
  const { data: existing } = await supabase
    .from(table)
    .select('tmdb_id')
    .eq('tmdb_id', tmdbId)
    .maybeSingle()

  if (existing) return NextResponse.json({ ok: true, alreadyExists: true, tmdbId })

  // TMDb'den çek
  const lang = await getActiveTMDbLanguage()
  let res: Response
  try {
    res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?language=${lang}`,
      { headers: { Authorization: `Bearer ${tmdbKey}` } }
    )
  } catch {
    return NextResponse.json({ error: 'TMDb hatası' }, { status: 500 })
  }
  if (!res.ok) return NextResponse.json({ error: 'TMDb hatası' }, { status: 500 })
  const m = await res.json()

  const upsertResult = mediaType === 'film'
    ? await supabase.from('movies').upsert({
        tmdb_id: m.id,
        title: m.title ?? '',
        original_title: m.original_title ?? '',
        overview: m.overview ?? '',
        poster_path: m.poster_path ?? null,
        backdrop_path: m.backdrop_path ?? null,
        release_date: m.release_date ?? null,
        release_year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
        vote_average: m.vote_average ?? 0,
        vote_count: m.vote_count ?? 0,
        popularity: m.popularity ?? 0,
        genre_ids: (m.genres ?? []).map((g: { id: number }) => g.id),
        original_language: m.original_language ?? null,
        imported_at: new Date().toISOString(),
      }, { onConflict: 'tmdb_id' })
    : await supabase.from('series').upsert({
        tmdb_id: m.id,
        name: m.name ?? '',
        original_name: m.original_name ?? '',
        overview: m.overview ?? '',
        poster_path: m.poster_path ?? null,
        backdrop_path: m.backdrop_path ?? null,
        first_air_date: m.first_air_date ?? null,
        first_air_year: m.first_air_date ? parseInt(m.first_air_date.slice(0, 4)) : null,
        vote_average: m.vote_average ?? 0,
        vote_count: m.vote_count ?? 0,
        popularity: m.popularity ?? 0,
        genre_ids: (m.genres ?? []).map((g: { id: number }) => g.id),
        original_language: m.original_language ?? null,
        imported_at: new Date().toISOString(),
      }, { onConflict: 'tmdb_id' })

  if (upsertResult.error) {
    return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 })
  }

  // Katkıyı kaydet
  await supabase.from('contributions').insert({
    user_id: user.id,
    media_type: mediaType,
    tmdb_id: tmdbId,
    title: mediaType === 'film' ? m.title : m.name,
  })

  return NextResponse.json({ ok: true, alreadyExists: false, tmdbId })
}
