import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

interface Entry {
  name: string
  year: string
  rating: string
}

async function searchTMDb(name: string, year: string): Promise<{ tmdb_id: number; title: string } | null> {
  const apiKey = process.env.TMDB_BEARER_TOKEN
  if (!apiKey) return null

  const yearParam = year ? `&year=${year}` : ''
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(name)}&language=tr-TR${yearParam}&page=1`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, accept: 'application/json' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json()
    const first = data.results?.[0]
    if (!first) return null
    return { tmdb_id: first.id, title: first.title ?? first.original_title }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 20 batch / saat
  const allowed = await rateLimit(`import:${user.id}`, 60 * 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 saat bekle.' }, { status: 429 })

  const { entries } = await req.json() as { entries: Entry[] }
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ added: 0, skipped: 0, notFound: 0, errors: [] })
  }

  const { data: existing } = await supabase
    .from('watchlist')
    .select('media_id')
    .eq('user_id', user.id)
    .eq('media_type', 'film')

  const existingIds = new Set((existing ?? []).map(w => w.media_id))

  let added = 0, skipped = 0, notFound = 0
  const errors: string[] = []
  const toInsert: { user_id: string; media_id: number; media_type: string; status: string }[] = []

  for (const entry of entries) {
    if (!entry.name) continue

    const found = await searchTMDb(entry.name, entry.year)
    if (!found) { notFound++; continue }

    if (existingIds.has(found.tmdb_id)) { skipped++; continue }

    toInsert.push({
      user_id: user.id,
      media_id: found.tmdb_id,
      media_type: 'film',
      status: 'izledim',
    })
    existingIds.add(found.tmdb_id)
    added++
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('watchlist').insert(toInsert)
    if (error) errors.push(`Kayıt hatası: ${error.message}`)
  }

  return NextResponse.json({ added, skipped, notFound, errors })
}
