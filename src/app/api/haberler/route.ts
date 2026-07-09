import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

/// Mobil Haberler ekranı için — web'in /haberler sayfasındaki RSS
/// parse mantığının aynısı, JSON olarak.
interface NewsItem {
  title: string
  link: string
  pubDate: string
  description?: string
  source: string
}

async function fetchRSS(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) ?? []
    return items
      .slice(0, 10)
      .map(item => ({
        title: (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ?? item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() ?? '',
        link: (item.match(/<link>(.*?)<\/link>/) ?? item.match(/<link\s*\/?>[\s\S]*?href="(.*?)"/))?.[1]?.trim() ?? '',
        pubDate: (item.match(/<pubDate>(.*?)<\/pubDate>/))?.[1]?.trim() ?? '',
        description: (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ?? item.match(/<description>([\s\S]*?)<\/description>/))?.[1]
          ?.replace(/<[^>]*>/g, '').trim().slice(0, 150) ?? '',
        source: sourceName,
      }))
      .filter(i => i.title && i.link)
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const allowed = await rateLimit(`api-haberler:${ip}`, 60 * 1000, 20)
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })

  const [beyazperde, hollywoodReporter, variety] = await Promise.all([
    fetchRSS('https://www.beyazperde.com/rss/haberler.rss', 'Beyazperde'),
    fetchRSS('https://www.hollywoodreporter.com/c/movies/feed/', 'Hollywood Reporter'),
    fetchRSS('https://variety.com/feed/', 'Variety'),
  ])

  const allNews = [...beyazperde, ...hollywoodReporter, ...variety]
    .sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0
      return db - da
    })
    .slice(0, 30)

  return NextResponse.json({ news: allNews })
}
