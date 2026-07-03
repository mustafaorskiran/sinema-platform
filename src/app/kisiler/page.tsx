import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPopularPeople } from '@/lib/tmdb'
import type { TMDbPersonListItem } from '@/lib/tmdb'
import { IconChevronLeft, IconChevronRight, IconUser } from '@/components/icons'
import { getTranslations } from '@/lib/i18n'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return {
    title: t('person.listMetaTitle'),
    description: t('person.listMetaDescription'),
    alternates: { canonical: '/kisiler' },
  }
}

interface Props {
  searchParams: Promise<{ sayfa?: string; sekme?: string }>
}

function ProfileCard({ person, deptLabels }: { person: TMDbPersonListItem; deptLabels: Record<string, string> }) {
  const dept = deptLabels[person.known_for_department] ?? person.known_for_department
  const knownForTitles = person.known_for
    .slice(0, 3)
    .map(k => k.title ?? k.name ?? '')
    .filter(Boolean)

  return (
    <Link
      href={`/oyuncu/${person.id}`}
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Fotoğraf */}
      <div className="relative aspect-[2/3] overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {person.profile_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${person.profile_path}`}
            alt={person.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <IconUser className="h-16 w-16 opacity-20" style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}
        {/* Popularity badge */}
        <div
          className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--gold)' }}
        >
          {Math.round(person.popularity)}
        </div>
      </div>

      {/* Bilgi */}
      <div className="p-3">
        <p
          className="text-[13px] font-semibold leading-snug line-clamp-1 group-hover:text-[--accent] transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {person.name}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent)' }}>
          {dept}
        </p>
        {knownForTitles.length > 0 && (
          <p
            className="text-[10px] mt-1.5 leading-snug line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {knownForTitles.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}

export default async function KisilerPage({ searchParams }: Props) {
  const { t } = await getTranslations()
  const deptLabels: Record<string, string> = {
    Acting: t('person.roleActor'),
    Directing: t('person.roleDirector'),
    Writing: t('person.roleWriter'),
    Production: t('person.roleProducer'),
    Camera: t('film.cinematographer'),
    Editing: t('person.deptEditing'),
    Sound: t('person.deptSound'),
    'Visual Effects': t('person.roleVisualEffects'),
    Art: t('person.deptArt'),
    Crew: t('person.deptCrew'),
  }
  const TABS = [
    { key: 'populer', label: t('nav.popular') },
  ]
  const params = await searchParams
  const page = Math.max(1, Number(params.sayfa) || 1)
  const sekme = params.sekme ?? 'populer'

  const data = await getPopularPeople(page).catch(() => ({
    results: [], total_pages: 1, total_results: 0, page: 1,
  }))

  const totalPages = Math.min(data.total_pages, 500)
  const people = data.results

  function pageHref(p: number) {
    const sp = new URLSearchParams()
    if (p > 1) sp.set('sayfa', String(p))
    if (sekme !== 'populer') sp.set('sekme', sekme)
    return `/kisiler${sp.toString() ? `?${sp}` : ''}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('person.pageTitle')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t('person.pageSubtitle')}
        </p>
      </div>

      {/* Sekmeler */}
      <div
        className="flex border-b mb-8"
        style={{ borderColor: 'var(--border)' }}
      >
        {TABS.map(tab => (
          <Link
            key={tab.key}
            href={pageHref(1)}
            className={`px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-colors border-b-2 -mb-px ${
              sekme === tab.key
                ? 'border-[--accent] text-[--accent]'
                : 'border-transparent text-[--text-secondary] hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 font-normal opacity-40 normal-case tracking-normal text-[10px]">
              {data.total_results.toLocaleString('tr-TR')}
            </span>
          </Link>
        ))}
      </div>

      {/* Grid */}
      {people.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {people.map(person => (
            <ProfileCard key={person.id} person={person} deptLabels={deptLabels} />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <IconUser className="h-12 w-12 mb-4 opacity-30" style={{ color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{t('person.notFoundList')}</p>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {/* Önceki */}
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <IconChevronLeft className="h-4 w-4" />
              {t('common.prev')}
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl text-sm opacity-30 select-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <IconChevronLeft className="h-4 w-4 inline" /> {t('common.prev')}
            </span>
          )}

          {/* Sayfa numaraları */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p: number
              if (totalPages <= 7) {
                p = i + 1
              } else if (page <= 4) {
                p = i + 1
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i
              } else {
                p = page - 3 + i
              }
              const isActive = p === page
              return (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-medium transition-all"
                  style={isActive
                    ? { background: 'var(--accent)', color: '#fff' }
                    : { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }
                  }
                >
                  {p}
                </Link>
              )
            })}
            {totalPages > 7 && page < totalPages - 3 && (
              <>
                <span className="px-1 text-[--text-secondary]">…</span>
                <Link
                  href={pageHref(totalPages)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-medium transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  {totalPages}
                </Link>
              </>
            )}
          </div>

          {/* Sonraki */}
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {t('common.next')}
              <IconChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl text-sm opacity-30 select-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {t('common.next')} <IconChevronRight className="h-4 w-4 inline" />
            </span>
          )}
        </div>
      )}

      {/* Toplam */}
      <p className="text-center text-[11px] mt-4" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
        {t('person.paginationSummary', { page, totalPages: totalPages.toLocaleString('tr-TR'), total: data.total_results.toLocaleString('tr-TR') })}
      </p>
    </div>
  )
}
