import { IconSearch, IconUser, IconFilm, IconTv, IconTrophy, IconNewspaper } from '@/components/icons'
import { getProfileUrl, searchPeople } from '@/lib/tmdb'
import MovieCard from '@/components/MovieCard'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import AramaFiltreler from './AramaFiltreler'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { sanitizeSearchInput } from '@/lib/sanitizeSearch'

interface Props {
  searchParams: Promise<{ q?: string; sayfa?: string; tip?: string; yil?: string; tur?: string; min_puan?: string; dil?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `"${q}" için arama sonuçları` : 'Arama' }
}

const PAGE_SIZE = 40

const DEPT_KEYS: Record<string, string> = {
  Acting:     'search.deptActing',
  Directing:  'search.deptDirecting',
  Writing:    'search.deptWriting',
  Production: 'search.deptProduction',
  Camera:     'search.deptCamera',
  Editing:    'search.deptEditing',
  Sound:      'search.deptSound',
  Art:        'search.deptArt',
  Lighting:   'search.deptLighting',
  Crew:       'search.deptCrew',
  Visual:     'search.deptVisual',
}

export default async function AramaPage({ searchParams }: Props) {
  const { t } = await getTranslations()
  const { q, sayfa, tip = 'hepsi', yil, tur, min_puan, dil } = await searchParams
  const page   = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  if (!q?.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <IconSearch className="h-16 w-16 mx-auto mb-6 text-[--text-secondary] opacity-20" />
        <p className="text-lg font-semibold text-white mb-2">{t('search.whatToSearch')}</p>
        <p className="text-[--text-secondary] text-sm">{t('search.searchHint')}</p>
      </div>
    )
  }

  const supabase = await createClient()
  // Görüntülenen metin (q/başlık) ham kalır; DB filtresine giden term temizlenir (filter injection önleme)
  const term = sanitizeSearchInput(q.trim())

  // Paralel sorgular
  const [
    { data: filmResults, count: filmCount },
    { data: diziResults, count: diziCount },
    { data: userResults },
    kisilerData,
  ] = await Promise.all([
    (tip === 'hepsi' || tip === 'film')
      ? (() => {
          let q2 = supabase.from('movies').select('*', { count: 'exact' })
            .or(`title.ilike.%${term}%,original_title.ilike.%${term}%`)
          if (yil) q2 = q2.eq('release_year', Number(yil))
          if (tur) q2 = (q2 as any).contains('genre_ids', [Number(tur)])
          if (min_puan) q2 = q2.gte('vote_average', Number(min_puan))
          if (dil) q2 = (q2 as any).eq('original_language', dil)
          return q2.order('popularity', { ascending: false })
            .range(tip === 'film' ? offset : 0, tip === 'film' ? offset + PAGE_SIZE - 1 : 9)
        })()
      : Promise.resolve({ data: [], count: 0 }),

    (tip === 'hepsi' || tip === 'dizi')
      ? (() => {
          let q2 = supabase.from('series').select('*', { count: 'exact' })
            .or(`name.ilike.%${term}%,original_name.ilike.%${term}%`)
          if (yil) q2 = (q2 as any).eq('first_air_year', Number(yil))
          if (tur) q2 = (q2 as any).contains('genre_ids', [Number(tur)])
          if (min_puan) q2 = (q2 as any).gte('vote_average', Number(min_puan))
          if (dil) q2 = (q2 as any).eq('original_language', dil)
          return q2.order('popularity', { ascending: false })
            .range(tip === 'dizi' ? offset : 0, tip === 'dizi' ? offset + PAGE_SIZE - 1 : 9)
        })()
      : Promise.resolve({ data: [], count: 0 }),

    (tip === 'hepsi' || tip === 'kullanici')
      ? supabase.from('profiles').select('id, username, avatar_url, bio')
          .ilike('username', `%${term}%`).limit(12)
      : Promise.resolve({ data: [] }),

    (tip === 'hepsi' || tip === 'kisi')
      ? searchPeople(term, page).catch(() => ({ results: [], total_results: 0, total_pages: 1 }))
      : Promise.resolve({ results: [], total_results: 0, total_pages: 1 }),
  ])

  const films    = (filmResults  ?? []).map((m: any) => ({ ...m, id: m.tmdb_id, media_type: 'movie' }))
  const diziler  = (diziResults  ?? []).map((s: any) => ({ ...s, id: s.tmdb_id, title: s.name, media_type: 'tv', release_date: s.first_air_date }))
  const kisiler  = kisilerData.results ?? []
  const kullanicilar = userResults ?? []

  const totalFilms  = filmCount  ?? 0
  const totalDiziler = diziCount ?? 0
  const totalKisiler = kisilerData.total_results ?? 0
  const totalKullanicilar = kullanicilar.length

  const totalPages =
    tip === 'film'  ? Math.min(500, Math.ceil(totalFilms / PAGE_SIZE)) :
    tip === 'dizi'  ? Math.min(500, Math.ceil(totalDiziler / PAGE_SIZE)) :
    tip === 'kisi'  ? Math.min(500, kisilerData.total_pages ?? 1) :
    1

  const tabs = [
    { key: 'hepsi',     label: t('common.all'),               count: totalFilms + totalDiziler + totalKisiler + totalKullanicilar },
    { key: 'film',      label: t('search.tabFilms'),          count: totalFilms },
    { key: 'dizi',      label: t('search.tabSeries'),         count: totalDiziler },
    { key: 'kisi',      label: t('search.tabActorsDirectors'), count: totalKisiler },
    { key: 'kullanici', label: t('search.tabUsers'),          count: totalKullanicilar },
  ]

  const baseUrl = `/arama?q=${encodeURIComponent(q)}&tip=${tip}${yil ? `&yil=${yil}` : ''}${tur ? `&tur=${tur}` : ''}${min_puan ? `&min_puan=${min_puan}` : ''}${dil ? `&dil=${dil}` : ''}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          "<span className="text-[--accent]">{q}</span>" {t('search.for')}
        </h1>
        <p className="text-[--text-secondary] text-sm mt-1">
          {t('search.resultsCount', { count: (totalFilms + totalDiziler + totalKisiler + totalKullanicilar).toLocaleString('tr-TR') })}
        </p>
      </div>

      {/* Sekmeler */}
      <div className="flex items-center gap-1 border-b border-[--border] mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <Link key={tab.key} href={`/arama?q=${encodeURIComponent(q)}&tip=${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tip === tab.key ? 'border-[--accent] text-white' : 'border-transparent text-[--text-secondary] hover:text-white'
            }`}>
            {tab.label}
            {tab.count > 0 && <span className="ml-1.5 text-xs opacity-60">({tab.count.toLocaleString()})</span>}
          </Link>
        ))}
      </div>

      {/* Gelişmiş Filtreler */}
      <Suspense fallback={null}>
        <AramaFiltreler tip={tip} q={q} />
      </Suspense>

      {/* Oyuncu & Yönetmen */}
      {(tip === 'hepsi' || tip === 'kisi') && kisiler.length > 0 && (
        <div className={tip === 'hepsi' ? 'mb-10' : ''}>
          {tip === 'hepsi' && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">{t('search.tabActorsDirectors')}</h2>
              {totalKisiler > 10 && (
                <Link href={`/arama?q=${encodeURIComponent(q)}&tip=kisi`} className="text-xs text-[--accent] hover:underline">
                  {t('search.seeAllCount', { count: totalKisiler.toLocaleString() })}
                </Link>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {(tip === 'hepsi' ? kisiler.slice(0, 6) : kisiler).map((p: any) => {
              const profileImg = getProfileUrl(p.profile_path, 'w185')
              const deptKey = DEPT_KEYS[p.known_for_department]
              const dept = deptKey ? t(deptKey) : (p.known_for_department ?? '')
              const knownFor = (p.known_for ?? []).slice(0, 2)
                .map((w: any) => w.title ?? w.name)
                .filter(Boolean)
                .join(', ')
              return (
                <Link key={p.id} href={`/oyuncu/${p.id}`}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:-translate-y-1 text-center"
                  style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="h-20 w-20 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid rgba(255,255,255,0.08)' }}>
                    {profileImg ? (
                      <img src={profileImg} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconUser className="h-8 w-8 text-[--text-secondary]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-sm font-semibold text-white group-hover:text-[--accent] transition-colors line-clamp-1">{p.name}</p>
                    {dept && <p className="text-[10px] text-[--accent] mt-0.5">{dept}</p>}
                    {knownFor && <p className="text-[10px] text-[--text-secondary] mt-0.5 line-clamp-2">{knownFor}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Filmler */}
      {(tip === 'hepsi' || tip === 'film') && films.length > 0 && (
        <div className={tip === 'hepsi' ? 'mb-10' : ''}>
          {tip === 'hepsi' && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">{t('search.tabFilms')}</h2>
              {totalFilms > 10 && (
                <Link href={`/arama?q=${encodeURIComponent(q)}&tip=film`} className="text-xs text-[--accent] hover:underline">
                  {t('search.seeAllCount', { count: totalFilms.toLocaleString() })}
                </Link>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
            {films.map((m: any) => <MovieCard key={m.id} media={m} type="film" />)}
          </div>
        </div>
      )}

      {/* Diziler */}
      {(tip === 'hepsi' || tip === 'dizi') && diziler.length > 0 && (
        <div className={tip === 'hepsi' ? 'mb-10' : ''}>
          {tip === 'hepsi' && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">{t('search.tabSeries')}</h2>
              {totalDiziler > 10 && (
                <Link href={`/arama?q=${encodeURIComponent(q)}&tip=dizi`} className="text-xs text-[--accent] hover:underline">
                  {t('search.seeAllCount', { count: totalDiziler.toLocaleString() })}
                </Link>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
            {diziler.map((s: any) => <MovieCard key={s.id} media={s} type="dizi" />)}
          </div>
        </div>
      )}

      {/* Platform kullanıcıları */}
      {(tip === 'hepsi' || tip === 'kullanici') && kullanicilar.length > 0 && (
        <div>
          {tip === 'hepsi' && <h2 className="text-base font-bold text-white mb-4">{t('search.tabUsers')}</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {kullanicilar.map((u: any) => (
              <Link key={u.id} href={`/profil/${u.username}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:-translate-y-1 text-center"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="h-14 w-14 rounded-full bg-[--accent] flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    : u.username[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">@{u.username}</p>
                  {u.bio && <p className="text-[10px] text-[--text-secondary] line-clamp-1 mt-0.5">{u.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Boş sonuç */}
      {films.length === 0 && diziler.length === 0 && kisiler.length === 0 && kullanicilar.length === 0 && (
        <div className="py-16">
          {/* Başlık */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <IconSearch className="h-8 w-8 opacity-25" style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              "<span className="text-[--accent]">{q}</span>" {t('search.notFoundFor')}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {t('search.tryDifferentTerm')}
            </p>
          </div>

          {/* Popüler arama önerileri */}
          <div className="max-w-xl mx-auto mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {t('search.triedThese')}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Inception', 'Breaking Bad', 'Interstellar', 'The Bear', 'Parasite', 'The Office', 'Dune', 'Severance', 'Christopher Nolan', 'Pedro Pascal'].map(s => (
                <Link key={s} href={`/arama?q=${encodeURIComponent(s)}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Keşfet linkleri */}
          <div className="max-w-xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {t('search.continueExploring')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: '/filmler', Icon: IconFilm, label: t('search.tabFilms') },
                { href: '/diziler', Icon: IconTv, label: t('search.tabSeries') },
                { href: '/top10', Icon: IconTrophy, label: t('search.top10') },
                { href: '/haberler', Icon: IconNewspaper, label: t('search.news') },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <item.Icon size={24} />
                  <span className="text-xs text-[--text-secondary]">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Link href={`${baseUrl}&sayfa=${page - 1}`}
              className="px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              {t('search.prevPage')}
            </Link>
          )}
          <span className="px-4 py-2 text-sm flex items-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="text-white font-semibold mx-1">{page}</span>/<span className="mx-1">{totalPages}</span>
          </span>
          {page < totalPages && (
            <Link href={`${baseUrl}&sayfa=${page + 1}`}
              className="px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              {t('search.nextPage')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
