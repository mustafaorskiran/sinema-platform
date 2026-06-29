import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IconFilm, IconStar, IconTv, IconUsers, IconBookmark, IconCheck, IconCalendarDays, IconList } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import UserHoverCard from '@/components/UserHoverCard'
import TakipOnerileri from '@/components/TakipOnerileri'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Akış | SineMa' }

interface Props {
  searchParams: Promise<{ tip?: string }>
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

export default async function AkisPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { tip = 'hepsi' } = await searchParams

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = (follows ?? []).map(f => f.following_id)

  if (followingIds.length === 0) return <EmptyFeed />

  // Paralel: yorumlar, watchlist, günlük, listeler
  const [
    { data: reviews },
    { data: watchlistItems },
    { data: diaryEntries },
    { data: newLists },
  ] = await Promise.all([
    tip === 'hepsi' || tip === 'yorum'
      ? supabase.from('reviews').select('*, profiles(username, avatar_url)').in('user_id', followingIds).order('created_at', { ascending: false }).limit(30)
      : Promise.resolve({ data: [] }),
    tip === 'hepsi' || tip === 'liste'
      ? supabase.from('watchlist').select('*, profiles(username, avatar_url)').in('user_id', followingIds).eq('status', 'izledim').order('created_at', { ascending: false }).limit(30)
      : Promise.resolve({ data: [] }),
    tip === 'hepsi' || tip === 'gunluk'
      ? supabase.from('diary_entries').select('*, profiles(username, avatar_url)').in('user_id', followingIds).order('watched_at', { ascending: false }).limit(30)
      : Promise.resolve({ data: [] }),
    tip === 'hepsi' || tip === 'liste'
      ? supabase.from('lists').select('*, profiles(username, avatar_url)').in('user_id', followingIds).eq('public', true).order('created_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [] }),
  ])

  // Hepsini birleştir ve sırala
  const allActivities = [
    ...(reviews ?? []).map(r => ({ ...r, _type: 'review' as const, _sortDate: r.created_at })),
    ...(watchlistItems ?? []).map(w => ({ ...w, _type: 'watch' as const, _sortDate: w.created_at })),
    ...(diaryEntries ?? []).map(d => ({ ...d, _type: 'diary' as const, _sortDate: d.watched_at })),
    ...(newLists ?? []).map(l => ({ ...l, _type: 'list' as const, _sortDate: l.created_at })),
  ].sort((a, b) => new Date(b._sortDate).getTime() - new Date(a._sortDate).getTime()).slice(0, 40)

  if (allActivities.length === 0) return <EmptyFeed />

  // Medya bilgilerini önce lokal katalogdan çek (hızlı), bulamazsak TMDb'den
  const mediaCache = new Map<string, { title: string; poster: string | null } | null>()
  const mediaActivities = allActivities.filter(a => a._type === 'review' || a._type === 'watch' || a._type === 'diary')
  const filmIds = [...new Set(mediaActivities.filter((a: any) => a.media_type === 'film').map((a: any) => a.media_id as number))]
  const diziIds = [...new Set(mediaActivities.filter((a: any) => a.media_type === 'dizi').map((a: any) => a.media_id as number))]

  const [{ data: localFilms }, { data: localSeries }] = await Promise.all([
    filmIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_path').in('tmdb_id', filmIds) : Promise.resolve({ data: [] }),
    diziIds.length > 0 ? supabase.from('series').select('tmdb_id, name, poster_path').in('tmdb_id', diziIds) : Promise.resolve({ data: [] }),
  ])
  for (const f of localFilms ?? []) mediaCache.set(`film-${f.tmdb_id}`, { title: f.title, poster: f.poster_path ? `https://image.tmdb.org/t/p/w342${f.poster_path}` : null })
  for (const s of localSeries ?? []) mediaCache.set(`dizi-${s.tmdb_id}`, { title: s.name, poster: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null })

  // Lokal katalogda bulunamayanları TMDb'den çek
  const missingKeys = mediaActivities
    .filter((a: any) => !mediaCache.has(`${a.media_type}-${a.media_id}`))
    .map((a: any) => ({ id: a.media_id as number, type: a.media_type as string }))
  await Promise.all(missingKeys.map(async ({ id, type }) => {
    const key = `${type}-${id}`
    if (mediaCache.has(key)) return
    try {
      const media = type === 'film' ? await getMovieDetail(id) : await getSeriesDetail(id)
      mediaCache.set(key, { title: getMediaTitle(media), poster: getPosterUrl(media.poster_path, 'w342') })
    } catch { mediaCache.set(key, null) }
  }))

  const tabs = [
    { key: 'hepsi', label: 'Tümü' },
    { key: 'yorum', label: 'Yorumlar' },
    { key: 'gunluk', label: 'Günlük' },
    { key: 'liste', label: 'Listeler' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <IconUsers className="h-7 w-7 text-[--accent]" />
        <h1 className="text-2xl font-bold text-white">Arkadaş Akışı</h1>
        <span className="text-sm text-[--text-secondary]">· {follows?.length} takip</span>
      </div>

      {/* Sekmeler */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map(t => (
          <Link key={t.key} href={`/akis?tip=${t.key}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={tip === t.key
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
              : { color: 'rgba(255,255,255,0.45)' }
            }>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {allActivities.map((activity) => {
          const profile = (activity as { profiles: { username: string; avatar_url: string | null } | null }).profiles
          const initial = (profile?.username?.[0] ?? '?').toUpperCase()
          const profileHref = `/profil/${profile?.username}`

          if (activity._type === 'review') {
            const r = activity as { id: string; media_id: number; media_type: string; rating: number; content: string | null; created_at: string }
            const mediaKey = `${r.media_type}-${r.media_id}`
            const media = mediaCache.get(mediaKey)
            return (
              <article key={`review-${r.id}`} className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <Link href={profileHref}>
                    <div className="h-8 w-8 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : initial}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[--text-secondary]">
                      <UserHoverCard username={profile?.username ?? ''}><Link href={profileHref} className="font-semibold text-white hover:text-[--accent] transition-colors">{profile?.username}</Link></UserHoverCard>
                      {' '}<span className="text-[--gold]">★ {r.rating}/10</span> puan verdi
                    </span>
                    <p className="text-[10px] text-[--text-secondary]/60">{timeAgo(r.created_at)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.media_type === 'film' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                    {r.media_type === 'film' ? 'Film' : 'Dizi'}
                  </span>
                </div>
                <Link href={`/${r.media_type}/${r.media_id}`} className="flex gap-3 group">
                  <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {media?.poster ? <img src={media.poster} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-[--accent] transition-colors line-clamp-2">{media?.title ?? `#${r.media_id}`}</p>
                    {r.content && <p className="text-xs text-[--text-secondary] mt-1 line-clamp-2">{r.content}</p>}
                  </div>
                </Link>
              </article>
            )
          }

          if (activity._type === 'watch') {
            const w = activity as { id: string; media_id: number; media_type: string; created_at: string }
            const mediaKey = `${w.media_type}-${w.media_id}`
            const media = mediaCache.get(mediaKey)
            return (
              <article key={`watch-${w.id}`} className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <Link href={profileHref}>
                    <div className="h-8 w-8 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : initial}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <IconCheck className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span className="text-xs text-[--text-secondary] truncate">
                      <UserHoverCard username={profile?.username ?? ''}><Link href={profileHref} className="font-semibold text-white hover:text-[--accent] transition-colors">{profile?.username}</Link></UserHoverCard>
                      {' '}izledi: {' '}
                      <Link href={`/${w.media_type}/${w.media_id}`} className="text-white hover:text-[--accent] transition-colors">{media?.title ?? `#${w.media_id}`}</Link>
                    </span>
                    <span className="text-[10px] text-[--text-secondary]/60 shrink-0 ml-auto">{timeAgo(w.created_at)}</span>
                  </div>
                </div>
              </article>
            )
          }

          if (activity._type === 'diary') {
            const d = activity as { id: string; media_id: number; media_type: string; watched_at: string; rating: number | null; note: string | null }
            const mediaKey = `${d.media_type}-${d.media_id}`
            const media = mediaCache.get(mediaKey)
            return (
              <article key={`diary-${d.id}`} className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <Link href={profileHref}>
                    <div className="h-8 w-8 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : initial}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <IconCalendarDays className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="text-xs text-[--text-secondary] truncate">
                      <UserHoverCard username={profile?.username ?? ''}><Link href={profileHref} className="font-semibold text-white hover:text-[--accent] transition-colors">{profile?.username}</Link></UserHoverCard>
                      {' '}günlüğüne ekledi: {' '}
                      <Link href={`/${d.media_type}/${d.media_id}`} className="text-white hover:text-[--accent] transition-colors">{media?.title ?? `#${d.media_id}`}</Link>
                      {d.rating && <span className="text-[--gold] ml-1">★ {d.rating}</span>}
                    </span>
                    <span className="text-[10px] text-[--text-secondary]/60 shrink-0 ml-auto">{timeAgo(d.watched_at)}</span>
                  </div>
                </div>
                {d.note && <p className="mt-2 ml-11 text-xs text-[--text-secondary] line-clamp-1 italic">"{d.note}"</p>}
              </article>
            )
          }

          if (activity._type === 'list') {
            const l = activity as { id: string; title: string; created_at: string }
            return (
              <article key={`list-${l.id}`} className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <Link href={profileHref}>
                    <div className="h-8 w-8 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : initial}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <IconList className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span className="text-xs text-[--text-secondary] truncate">
                      <UserHoverCard username={profile?.username ?? ''}><Link href={profileHref} className="font-semibold text-white hover:text-[--accent] transition-colors">{profile?.username}</Link></UserHoverCard>
                      {' '}yeni liste oluşturdu: {' '}
                      <Link href={`/liste/${l.id}`} className="text-white hover:text-[--accent] transition-colors">"{l.title}"</Link>
                    </span>
                    <span className="text-[10px] text-[--text-secondary]/60 shrink-0 ml-auto">{timeAgo(l.created_at)}</span>
                  </div>
                </div>
              </article>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}

function EmptyFeed() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <IconUsers className="h-7 w-7 text-[--accent]" />

        <h1 className="text-2xl font-bold text-white">Arkadaş Akışı</h1>
      </div>
      <div className="rounded-2xl py-20 text-center px-6"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-5xl mb-4">👥</div>
        <p className="text-lg font-bold text-white mb-2">Akışın boş</p>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Kullanıcıları takip etmeye başladığında yorumları, izledikleri ve günlükleri burada görünür.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/kullanicilar"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 14px rgba(225,29,72,0.3)' }}>
            <IconUsers className="h-4 w-4" /> Kullanıcıları Keşfet
          </Link>
          <Link href="/benzer-kullanicilar"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            Sana Benzer Kullanıcılar →
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <TakipOnerileri />
      </div>
    </div>
  )
}
