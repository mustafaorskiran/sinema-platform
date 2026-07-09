import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rateLimit'
import { getActiveTMDbLanguage } from '@/lib/tmdb'

const MAX_ENTRIES = 2000

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

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthedClient(req)
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  // Rate limit: 20 batch / saat (letterboxd import ile tutarlı)
  const allowed = await rateLimit(`import:${user.id}`, 60 * 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 saat bekle.' }, { status: 429 })

  const { entries } = await req.json() as {
    entries: { imdbId: string; rating?: string; dateRated?: string; titleType?: string; title?: string }[]
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ added: 0, skipped: 0, notFound: 0, errors: [] })
  }
  if (entries.length > MAX_ENTRIES) {
    return NextResponse.json({ error: `En fazla ${MAX_ENTRIES} kayıt aktarılabilir.` }, { status: 400 })
  }

  const tmdbKey = process.env.TMDB_BEARER_TOKEN
  const lang = await getActiveTMDbLanguage()
  let added = 0, skipped = 0, notFound = 0
  const errors: string[] = []

  for (const entry of entries) {
    try {
      const findRes = await fetch(
        `https://api.themoviedb.org/3/find/${entry.imdbId}?external_source=imdb_id&language=${lang}`,
        { headers: { Authorization: `Bearer ${tmdbKey}` }, next: { revalidate: 86400 } }
      )
      if (!findRes.ok) { notFound++; continue }
      const findData = await findRes.json()

      const movie = findData.movie_results?.[0]
      const tv = findData.tv_results?.[0]
      const media = movie ?? tv
      if (!media) { notFound++; continue }

      const mediaType = movie ? 'film' : 'dizi'
      const mediaId = media.id
      const rating = entry.rating ? parseFloat(entry.rating) : null

      const { data: existing } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .maybeSingle()

      if (existing) { skipped++; continue }

      await supabase.from('watchlist').insert({
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        status: 'izledim',
      })

      if (rating && rating >= 1 && rating <= 10) {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .eq('media_type', mediaType)
          .maybeSingle()

        if (!existingReview) {
          await supabase.from('reviews').insert({
            user_id: user.id,
            media_id: mediaId,
            media_type: mediaType,
            rating,
            content: null,
          })
        }
      }

      added++
    } catch (err) {
      errors.push(`${entry.title ?? entry.imdbId}: işlenemedi`)
    }
  }

  return NextResponse.json({ added, skipped, notFound, errors })
}
