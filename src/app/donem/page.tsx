import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MovieCard from '@/components/MovieCard'
import Pagination from '@/components/Pagination'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'
import {
  IconFire, IconSmartphone, IconDisc, IconCassette, IconGamepad, IconMusic, IconFlower, IconMasks,
  IconFilm, IconCalendarDays, IconSparkles,
} from '@/components/icons'

export const metadata: Metadata = { title: 'Dönemlere Göre Filmler | SineMa' }

const DECADES = [
  { label: '2020\'ler', start: 2020, end: 2029, icon: IconFire },
  { label: '2010\'lar', start: 2010, end: 2019, icon: IconSmartphone },
  { label: '2000\'ler', start: 2000, end: 2009, icon: IconDisc },
  { label: '90\'lar',   start: 1990, end: 1999, icon: IconCassette },
  { label: '80\'ler',   start: 1980, end: 1989, icon: IconGamepad },
  { label: '70\'ler',   start: 1970, end: 1979, icon: IconMusic },
  { label: '60\'lar',   start: 1960, end: 1969, icon: IconFlower },
  { label: '50\'ler',   start: 1950, end: 1959, icon: IconMasks },
  { label: 'Klasikler', start: 1900, end: 1949, icon: IconFilm },
]

interface Props {
  searchParams: Promise<{ donem?: string; sayfa?: string }>
}

const PAGE_SIZE = 40

export default async function DonemPage({ searchParams }: Props) {
  const { t } = await getTranslations()
  const { donem, sayfa } = await searchParams
  const page   = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const selected = DECADES.find(d => d.label === donem)
  const supabase = await createClient()

  let items: any[] = []
  let totalCount = 0

  if (selected) {
    const { data, count } = await supabase
      .from('movies')
      .select('tmdb_id, title, poster_path, vote_average, release_year, genre_ids', { count: 'exact' })
      .gte('release_year', selected.start)
      .lte('release_year', selected.end)
      .gte('vote_count', 50)
      .order('vote_average', { ascending: false })
      .order('popularity', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    items = (data ?? []).map((m: any) => ({
      id: m.tmdb_id, title: m.title, poster_path: m.poster_path,
      vote_average: m.vote_average, release_date: m.release_year ? `${m.release_year}-01-01` : '',
      genre_ids: m.genre_ids ?? [], overview: '', popularity: 0, backdrop_path: null, vote_count: 0,
    }))
    totalCount = count ?? 0
  }

  const totalPages = Math.min(500, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 inline-flex items-center gap-2"><IconCalendarDays size={28} />{t('browse.donem.title')}</h1>
        <p className="text-[--text-secondary]">{t('browse.donem.subtitle')}</p>
      </div>

      {/* Dönem seçici */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {DECADES.map(d => (
          <Link key={d.label} href={`/donem?donem=${encodeURIComponent(d.label)}`}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-medium transition-all text-sm ${
              donem === d.label
                ? 'bg-[--accent] border-[--accent] text-white shadow-lg shadow-[--accent]/20'
                : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/50'
            }`}>
            <d.icon size={18} />
            <span>{d.label}</span>
            <span className="text-xs opacity-60">({d.start}–{d.end})</span>
          </Link>
        ))}
      </div>

      {selected && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <selected.icon size={26} className="text-[--accent]" />
            <h2 className="text-xl font-bold text-white">{selected.label} ({selected.start}–{selected.end})</h2>
            <span className="text-sm text-[--text-secondary]">· {t('browse.donem.filmCount', { count: totalCount.toLocaleString('tr-TR') })}</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20 text-[--text-secondary]">
              {t('browse.donem.noData')}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
              {items.map((m: any) => <MovieCard key={m.id} media={m} type="film" />)}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/donem?donem=${encodeURIComponent(selected.label)}`} />
        </>
      )}

      {!donem && (
        <div className="text-center py-8 text-[--text-secondary] text-sm">
          {t('browse.donem.selectPrompt')} <IconSparkles size={14} className="inline" />
        </div>
      )}
    </div>
  )
}
