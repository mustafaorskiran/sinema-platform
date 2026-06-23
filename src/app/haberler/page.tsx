import type { Metadata } from 'next'
import { IconRss, IconClock, IconGlobe } from '@/components/icons'
import Link from 'next/link'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Sinema Haberleri | Sinezon',
  description: 'Beyazperde, Hollywood Reporter ve Variety\'den en güncel sinema haberleri.',
}

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description?: string
  source: string
}

async function fetchRSS(
  url: string,
  sourceName: string
): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) ?? []
    return items
      .slice(0, 10)
      .map(item => ({
        title:
          (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ??
            item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() ?? '',
        link:
          (item.match(/<link>(.*?)<\/link>/) ??
            item.match(/<link\s*\/?>[\s\S]*?href="(.*?)"/))?.[1]?.trim() ?? '',
        pubDate:
          (item.match(/<pubDate>(.*?)<\/pubDate>/))?.[1]?.trim() ?? '',
        description:
          (item.match(
            /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/
          ) ??
            item.match(/<description>([\s\S]*?)<\/description>/))?.[1]
            ?.replace(/<[^>]*>/g, '')
            .trim()
            .slice(0, 150) ?? '',
        source: sourceName,
      }))
      .filter(i => i.title && i.link)
  } catch {
    return []
  }
}

function formatRelativeTime(pubDate: string): string {
  if (!pubDate) return ''
  try {
    const date = new Date(pubDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return 'Az önce'
    if (diffMin < 60) return `${diffMin} dakika önce`
    if (diffHour < 24) return `${diffHour} saat önce`
    if (diffDay < 7) return `${diffDay} gün önce`
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return pubDate
  }
}

function isYerliHaber(item: NewsItem): boolean {
  const text = (item.title + ' ' + (item.description ?? '') + ' ' + item.source).toLowerCase()
  const yerliKeywords = [
    'türk', 'türkiye', 'beyazperde', 'yerli', 'istanbul', 'ankara',
    'ulusal', 'altın portakal', 'akbank', 'türkish', 'trt', 'netflix türkiye'
  ]
  return yerliKeywords.some(kw => text.includes(kw))
}

interface PageProps {
  searchParams: Promise<{ kategori?: string }>
}

export default async function HaberlerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const kategori = params.kategori ?? 'tumu'

  const [beyazperde, hollywoodReporter, variety] = await Promise.all([
    fetchRSS('https://www.beyazperde.com/rss/haberler.rss', 'Beyazperde'),
    fetchRSS('https://www.hollywoodreporter.com/c/movies/feed/', 'Hollywood Reporter'),
    fetchRSS('https://variety.com/feed/', 'Variety'),
  ])

  const allNews: NewsItem[] = [...beyazperde, ...hollywoodReporter, ...variety]
    .sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0
      return db - da
    })
    .slice(0, 30)

  const filteredNews =
    kategori === 'yerli'
      ? allNews.filter(isYerliHaber)
      : kategori === 'yabanci'
        ? allNews.filter(item => !isYerliHaber(item))
        : allNews

  const sourceColors: Record<string, string> = {
    Beyazperde: 'var(--accent)',
    'Hollywood Reporter': '#c8a028',
    Variety: '#6b49d6',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <IconRss className="h-6 w-6" style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Sinema Haberleri
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Beyazperde, Hollywood Reporter ve Variety'den en güncel haberler
        </p>
      </div>

      {/* Kategori Filtreleri */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'tumu', label: 'Tümü' },
          { id: 'yerli', label: 'Yerli' },
          { id: 'yabanci', label: 'Yabancı' },
        ].map(cat => {
          const isActive = cat.id === kategori
          return (
            <Link
              key={cat.id}
              href={`/haberler?kategori=${cat.id}`}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={
                isActive
                  ? {
                      background: 'var(--accent)',
                      color: '#fff',
                    }
                  : {
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }
              }
            >
              {cat.label}
            </Link>
          )
        })}
        <span className="ml-auto text-xs self-center" style={{ color: 'var(--text-secondary)' }}>
          {filteredNews.length} haber
        </span>
      </div>

      {/* Haber Listesi */}
      {filteredNews.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredNews.map((item, i) => {
            const sourceColor = sourceColors[item.source] ?? 'var(--text-secondary)'
            return (
              <a
                key={`${item.link}-${i}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl p-4 transition-all duration-200 hover:border-[--accent]/30"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-[15px] font-semibold leading-snug mb-1 line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </h2>
                    {item.description && (
                      <p
                        className="text-[13px] leading-relaxed line-clamp-2 mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.description}
                        {item.description.length >= 150 ? '…' : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="font-semibold" style={{ color: sourceColor }}>
                        {item.source}
                      </span>
                      {item.pubDate && (
                        <>
                          <span style={{ color: 'var(--border)' }}>·</span>
                          <span
                            className="flex items-center gap-1"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <IconClock className="h-3 w-3" />
                            {formatRelativeTime(item.pubDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <IconGlobe
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: 'var(--text-secondary)', opacity: 0.5 }}
                  />
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <IconRss className="h-12 w-12 mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            Bu kategoride haber bulunamadı.
          </p>
        </div>
      )}
    </div>
  )
}
