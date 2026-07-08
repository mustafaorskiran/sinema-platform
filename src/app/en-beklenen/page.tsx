import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import AdBanner from '@/components/AdBanner'
import { getTranslations } from '@/lib/i18n'
import { getActiveTMDbLanguage } from '@/lib/tmdb'
import { IconFire, IconMedal, IconFilm } from '@/components/icons'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'En Beklenen Filmler | Sinezon',
  description: 'Henüz çıkmamış ama en çok beklenen filmler — IMDb Most Anticipated.',
}

const BASE = 'https://api.themoviedb.org/3'

async function fetchMostAnticipated(type: 'movie' | 'tv', lang: string) {
  const today = new Date().toISOString().slice(0, 10)
  const inOneYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10)

  const dateGte = type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte'
  const dateLte = type === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte'

  const url = new URL(`${BASE}/discover/${type}`)
  url.searchParams.set('language', lang)
  url.searchParams.set('region', 'TR')
  url.searchParams.set(dateGte, today)
  url.searchParams.set(dateLte, inOneYear)
  url.searchParams.set('sort_by', 'popularity.desc')
  url.searchParams.set('page', '1')

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`, accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).slice(0, 20)
  } catch { return [] }
}

interface Props {
  searchParams: Promise<{ tip?: string }>
}

export default async function EnBeklenenPage({ searchParams }: Props) {
  const { tip = 'film' } = await searchParams
  const isMovie = tip !== 'dizi'
  const { t } = await getTranslations()
  const tmdbLang = await getActiveTMDbLanguage()

  const items = await fetchMostAnticipated(isMovie ? 'movie' : 'tv', tmdbLang)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <IconFire size={24} className="text-[--accent]" />
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('upcoming.title')}
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('upcoming.subtitle')}
        </p>
      </div>

      {/* Film / Dizi sekme */}
      <div className="flex gap-2 mb-8">
        {[{ key: 'film', label: t('upcoming.tabFilms') }, { key: 'dizi', label: t('upcoming.tabSeries') }].map(tab => (
          <Link
            key={tab.key}
            href={`/en-beklenen?tip=${tab.key}`}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={tip === tab.key
              ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 12px rgba(225,29,72,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_1 ?? ''} format="horizontal" className="mb-8 rounded-xl overflow-hidden" />

      {/* Liste */}
      <div className="space-y-3">
        {items.map((item: any, i: number) => {
          const title = item.title ?? item.name ?? ''
          const date = item.release_date ?? item.first_air_date ?? ''
          const year = date.slice(0, 4)
          const href = `/${isMovie ? 'film' : 'dizi'}/${item.id}`
          const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
            : null

          return (
            <Link key={item.id} href={href}
              className="flex items-center gap-4 p-3 rounded-2xl transition-all hover:-translate-y-0.5 group"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Sıra */}
              <div className="w-8 text-center shrink-0">
                {i < 3 ? (
                  <span className="inline-flex">
                    {[
                      <IconMedal key="g" size={20} className="text-[#D4A803]" />,
                      <IconMedal key="s" size={20} className="text-[#C0C0C0]" />,
                      <IconMedal key="b" size={20} className="text-[#B87333]" />,
                    ][i]}
                  </span>
                ) : (
                  <span className="text-sm font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>#{i + 1}</span>
                )}
              </div>

              {/* Poster */}
              <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {poster
                  ? <Image src={poster} alt={title} width={48} height={64} className="w-full h-full object-cover" />
                  : <div className="w-full h-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                }
              </div>

              {/* Bilgi */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white group-hover:text-[--accent] transition-colors line-clamp-1">{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {year && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{year}</span>}
                  {date && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(225,29,72,0.08)', color: 'rgba(225,29,72,0.7)', border: '1px solid rgba(225,29,72,0.15)' }}>
                      {new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </span>
                  )}
                </div>
                {item.overview && (
                  <p className="text-[11px] mt-1 line-clamp-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.overview}</p>
                )}
              </div>

              {/* Popülerlik */}
              <div className="text-right shrink-0">
                <p className="text-xs font-bold inline-flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                  <IconFire size={14} /> {Math.round(item.popularity).toLocaleString('tr-TR')}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('upcoming.popularityLabel')}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
          <div className="mb-3 flex justify-center"><IconFilm size={40} /></div>
          <p>{t('upcoming.fetchError')}</p>
        </div>
      )}
    </div>
  )
}
