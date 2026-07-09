import { getActiveTMDbLanguage } from '@/lib/tmdb'
import { NextResponse } from 'next/server'

const BASE = 'https://api.themoviedb.org/3'

export async function GET() {
  const lang = await getActiveTMDbLanguage()
  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const currentYear = today.getFullYear()

  const yearsAgo = [5, 10, 20, 30, 50].map((n) => currentYear - n)

  const results = await Promise.all(
    yearsAgo.map(async (year) => {
      const dateStr = `${year}-${mm}-${dd}`
      try {
        const url = new URL(`${BASE}/discover/movie`)
        url.searchParams.set('language', lang)
        url.searchParams.set('primary_release_date.gte', dateStr)
        url.searchParams.set('primary_release_date.lte', dateStr)
        url.searchParams.set('sort_by', 'popularity.desc')
        url.searchParams.set('vote_count.gte', '50')
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`, accept: 'application/json' },
          next: { revalidate: 86400 },
        })
        if (!res.ok) return null
        const d = await res.json()
        const item = d.results?.[0]
        if (!item) return null
        return {
          id: item.id,
          title: item.title ?? item.name ?? '',
          poster_path: item.poster_path ?? null,
          vote_average: item.vote_average ?? null,
          years_ago: currentYear - year,
        }
      } catch {
        return null
      }
    })
  )

  return NextResponse.json({ results: results.filter(Boolean).slice(0, 4) })
}
