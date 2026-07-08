import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { getActiveTMDbLanguage } from '@/lib/tmdb'
import { IconGem, IconTomato, IconZap, IconStarFilled, IconFire } from '@/components/icons'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Keşfet — Gizli Mücevherler & Hate Watch | Sinezon',
  description: 'Gizli mücevherler, meşhur kötü filmler ve niche yapımları keşfet.',
}

const BASE = 'https://api.themoviedb.org/3'

async function tmdb(path: string, params: Record<string, string>, lang: string) {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('language', lang)
  url.searchParams.set('page', '1')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`, accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const d = await res.json()
    return (d.results ?? []).slice(0, 12)
  } catch { return [] }
}

interface Category {
  key: string
  Icon: typeof IconGem
  titleKey: string
  descKey: string
  color: string
  bg: string
  border: string
  params: Record<string, string>
}

const CATEGORIES: Category[] = [
  {
    key: 'gizli',
    Icon: IconGem,
    titleKey: 'discover.gizliTitle',
    descKey: 'discover.gizliDesc',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
    params: { 'vote_average.gte': '7.5', 'vote_count.gte': '100', 'vote_count.lte': '2000', sort_by: 'vote_average.desc' },
  },
  {
    key: 'hate',
    Icon: IconTomato,
    titleKey: 'discover.hateTitle',
    descKey: 'discover.hateDesc',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.2)',
    params: { 'vote_average.lte': '5.5', 'vote_average.gte': '1', 'vote_count.gte': '5000', sort_by: 'popularity.desc' },
  },
  {
    key: 'surprise',
    Icon: IconZap,
    titleKey: 'discover.surpriseTitle',
    descKey: 'discover.surpriseDesc',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.2)',
    params: {
      'vote_average.gte': '7.0',
      'vote_count.gte': '200',
      'primary_release_date.gte': `${new Date().getFullYear()}-01-01`,
      sort_by: 'vote_average.desc',
    },
  },
]

export default async function KesfetPage() {
  const { t } = await getTranslations()
  const tmdbLang = await getActiveTMDbLanguage()
  const results = await Promise.all(
    CATEGORIES.map(cat =>
      tmdb('/discover/movie', cat.params, tmdbLang).then(items => ({ ...cat, items }))
    )
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('discover.title')}</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('discover.subtitle')}
        </p>
      </div>

      <div className="space-y-12">
        {results.map(cat => (
          <section key={cat.key}>
            {/* Kategori Başlık */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color }}>
                <cat.Icon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t(cat.titleKey)}</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t(cat.descKey)}</p>
              </div>
            </div>

            {/* Film Kartları */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {cat.items.map((item: any) => {
                const title = item.title ?? item.name ?? ''
                const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
                const poster = item.poster_path
                  ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                  : null

                return (
                  <Link key={item.id} href={`/film/${item.id}`} className="group">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-1.5 relative"
                      style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                      {poster
                        ? <Image src={poster} alt={title} width={160} height={240}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-xs text-center p-2"
                            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>{title}</div>
                      }

                      {/* Puan badge */}
                      {item.vote_average > 0 && (
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-black"
                          style={{
                            background: 'rgba(0,0,0,0.8)',
                            color: item.vote_average >= 7 ? '#4ade80' : item.vote_average >= 5 ? '#fbbf24' : '#f87171',
                          }}>
                          <span className="inline-flex items-center gap-0.5"><IconStarFilled size={10} />{item.vote_average.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Kategori özel badge */}
                      {cat.key === 'gizli' && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{ background: 'rgba(167,139,250,0.9)', color: '#fff' }}>
                          {t('discover.votes', { count: item.vote_count?.toLocaleString('tr-TR') ?? 0 })}
                        </div>
                      )}
                      {cat.key === 'hate' && item.popularity > 0 && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{ background: 'rgba(248,113,113,0.9)', color: '#fff' }}>
                          <span className="inline-flex items-center gap-0.5"><IconFire size={10} />{Math.round(item.popularity)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] font-medium text-white group-hover:text-[--accent] transition-colors line-clamp-2 leading-tight">{title}</p>
                    {year && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{year}</p>}
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
