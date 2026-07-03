import Link from 'next/link'
import type { Metadata } from 'next'
import { getPosterUrl } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import { IconCalendarDays, IconFilm, IconTv, IconFire, IconCalendar } from '@/components/icons'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return {
    title: t('upcoming.metaTitle'),
    description: t('upcoming.metaDescription'),
  }
}

interface Props {
  searchParams: Promise<{ tip?: string }>
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

async function fetchUpcomingMovies(apiKey: string) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const inSixMonths = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    const r = await fetch(
      `${TMDB_BASE}/discover/movie?language=tr-TR&region=TR&release_date.gte=${today}&release_date.lte=${inSixMonths}&sort_by=release_date.asc&vote_count.gte=0&with_release_type=3|2&page=1`,
      { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } }
    )
    if (!r.ok) return []
    const d = await r.json()
    return (d.results ?? []).slice(0, 20)
  } catch { return [] }
}

async function fetchUpcomingSeries(apiKey: string) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const inSixMonths = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    const r = await fetch(
      `${TMDB_BASE}/discover/tv?language=tr-TR&first_air_date.gte=${today}&first_air_date.lte=${inSixMonths}&sort_by=first_air_date.asc&page=1`,
      { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 3600 } }
    )
    if (!r.ok) return []
    const d = await r.json()
    return (d.results ?? []).slice(0, 20)
  } catch { return [] }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '?'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

function daysUntil(dateStr: string): number {
  if (!dateStr) return Infinity
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (24 * 3600 * 1000))
}

export default async function YakindaPage({ searchParams }: Props) {
  const { t } = await getTranslations()
  const { tip = 'film' } = await searchParams
  const apiKey = process.env.TMDB_API_KEY ?? ''

  const [films, diziler] = await Promise.all([
    fetchUpcomingMovies(apiKey),
    fetchUpcomingSeries(apiKey),
  ])

  const items = tip === 'film' ? films : diziler

  const GENRE_MAP: Record<number, string> = {
    28: 'Aksiyon', 12: 'Macera', 16: 'Animasyon', 35: 'Komedi', 80: 'Suç',
    99: 'Belgesel', 18: 'Drama', 10751: 'Aile', 14: 'Fantazi', 36: 'Tarih',
    27: 'Korku', 10402: 'Müzik', 9648: 'Gizem', 10749: 'Romantik', 878: 'Bilim Kurgu',
    10770: 'TV Film', 53: 'Gerilim', 10752: 'Savaş', 37: 'Western',
    10759: 'Aksiyon & Macera', 10762: 'Çocuk', 10763: 'Haber', 10764: 'Gerçeklik',
    10765: 'Sci-Fi & Fantazi', 10766: 'Pembe Dizi', 10767: 'Talk Show', 10768: 'Savaş & Politika',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2"><IconCalendarDays size={28} /> {t('comingSoon.title')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('comingSoon.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { id: 'film', icon: <IconFilm size={16} />, label: t('upcoming.tabs.movies'), count: films.length },
          { id: 'dizi', icon: <IconTv size={16} />, label: t('upcoming.tabs.series'), count: diziler.length },
        ].map(tab => (
          <Link key={tab.id} href={`/yakinda?tip=${tab.id}`}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-1.5"
            style={tab.id === tip
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: 'white' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
            {tab.icon} {tab.label} <span className="ml-1 opacity-60">{tab.count}</span>
          </Link>
        ))}
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="mb-3 flex justify-center"><IconFilm size={40} /></p>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>{t('upcoming.empty')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item: any) => {
            const releaseDate = tip === 'film' ? item.release_date : item.first_air_date
            const days = daysUntil(releaseDate)
            const title = item.title ?? item.name ?? t('upcoming.unknown')
            const href = `/${tip}/${item.id}`
            const genres = ((item.genre_ids ?? []) as number[]).slice(0, 2).map(id => GENRE_MAP[id]).filter(Boolean)
            const isVeryClose = days >= 0 && days <= 7
            const isThisMonth = days >= 0 && days <= 30

            return (
              <Link key={item.id} href={href}
                className="flex gap-4 p-4 rounded-2xl transition-all duration-200 group hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
                  border: isVeryClose
                    ? '1px solid rgba(225,29,72,0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}>
                {/* Poster */}
                <div className="shrink-0 w-16 h-24 rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {item.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm leading-snug mb-1 group-hover:text-[--accent] transition-colors line-clamp-2">
                    {title}
                  </p>

                  {/* Tarih badge */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {isVeryClose && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse inline-flex items-center gap-1"
                        style={{ background: 'rgba(225,29,72,0.2)', color: '#f87171', border: '1px solid rgba(225,29,72,0.3)' }}>
                        <IconFire size={11} /> {t('upcoming.thisWeek')}
                      </span>
                    )}
                    {!isVeryClose && isThisMonth && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)' }}>
                        {t('upcoming.thisMonth')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs mb-2 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <IconCalendar size={12} /> {releaseDate ? formatDate(releaseDate) : '?'}
                    {days >= 0 && days !== Infinity && (
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}> · {t('upcoming.daysLater', { days })}</span>
                    )}
                  </p>

                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {genres.map(g => (
                        <span key={g} className="text-[9px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.overview && (
                    <p className="text-[11px] mt-2 line-clamp-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {item.overview}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
