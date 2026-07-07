import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCompanyDetail, getCompanyMovies, getCompanyTV, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import MovieCard from '@/components/MovieCard'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconCheck, IconMapPin, IconFilm, IconTv, IconGlobe, IconBuilding } from '@/components/icons'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const company = await getCompanyDetail(Number(id))
    return { title: `${company.name} | Sinezon`, description: company.description || `${company.name} yapım şirketinin filmleri ve dizileri` }
  } catch {
    return { title: 'Şirket bulunamadı' }
  }
}

export default async function SirketPage({ params }: Props) {
  const { t } = await getTranslations()
  const { id } = await params
  const companyId = Number(id)

  const [company, moviesData, tvData] = await Promise.all([
    getCompanyDetail(companyId).catch(() => null),
    getCompanyMovies(companyId, 1).catch(() => ({ results: [], total_results: 0 })),
    getCompanyTV(companyId, 1).catch(() => ({ results: [], total_results: 0 })),
  ])

  if (!company) notFound()

  const movies = moviesData.results.slice(0, 18)
  const tvShows = tvData.results.slice(0, 18)
  const logoUrl = company.logo_path
    ? `https://image.tmdb.org/t/p/w300${company.logo_path}`
    : null

  const countryFlags: Record<string, string> = {
    US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', JP: '🇯🇵',
    KR: '🇰🇷', IT: '🇮🇹', CA: '🇨🇦', AU: '🇦🇺', TR: '🇹🇷',
    ES: '🇪🇸', IN: '🇮🇳', CN: '🇨🇳', BR: '🇧🇷', NL: '🇳🇱',
  }
  const flag = countryFlags[company.origin_country] ?? '🌍'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
        <div className="shrink-0 w-28 h-28 rounded-2xl bg-white flex items-center justify-center p-3 shadow-lg">
          {logoUrl
            ? <img src={logoUrl} alt={company.name} className="w-full h-full object-contain" />
            : <span className="text-4xl font-black text-gray-800">{company.name[0]}</span>
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[--accent]/20 text-[--accent] border border-[--accent]/30 inline-flex items-center gap-1">
              <IconCheck size={12} /> {t('company.officialProfile')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[--text-secondary]">
            {company.headquarters && (
              <span className="inline-flex items-center gap-1"><IconMapPin size={14} /> {company.headquarters}</span>
            )}
            {company.origin_country && (
              <span>{flag} {company.origin_country}</span>
            )}
            {moviesData.total_results > 0 && (
              <span className="inline-flex items-center gap-1"><IconFilm size={14} /> {t('company.filmCount', { count: moviesData.total_results })}</span>
            )}
            {tvData.total_results > 0 && (
              <span className="inline-flex items-center gap-1"><IconTv size={14} /> {t('company.seriesCount', { count: tvData.total_results })}</span>
            )}
          </div>
          {company.description && (
            <p className="text-sm text-[--text-secondary] mt-3 max-w-2xl">{company.description}</p>
          )}
          <div className="flex gap-3 mt-3">
            {company.homepage && (
              <a
                href={company.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-full border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors inline-flex items-center gap-1"
              >
                <IconGlobe size={13} /> {t('company.officialSite')}
              </a>
            )}
            {company.parent_company && (
              <Link
                href={`/sirket/${company.parent_company.id}`}
                className="text-xs px-3 py-1.5 rounded-full border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30 transition-colors inline-flex items-center gap-1"
              >
                <IconBuilding size={13} /> {t('company.parentCompany', { name: company.parent_company.name })}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filmler */}
      {movies.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">
            {t('nav.films')}
            <span className="ml-2 text-sm font-normal text-[--text-secondary]">{t('company.productionCount', { count: moviesData.total_results })}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map(movie => (
              <MovieCard key={movie.id} media={movie} type="film" />
            ))}
          </div>
        </section>
      )}

      {/* Diziler */}
      {tvShows.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">
            {t('nav.series')}
            <span className="ml-2 text-sm font-normal text-[--text-secondary]">{t('company.productionCount', { count: tvData.total_results })}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tvShows.map(show => (
              <MovieCard key={show.id} media={show} type="dizi" />
            ))}
          </div>
        </section>
      )}

      {movies.length === 0 && tvShows.length === 0 && (
        <div className="text-center py-20 text-[--text-secondary]">
          {t('company.noContent')}
        </div>
      )}
    </div>
  )
}
