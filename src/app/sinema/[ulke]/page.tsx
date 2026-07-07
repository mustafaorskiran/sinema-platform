import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MovieCard from '@/components/MovieCard'
import Pagination from '@/components/Pagination'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'
import { IconFilm, IconTv } from '@/components/icons'

const ULKELER: Record<string, { bayrak: string; ad: string; nameKey: string; dil: string }> = {
  kore:       { bayrak: '🇰🇷', ad: 'Kore',       nameKey: 'country.names.kore',       dil: 'ko' },
  japonya:    { bayrak: '🇯🇵', ad: 'Japonya',     nameKey: 'country.names.japonya',    dil: 'ja' },
  fransa:     { bayrak: '🇫🇷', ad: 'Fransa',      nameKey: 'country.names.fransa',     dil: 'fr' },
  italya:     { bayrak: '🇮🇹', ad: 'İtalya',      nameKey: 'country.names.italya',     dil: 'it' },
  ispanya:    { bayrak: '🇪🇸', ad: 'İspanya',     nameKey: 'country.names.ispanya',    dil: 'es' },
  almanya:    { bayrak: '🇩🇪', ad: 'Almanya',     nameKey: 'country.names.almanya',    dil: 'de' },
  hindistan:  { bayrak: '🇮🇳', ad: 'Hindistan',   nameKey: 'country.names.hindistan',  dil: 'hi' },
  cin:        { bayrak: '🇨🇳', ad: 'Çin',         nameKey: 'country.names.cin',        dil: 'zh' },
  turkiye:    { bayrak: '🇹🇷', ad: 'Türkiye',     nameKey: 'country.names.turkiye',    dil: 'tr' },
  ingiltere:  { bayrak: '🇬🇧', ad: 'İngiltere',   nameKey: 'country.names.ingiltere',  dil: 'en' },
  brezilya:   { bayrak: '🇧🇷', ad: 'Brezilya',    nameKey: 'country.names.brezilya',   dil: 'pt' },
  meksika:    { bayrak: '🇲🇽', ad: 'Meksika',     nameKey: 'country.names.meksika',    dil: 'es' },
  iran:       { bayrak: '🇮🇷', ad: 'İran',        nameKey: 'country.names.iran',       dil: 'fa' },
  rusya:      { bayrak: '🇷🇺', ad: 'Rusya',       nameKey: 'country.names.rusya',      dil: 'ru' },
  tayland:    { bayrak: '🇹🇭', ad: 'Tayland',     nameKey: 'country.names.tayland',    dil: 'th' },
  avustralya: { bayrak: '🇦🇺', ad: 'Avustralya',  nameKey: 'country.names.avustralya', dil: 'en' },
}

interface Props {
  params: Promise<{ ulke: string }>
  searchParams: Promise<{ tab?: string; sayfa?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ulke } = await params
  const info = ULKELER[ulke]
  return { title: info ? `${info.bayrak} ${info.ad} Sineması | Sinezon` : 'Ülke Sineması' }
}

const PAGE_SIZE = 40

export default async function UlkeSinemasPage({ params, searchParams }: Props) {
  const { t } = await getTranslations()
  const { ulke } = await params
  const { tab = 'filmler', sayfa } = await searchParams
  const page   = Math.max(1, Number(sayfa) || 1)
  const info   = ULKELER[ulke]
  if (!info) notFound()

  const supabase = await createClient()
  const offset = (page - 1) * PAGE_SIZE

  // İngilizce film/dizilerde dil filtrelemesi doğrudan çalışmaz (pek çok İng. film var)
  // Türkiye için de çalışır
  const [
    { data: films, count: filmCount },
    { data: series, count: seriesCount },
  ] = await Promise.all([
    supabase.from('movies')
      .select('tmdb_id, title, poster_path, vote_average, release_year, genre_ids', { count: 'exact' })
      .eq('original_language', info.dil)
      .order('popularity', { ascending: false })
      .range(tab === 'filmler' ? offset : 0, tab === 'filmler' ? offset + PAGE_SIZE - 1 : 11),
    supabase.from('series')
      .select('tmdb_id, name, poster_path, vote_average, first_air_year, genre_ids', { count: 'exact' })
      .eq('original_language', info.dil)
      .order('popularity', { ascending: false })
      .range(tab === 'diziler' ? offset : 0, tab === 'diziler' ? offset + PAGE_SIZE - 1 : 11),
  ])

  const filmItems = (films ?? []).map((m: any) => ({ id: m.tmdb_id, title: m.title, poster_path: m.poster_path, vote_average: m.vote_average, release_date: m.release_year ? `${m.release_year}-01-01` : '', genre_ids: m.genre_ids ?? [], overview: '', popularity: 0, backdrop_path: null, vote_count: 0 }))
  const diziItems = (series ?? []).map((s: any) => ({ id: s.tmdb_id, title: s.name, name: s.name, poster_path: s.poster_path, vote_average: s.vote_average, release_date: s.first_air_year ? `${s.first_air_year}-01-01` : '', genre_ids: s.genre_ids ?? [], overview: '', popularity: 0, backdrop_path: null, vote_count: 0, media_type: 'tv' }))

  const items = tab === 'filmler' ? filmItems : diziItems
  const totalCount = tab === 'filmler' ? (filmCount ?? 0) : (seriesCount ?? 0)
  const totalPages = Math.min(500, Math.ceil(totalCount / PAGE_SIZE))
  const paginationBase = `/sinema/${ulke}?tab=${tab}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-2 text-sm text-[--text-secondary]">
        <Link href="/sinema" className="hover:text-white transition-colors">← {t('country.worldCinema')}</Link>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">{info.bayrak}</span>
        <div>
          <h1 className="text-3xl font-bold text-white">{t('country.countrySinemasi', { country: t(info.nameKey) })}</h1>
          <p className="text-sm text-[--text-secondary] mt-1">
            {t('country.filmCount', { count: (filmCount ?? 0).toLocaleString('tr-TR') })} · {t('country.dizCount', { count: (seriesCount ?? 0).toLocaleString('tr-TR') })}
          </p>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'filmler', icon: <IconFilm size={16} />, label: `${t('genre.film')} (${(filmCount ?? 0).toLocaleString()})` },
          { key: 'diziler', icon: <IconTv size={16} />, label: `${t('genre.dizi')} (${(seriesCount ?? 0).toLocaleString()})` },
        ].map(tab_ => (
          <Link key={tab_.key} href={`/sinema/${ulke}?tab=${tab_.key}`}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 inline-flex items-center gap-1.5"
            style={tab === tab_.key
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
            }>
            {tab_.icon} {tab_.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-[--text-secondary]">
          <p>{t('country.noResults')}</p>
          <p className="text-sm mt-2">{t('country.catalogLoadingHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
          {items.map((item: any) => (
            <MovieCard key={item.id} media={item} type={tab === 'filmler' ? 'film' : 'dizi'} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} baseUrl={paginationBase} />
    </div>
  )
}
