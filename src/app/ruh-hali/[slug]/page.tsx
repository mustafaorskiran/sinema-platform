import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMoodBySlug, MOODS } from '@/lib/moods'
import { discoverMovieRaw, discoverTVRaw, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string; sayfa?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const mood = getMoodBySlug(slug)
  return { title: mood ? `${mood.emoji} ${mood.title}` : 'Ruh Haline Göre' }
}

export default async function RuhHaliDetayPage({ params, searchParams }: Props) {
  const { t } = await getTranslations()
  const { slug } = await params
  const { tab = 'filmler', sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)

  const mood = getMoodBySlug(slug)
  if (!mood) notFound()

  const baseParams = {
    sort_by: mood.sortBy,
    'vote_count.gte': String(mood.voteCountMin),
    'vote_average.gte': '6.5',
  }

  const [filmData, diziData] = await Promise.all([
    tab === 'filmler'
      ? discoverMovieRaw({ ...baseParams, with_genres: mood.movieGenres.join(',') }, page).catch(() => ({ results: [], total_pages: 1 }))
      : Promise.resolve({ results: [], total_pages: 1 }),
    tab === 'diziler'
      ? discoverTVRaw({ ...baseParams, with_genres: mood.tvGenres.join(','), 'vote_count.gte': String(Math.floor(mood.voteCountMin / 5)) }, page).catch(() => ({ results: [], total_pages: 1 }))
      : Promise.resolve({ results: [], total_pages: 1 }),
  ])

  const items = tab === 'filmler' ? filmData.results ?? [] : diziData.results ?? []
  const totalPages = Math.min(
    tab === 'filmler' ? filmData.total_pages ?? 1 : diziData.total_pages ?? 1,
    10
  )
  const mediaType = tab === 'filmler' ? 'film' : 'dizi'

  // Diğer mood önerileri (rastgele 4 tane)
  const otherMoods = MOODS.filter(m => m.slug !== slug).sort(() => Math.random() - 0.5).slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="text-sm text-[--text-secondary] mb-6">
        <Link href="/ruh-hali" className="hover:text-white transition-colors">← {t('mood.watchByMood')}</Link>
      </div>

      {/* Başlık */}
      <div className={`flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br ${mood.color} border mb-8`}>
        <span className="text-5xl">{mood.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">{mood.title}</h1>
          <p className="text-[--text-secondary] text-sm mt-1">{mood.subtitle}</p>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2 mb-6">
        {(['filmler', 'diziler'] as const).map(tabKey => (
          <Link
            key={tabKey}
            href={`/ruh-hali/${slug}?tab=${tabKey}&sayfa=1`}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={tab === tabKey
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
            }
          >
            {tabKey === 'filmler' ? `🎬 ${t('genre.film')}` : `📺 ${t('genre.dizi')}`}
          </Link>
        ))}
      </div>

      {/* Sayfa bilgisi */}
      <p className="text-xs text-[--text-secondary] mb-4">
        {t('mood.pageInfo', { page, totalPages, count: items.length })}
      </p>

      {/* Izgara */}
      {items.length === 0 ? (
        <p className="text-[--text-secondary] text-sm py-16 text-center">{t('mood.noResults')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-10">
          {items.map(item => {
            const poster = getPosterUrl(item.poster_path, 'w342')
            const title = getMediaTitle(item)
            const year = getMediaYear(item)
            return (
              <Link key={item.id} href={`/${mediaType}/${item.id}`} className="group">
                <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {poster
                    ? <img src={poster} alt={title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center leading-tight">{title}</div>
                  }
                  {item.vote_average > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5">
                      <span className="text-[10px] font-bold text-[--gold]">★ {item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-white font-medium line-clamp-1 group-hover:text-[--accent] transition-colors">{title}</p>
                <p className="text-[10px] text-[--text-secondary]">{year}</p>
              </Link>
            )
          })}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {page > 1 && (
            <Link href={`/ruh-hali/${slug}?tab=${tab}&sayfa=${page - 1}`} className="px-4 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>← {t('common.prev')}</Link>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i
            if (p > totalPages) return null
            return (
              <Link
                key={p}
                href={`/ruh-hali/${slug}?tab=${tab}&sayfa=${p}`}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  p === page ? 'bg-[--accent] border-[--accent] text-white' : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white'
                }`}
              >{p}</Link>
            )
          })}
          {page < totalPages && (
            <Link href={`/ruh-hali/${slug}?tab=${tab}&sayfa=${page + 1}`} className="px-4 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>{t('common.next')} →</Link>
          )}
        </div>
      )}

      {/* Diğer Ruh Halleri */}
      <div className="border-t border-[--border] pt-8">
        <p className="text-sm font-semibold text-white mb-4">{t('mood.otherMoods')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {otherMoods.map(m => (
            <Link
              key={m.slug}
              href={`/ruh-hali/${m.slug}`}
              className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br ${m.color} border transition-all hover:scale-105`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <p className="text-xs font-semibold text-white leading-tight">{m.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
