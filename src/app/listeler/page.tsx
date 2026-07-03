import Link from 'next/link'
import { IconList, IconPlus, IconSearch, IconFire, IconClock, IconTrendingUp, IconStar } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import ListCard from './ListCard'
import EditorialCard from './EditorialCard'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Listeler',
  description: 'Editöryal seçkiler, Top 250, tür listeleri ve topluluk tarafından oluşturulan film & dizi listeleri.',
  alternates: { canonical: '/listeler' },
  openGraph: {
    title: 'Listeler | Sinezon',
    description: 'Editöryal seçkiler, Top 250, tür listeleri ve topluluk tarafından oluşturulan film & dizi listeleri.',
    url: '/listeler',
    type: 'website',
  },
}

const PAGE_SIZE = 24
const CATEGORIES = ['Tümü', 'Puanlama', 'Ödüller', 'Tematik', 'Yönetmen', 'Dönem', 'Ülke', 'Tür']

interface Props {
  searchParams: Promise<{ sayfa?: string; q?: string; sirala?: string; kategori?: string }>
}

export default async function ListerPage({ searchParams }: Props) {
  const { sayfa, q, sirala = 'yeni', kategori } = await searchParams
  const page   = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()
  const { t } = await getTranslations()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date().toISOString()

  // ── Haftanın Listeleri (is_featured=true, featured_until > now) ──
  const { data: featuredLists } = await supabase
    .from('lists')
    .select('*, profiles(username, avatar_url), list_items(count), list_likes(count), list_follows(count)')
    .eq('is_featured', true)
    .or(`featured_until.is.null,featured_until.gt.${now}`)
    .eq('public', true)
    .order('created_at', { ascending: false })
    .limit(4)

  // ── Editöryal listeler ──
  let editQuery = supabase
    .from('lists')
    .select('*, list_items(count)')
    .eq('is_editorial', true)
    .eq('public', true)
    .order('created_at', { ascending: true })

  if (kategori && kategori !== 'Tümü') editQuery = editQuery.eq('category', kategori)
  const { data: editorialLists } = await editQuery

  // Editöryal poster kolajları
  const editIds = (editorialLists ?? []).map((l: any) => l.id)
  const editPosters: Record<string, string[]> = {}
  if (editIds.length > 0) {
    const { data: editItems } = await supabase
      .from('list_items')
      .select('list_id, media_id, media_type')
      .in('list_id', editIds)
      .order('position')
      .limit(editIds.length * 4)

    if (editItems?.length) {
      const filmIds = [...new Set(editItems.filter((i: any) => i.media_type === 'film').map((i: any) => i.media_id))]
      const diziIds = [...new Set(editItems.filter((i: any) => i.media_type === 'dizi').map((i: any) => i.media_id))]
      const [{ data: filmData }, { data: diziData }] = await Promise.all([
        filmIds.length > 0 ? supabase.from('movies').select('tmdb_id,poster_path').in('tmdb_id', filmIds) : Promise.resolve({ data: [] }),
        diziIds.length > 0 ? supabase.from('series').select('tmdb_id,poster_path').in('tmdb_id', diziIds) : Promise.resolve({ data: [] }),
      ])
      const pMap = new Map<string, string>()
      for (const f of filmData ?? []) if (f.poster_path) pMap.set(`film-${f.tmdb_id}`, f.poster_path)
      for (const d of diziData ?? []) if (d.poster_path) pMap.set(`dizi-${d.tmdb_id}`, d.poster_path)
      for (const item of editItems as any[]) {
        const poster = pMap.get(`${item.media_type}-${item.media_id}`)
        if (poster) {
          if (!editPosters[item.list_id]) editPosters[item.list_id] = []
          if (editPosters[item.list_id].length < 4) editPosters[item.list_id].push(poster)
        }
      }
    }
  }

  // ── Trend listeler — her zaman hesapla (bölüm + sıralama için) ──
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentLikes } = await supabase
    .from('list_likes')
    .select('list_id')
    .gte('created_at', sevenDaysAgo)

  const trendMap: Record<string, number> = {}
  for (const like of recentLikes ?? []) {
    trendMap[like.list_id] = (trendMap[like.list_id] ?? 0) + 1
  }
  const allTrendIds = Object.entries(trendMap)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)
  const trendListIds = allTrendIds

  // ── Kullanıcı listeleri ──
  let query = supabase
    .from('lists')
    .select('*, profiles(username, avatar_url), list_items(count), list_likes(count), list_follows(count)', { count: 'exact' })
    .eq('public', true)
    .eq('is_editorial', false)
    .eq('is_featured', false)

  if (q?.trim()) query = query.ilike('title', `%${q.trim()}%`)

  if (sirala === 'trend' && trendListIds.length > 0) {
    query = query.in('id', trendListIds).range(0, PAGE_SIZE - 1)
  } else {
    query = query.range(offset, offset + PAGE_SIZE - 1)
    query = query.order('created_at', { ascending: false })
  }

  const { data: lists, count } = await query

  // Sort trend results by score order
  let sortedLists = lists ?? []
  if (sirala === 'trend' && trendListIds.length > 0) {
    const idxMap = Object.fromEntries(trendListIds.map((id, i) => [id, i]))
    sortedLists = [...sortedLists].sort((a: any, b: any) => (idxMap[a.id] ?? 999) - (idxMap[b.id] ?? 999))
  } else if (sirala === 'populer') {
    sortedLists = [...sortedLists].sort((a: any, b: any) =>
      (b.list_likes?.[0]?.count ?? 0) - (a.list_likes?.[0]?.count ?? 0)
    )
  }

  // ── Bu Hafta Trend bölümü için top 4 liste ──
  let trendSectionLists: any[] = []
  const top4TrendIds = allTrendIds.slice(0, 4)
  if (top4TrendIds.length > 0 && sirala !== 'trend') {
    const { data: trendData } = await supabase
      .from('lists')
      .select('*, profiles(username, avatar_url), list_items(count), list_likes(count), list_follows(count)')
      .in('id', top4TrendIds)
      .eq('public', true)
      .eq('is_editorial', false)
      .eq('is_featured', false)
    trendSectionLists = [...(trendData ?? [])].sort((a: any, b: any) =>
      top4TrendIds.indexOf(a.id) - top4TrendIds.indexOf(b.id)
    )
  }

  // Poster kolajları
  const allListIds = [
    ...(featuredLists ?? []).map((l: any) => l.id),
    ...trendSectionLists.map((l: any) => l.id),
    ...sortedLists.map((l: any) => l.id),
  ]
  const listPosters: Record<string, string[]> = {}

  if (allListIds.length > 0) {
    const { data: items } = await supabase
      .from('list_items')
      .select('list_id, media_id, media_type')
      .in('list_id', allListIds)
      .order('position')
      .limit(allListIds.length * 5)

    if (items && items.length > 0) {
      const filmIds = [...new Set(items.filter((i: any) => i.media_type === 'film').map((i: any) => i.media_id))]
      const diziIds = [...new Set(items.filter((i: any) => i.media_type === 'dizi').map((i: any) => i.media_id))]
      const [{ data: filmData }, { data: diziData }] = await Promise.all([
        filmIds.length > 0 ? supabase.from('movies').select('tmdb_id, poster_path').in('tmdb_id', filmIds) : Promise.resolve({ data: [] }),
        diziIds.length > 0 ? supabase.from('series').select('tmdb_id, poster_path').in('tmdb_id', diziIds) : Promise.resolve({ data: [] }),
      ])
      const posterMap = new Map<string, string>()
      for (const f of filmData ?? []) if (f.poster_path) posterMap.set(`film-${f.tmdb_id}`, f.poster_path)
      for (const d of diziData ?? []) if (d.poster_path) posterMap.set(`dizi-${d.tmdb_id}`, d.poster_path)
      for (const item of items as any[]) {
        const poster = posterMap.get(`${item.media_type}-${item.media_id}`)
        if (poster) {
          if (!listPosters[item.list_id]) listPosters[item.list_id] = []
          if (listPosters[item.list_id].length < 5) listPosters[item.list_id].push(poster)
        }
      }
    }
  }

  // User like/follow state
  let userLikedIds    = new Set<string>()
  let userFollowedIds = new Set<string>()
  if (user) {
    const { data: liked } = await supabase
      .from('list_likes').select('list_id').eq('user_id', user.id).in('list_id', allListIds)
    const { data: followed } = await supabase
      .from('list_follows').select('list_id').eq('user_id', user.id).in('list_id', allListIds)
    userLikedIds    = new Set((liked ?? []).map((l: any) => l.list_id))
    userFollowedIds = new Set((followed ?? []).map((l: any) => l.list_id))
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const baseUrl = `/listeler?${q ? `q=${encodeURIComponent(q)}&` : ''}sirala=${sirala}${kategori ? `&kategori=${encodeURIComponent(kategori)}` : ''}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Başlık ── */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <IconList className="h-7 w-7 text-[--accent]" />
            <h1 className="text-2xl font-bold text-white">{t('list.lists')}</h1>
          </div>
          <p className="text-sm text-[--text-secondary] ml-10">{t('list.pageSubtitle')}</p>
        </div>
        {user && (
          <Link href="/liste/yeni"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold transition-colors shadow-lg shadow-[--accent]/20">
            <IconPlus className="h-4 w-4" /> {t('list.new')}
          </Link>
        )}
      </div>

      {/* ── Haftanın Listeleri ── */}
      {featuredLists && featuredLists.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <IconStar className="h-5 w-5 fill-[--gold] text-[--gold]" />
            <h2 className="text-lg font-bold text-white">{t('list.weeklyLists')}</h2>
            <span className="text-[10px] font-bold bg-[--gold]/20 text-[--gold] px-2 py-0.5 rounded-full ml-1">
              {t('list.editorChoice')}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredLists.map((list: any) => (
              <div key={list.id} className="relative">
                <div className="absolute -top-2 -right-2 z-10 bg-[--gold] text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                  ★ {t('list.selected')}
                </div>
                <ListCard
                  list={list}
                  posters={listPosters[list.id] ?? []}
                  isLoggedIn={!!user}
                  isLiked={userLikedIds.has(list.id)}
                  isFollowing={userFollowedIds.has(list.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Editöryal Listeler ── */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">✦ {t('list.editorialLists')}</h2>
            <p className="text-xs text-[--text-secondary] mt-0.5">{t('list.editorialListsDesc')}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => {
            const active = (cat === 'Tümü' && !kategori) || kategori === cat
            return (
              <a key={cat}
                href={cat === 'Tümü' ? '/listeler' : `/listeler?kategori=${encodeURIComponent(cat)}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  active
                    ? 'bg-[--accent] text-white border-[--accent]'
                    : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/40'
                }`}
              >
                {cat}
              </a>
            )
          })}
        </div>

        {editorialLists && editorialLists.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {editorialLists.map((list: any) => (
              <EditorialCard key={list.id} list={list} posters={editPosters[list.id] ?? []} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[--text-secondary] rounded-2xl rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            {t('list.noEditorialInCategory')}
          </div>
        )}
      </section>

      {/* ── Bu Hafta Trend ── */}
      {trendSectionLists.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <IconFire className="h-5 w-5 text-[--accent]" />
              <h2 className="text-lg font-bold text-white">{t('list.trendThisWeek')}</h2>
            </div>
            <Link
              href="/listeler?sirala=trend"
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              {t('common.seeAll')} →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendSectionLists.map((list: any) => (
              <ListCard
                key={list.id}
                list={list}
                posters={listPosters[list.id] ?? []}
                isLoggedIn={!!user}
                isLiked={userLikedIds.has(list.id)}
                isFollowing={userFollowedIds.has(list.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Bölüm ayırıcı ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-[--border]" />
        <span className="text-xs text-[--text-secondary] uppercase tracking-widest font-semibold">{t('list.communityLists')}</span>
        <div className="flex-1 h-px bg-[--border]" />
      </div>

      {/* ── Arama + Sıralama ── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <form className="flex-1 min-w-[200px] max-w-sm" method="get">
          <div className="relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-secondary]" />
            <input name="q" type="search" defaultValue={q ?? ''}
              placeholder={t('list.searchPlaceholder')}
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
            />
            {kategori && <input type="hidden" name="kategori" value={kategori} />}
            <input type="hidden" name="sirala" value={sirala} />
          </div>
        </form>

        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { key: 'yeni',    icon: IconClock,       label: t('list.sortNewest') },
            { key: 'populer', icon: IconFire,         label: t('list.sortPopular') },
            { key: 'trend',   icon: IconTrendingUp,   label: t('list.sortTrend') },
          ].map(({ key, icon: Icon, label }) => (
            <Link key={key}
              href={`/listeler?${q ? `q=${encodeURIComponent(q)}&` : ''}sirala=${key}${kategori ? `&kategori=${encodeURIComponent(kategori)}` : ''}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sirala === key ? 'bg-[--accent] text-white' : 'text-[--text-secondary] hover:text-white'}`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </Link>
          ))}
        </div>

        {count != null && sirala !== 'trend' && (
          <span className="text-sm text-[--text-secondary] self-center">
            {t('list.countSuffix', { count: count.toLocaleString('tr-TR') })}
          </span>
        )}
      </div>

      {/* ── Kullanıcı Liste Grid ── */}
      {sortedLists.length === 0 ? (
        <div className="text-center py-24 text-[--text-secondary] rounded-2xl rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <IconList className="h-12 w-12 mx-auto mb-4 opacity-30" />
          {sirala === 'trend'
            ? <p className="text-lg font-medium text-white mb-2">{t('list.noTrendThisWeek')}</p>
            : <p className="text-lg font-medium text-white mb-2">{t('list.noListsYet')}</p>
          }
          {user && (
            <Link href="/liste/yeni"
              className="inline-block mt-4 bg-[--accent] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[--accent-hover] transition-colors">
              {t('list.createFirstList')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedLists.map((list: any) => (
            <ListCard
              key={list.id}
              list={list}
              posters={listPosters[list.id] ?? []}
              isLoggedIn={!!user}
              isLiked={userLikedIds.has(list.id)}
              isFollowing={userFollowedIds.has(list.id)}
            />
          ))}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && sirala !== 'trend' && (
        <div className="flex justify-center gap-2 mt-12">
          {page > 1 && (
            <Link href={`${baseUrl}&sayfa=${page - 1}`}
              className="px-4 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white hover:border-[--accent]/50 transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              ← {t('common.prev')}
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-[--text-secondary] flex items-center gap-1">
            <span className="text-white font-semibold">{page}</span> / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`${baseUrl}&sayfa=${page + 1}`}
              className="px-4 py-2 rounded-lg rounded-xl text-sm text-[--text-secondary] hover:text-white hover:border-[--accent]/50 transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              {t('common.next')} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
