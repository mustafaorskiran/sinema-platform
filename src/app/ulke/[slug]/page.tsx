import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCountryBySlug } from '@/lib/countries'
import { discoverMovieRaw, discoverTVRaw, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import type { Metadata } from 'next'
import UlkeClient from './UlkeClient'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string; sayfa?: string }>
}

const PAGE_SIZE = 20

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const country = getCountryBySlug(slug)
  return { title: country ? `${country.flag} ${country.name} Sineması` : 'Ülke' }
}

export default async function UlkePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tab = 'filmler', sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)

  const country = getCountryBySlug(slug)
  if (!country) notFound()

  const baseParams = {
    with_origin_country: country.code,
    sort_by: 'vote_average.desc',
    'vote_count.gte': country.code === 'TR' ? '50' : '200',
  }

  const [filmData, diziData] = await Promise.all([
    tab === 'filmler'
      ? discoverMovieRaw(baseParams, page).catch(() => ({ results: [], total_pages: 1 }))
      : Promise.resolve({ results: [], total_pages: 1 }),
    tab === 'diziler'
      ? discoverTVRaw(baseParams, page).catch(() => ({ results: [], total_pages: 1 }))
      : Promise.resolve({ results: [], total_pages: 1 }),
  ])

  const items = tab === 'filmler' ? filmData.results : diziData.results
  const totalPages = Math.min(
    tab === 'filmler' ? filmData.total_pages : diziData.total_pages,
    10
  )
  const mediaType = tab === 'filmler' ? 'film' : 'dizi'

  const mapped = (items ?? []).map((m, idx) => ({
    id: m.id,
    title: getMediaTitle(m),
    year: getMediaYear(m),
    poster: getPosterUrl(m.poster_path, 'w342'),
    rating: m.vote_average,
    rank: (page - 1) * PAGE_SIZE + idx + 1,
    mediaType,
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[--text-secondary] mb-6">
        <Link href="/ulke" className="hover:text-white transition-colors">← Ülke Sineması</Link>
      </div>

      {/* Başlık */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">{country.flag}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">{country.name} Sineması</h1>
          {country.nativeName && country.nativeName !== country.name && (
            <p className="text-sm text-[--text-secondary]">{country.nativeName}</p>
          )}
        </div>
      </div>

      <UlkeClient
        slug={slug}
        activeTab={tab as 'filmler' | 'diziler'}
        items={mapped}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  )
}
