import { discoverMovieRaw, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import TvFilmleriClient from './TvFilmleriClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'TV Filmleri' }

interface Props {
  searchParams: Promise<{ tab?: string; siralama?: string; sayfa?: string }>
}

const TAB_PARAMS: Record<string, Record<string, string>> = {
  tumü: { with_release_type: '6', sort_by: 'popularity.desc', 'vote_count.gte': '50' },
  turkiye: { with_release_type: '6', with_origin_country: 'TR', sort_by: 'popularity.desc', 'vote_count.gte': '10' },
  uluslararasi: { with_release_type: '6', without_original_language: 'tr', sort_by: 'popularity.desc', 'vote_count.gte': '100' },
}

const SORT_LABEL_KEYS: Record<string, string> = {
  'popularity.desc': 'browse.tvFilmleri.sortPopularity',
  'vote_average.desc': 'browse.tvFilmleri.sortRating',
  'release_date.desc': 'browse.tvFilmleri.sortNewest',
  'release_date.asc': 'browse.tvFilmleri.sortOldest',
}

export default async function TvFilmleriPage({ searchParams }: Props) {
  const { t } = await getTranslations()
  const { tab = 'tumü', siralama, sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)

  const baseParams = TAB_PARAMS[tab] ?? TAB_PARAMS['tumü']
  const params = {
    ...baseParams,
    ...(siralama ? { sort_by: siralama } : {}),
  }

  const data = await discoverMovieRaw(params, page).catch(() => ({ results: [], total_pages: 1 }))
  const items = (data.results ?? []).map((m, idx) => ({
    id: m.id,
    title: getMediaTitle(m),
    year: getMediaYear(m),
    poster: getPosterUrl(m.poster_path, 'w342'),
    rating: m.vote_average,
    rank: (page - 1) * 20 + idx + 1,
  }))
  const totalPages = Math.min(data.total_pages ?? 1, 10)
  const sortLabels = Object.fromEntries(
    Object.entries(SORT_LABEL_KEYS).map(([key, labelKey]) => [key, t(labelKey)])
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">📺 {t('browse.tvFilmleri.title')}</h1>
        <p className="text-[--text-secondary] text-sm mt-1">
          {t('browse.tvFilmleri.subtitle')}
        </p>
      </div>

      <TvFilmleriClient
        activeTab={tab as 'tumü' | 'turkiye' | 'uluslararasi'}
        activeSiralama={siralama || 'popularity.desc'}
        items={items}
        currentPage={page}
        totalPages={totalPages}
        sortLabels={sortLabels}
      />
    </div>
  )
}
