import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconSparkles, IconMedal, IconTv, IconFilm, IconStarFilled } from '@/components/icons'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('lists').select('title,subtitle').eq('slug', slug).single()
  return {
    title: data?.title ?? 'Editöryal Liste',
    description: data?.subtitle ?? undefined,
  }
}

export default async function EditorialListPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { t } = await getTranslations()

  const { data: list } = await supabase
    .from('lists')
    .select('*')
    .eq('slug', slug)
    .eq('is_editorial', true)
    .single()

  if (!list) notFound()

  const isDynamic = list.list_type?.startsWith('dynamic')

  type Item = {
    position: number
    media_id: number
    media_type: string
    title: string
    poster_path: string | null
    vote_average?: number
    site_avg?: number
    site_count?: number
    vote_count?: number
  }

  let items: Item[] = []

  if (isDynamic) {
    // Dinamik listeler için API'yi çağır (Server Component'ta)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sinema-platform.vercel.app'
    const res = await fetch(`${baseUrl}/api/editorial-list/${slug}`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const json = await res.json()
      items = json.items ?? []
    }
  } else {
    // Manuel listeler için Supabase'den çek + movies tablosundan poster al
    const { data: listItems } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', list.id)
      .order('position', { ascending: true })

    if (listItems?.length) {
      const filmIds = listItems.filter((i: any) => i.media_type === 'film').map((i: any) => i.media_id)
      const diziIds = listItems.filter((i: any) => i.media_type === 'dizi').map((i: any) => i.media_id)
      const [{ data: filmData }, { data: diziData }] = await Promise.all([
        filmIds.length > 0 ? supabase.from('movies').select('tmdb_id,title,poster_path,vote_average').in('tmdb_id', filmIds) : Promise.resolve({ data: [] }),
        diziIds.length > 0 ? supabase.from('series').select('tmdb_id,title,poster_path,vote_average').in('tmdb_id', diziIds) : Promise.resolve({ data: [] }),
      ])
      const mMap = new Map<string, any>()
      for (const f of filmData ?? []) mMap.set(`film-${f.tmdb_id}`, f)
      for (const d of diziData ?? []) mMap.set(`dizi-${d.tmdb_id}`, d)

      items = listItems.map((li: any) => {
        const m = mMap.get(`${li.media_type}-${li.media_id}`) ?? {}
        return {
          position: li.position,
          media_id: li.media_id,
          media_type: li.media_type,
          title: m.title ?? '',
          poster_path: m.poster_path ?? null,
          vote_average: m.vote_average,
        }
      })
    }
  }

  const CATEGORY_COLORS: Record<string, string> = {
    'Puanlama': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Ödüller':  'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Tematik':  'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Yönetmen': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Dönem':    'bg-green-500/20 text-green-300 border-green-500/30',
    'Ülke':     'bg-red-500/20 text-red-300 border-red-500/30',
    'Tür':      'bg-pink-500/20 text-pink-300 border-pink-500/30',
  }

  // İlk 4 poster — hero mosaic
  const heroPosters = items.slice(0, 4).map(i => i.poster_path).filter((p): p is string => !!p)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Hero Başlık ── */}
      <div className="mb-10">
        {/* Poster mosaic + info satırı */}
        <div className="flex gap-5 items-start mb-6 flex-wrap sm:flex-nowrap">
          {/* Mini kolaj */}
          <div className="shrink-0 w-32 h-32 rounded-2xl overflow-hidden grid grid-cols-2 grid-rows-2 rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            {Array.from({ length: 4 }).map((_, i) => {
              const hp = heroPosters[i]
              return (
                <div key={i} className="relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {hp ? (
                    <img src={`https://image.tmdb.org/t/p/w185${hp}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[--bg-secondary] to-[--bg-primary] flex items-center justify-center text-2xl opacity-30">
                      {list.emoji ?? '📋'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bilgi */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[--text-secondary] mb-2">
              <a href="/listeler" className="hover:text-white transition-colors">{t('list.lists')}</a>
              <span>/</span>
              <span className="text-[--accent]">{t('list.editorial')}</span>
            </div>

            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-3xl">{list.emoji ?? '📋'}</span>
              <h1 className="text-2xl font-bold text-white">{list.title}</h1>
            </div>
            {list.subtitle && (
              <p className="text-[--text-secondary] text-sm leading-relaxed mb-3 max-w-2xl">{list.subtitle}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {list.category && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[list.category] ?? 'bg-[--bg-card] text-[--text-secondary] border-[--border]'}`}>
                  {list.category}
                </span>
              )}
              <span className="text-xs bg-[--accent]/20 text-[--accent] border border-[--accent]/30 px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                <IconSparkles size={12} />{t('list.editorial')}
              </span>
              {isDynamic && (
                <span className="text-xs bg-[--bg-card] text-[--text-secondary] border border-[--border] px-2.5 py-1 rounded-full">
                  {t('list.dynamicAutoUpdate')}
                </span>
              )}
              <span className="text-xs text-[--text-secondary]">{t('list.itemCount', { count: items.length })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Film Listesi ── */}
      {items.length === 0 ? (
        <div className="py-20 text-center text-[--text-secondary] rounded-xl rounded-2xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-lg font-medium text-white mb-2">{t('list.editorialEmpty')}</p>
          <p className="text-sm">{t('list.comingSoon')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <a
              key={`${item.media_type}-${item.media_id}`}
              href={`/${item.media_type}/${item.media_id}`}
              className="group flex items-center gap-4 rounded-xl hover:border-[--accent]/40 transition-all p-3 hover:bg-[--bg-card]/80" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Sıra numarası */}
              <div className={`shrink-0 w-8 text-center font-bold text-sm ${
                item.position <= 3 ? 'text-[--gold]' : 'text-[--text-secondary]'
              }`}>
                {item.position <= 3
                  ? <IconMedal size={18} className="mx-auto" style={{ color: ['#D4A803', '#C0C0C0', '#B87333'][item.position - 1] }} />
                  : item.position}
              </div>

              {/* Poster */}
              <div className="shrink-0 w-10 h-14 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    {item.media_type === 'dizi' ? <IconTv size={18} /> : <IconFilm size={18} />}
                  </div>
                )}
              </div>

              {/* Başlık */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm group-hover:text-[--accent] transition-colors truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-[--text-secondary] mt-0.5">
                  {item.media_type === 'dizi' ? t('series.badge') : t('film.badge')}
                </p>
              </div>

              {/* Puan */}
              <div className="shrink-0 flex items-center gap-3">
                {item.site_avg != null && (
                  <div className="text-center">
                    <div className="text-sm font-bold text-[--accent]">{item.site_avg}</div>
                    <div className="text-[10px] text-[--text-secondary]">{t('boxOffice.voteCount', { count: item.site_count ?? 0 })}</div>
                  </div>
                )}
                {item.vote_average != null && (
                  <div className="hidden sm:block text-center">
                    <div className="text-sm font-bold text-[--gold] inline-flex items-center gap-1"><IconStarFilled size={12} />{item.vote_average?.toFixed(1)}</div>
                    <div className="text-[10px] text-[--text-secondary]">{t('review.tmdb')}</div>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
