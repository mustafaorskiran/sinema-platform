import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl, getMediaTitle, getMediaYear, getMovieDetail, getSeriesDetail } from '@/lib/tmdb'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tip?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — İzleme Listesi | Sinezon`,
    description: `${username} kullanıcısının izlemek istediği filmler ve diziler.`,
  }
}

export default async function ProfilIzmeListesiPage({ params, searchParams }: Props) {
  const { username } = await params
  const { tip = 'hepsi' } = await searchParams

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  let query = supabase
    .from('watchlist')
    .select('media_id, media_type, added_at, priority')
    .eq('user_id', profile.id)
    .order('added_at', { ascending: false })
    .limit(60)

  if (tip !== 'hepsi') {
    query = query.eq('media_type', tip)
  }

  const { data: items } = await query

  // Fetch TMDB details for each item
  const enriched = await Promise.all(
    (items ?? []).map(async item => {
      try {
        const detail = item.media_type === 'film'
          ? await getMovieDetail(item.media_id)
          : await getSeriesDetail(item.media_id)
        return {
          ...item,
          title: getMediaTitle(detail),
          year: getMediaYear(detail),
          poster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null,
          rating: (detail as any).vote_average ?? null,
        }
      } catch {
        return { ...item, title: `#${item.media_id}`, year: '', poster: null, rating: null }
      }
    })
  )

  const filmCount = (items ?? []).filter(i => i.media_type === 'film').length
  const diziCount = (items ?? []).filter(i => i.media_type === 'dizi').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profil/${username}`} className="text-white/40 hover:text-white transition-colors text-sm">
          ← @{username}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt={username} className="h-10 w-10 rounded-full object-cover" />
          : <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>
              {username[0]?.toUpperCase()}
            </div>
        }
        <div>
          <h1 className="text-xl font-bold text-white">
            {profile.full_name ? `${profile.full_name}'in` : `@${username}'in`} İzleme Listesi
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {filmCount} film · {diziCount} dizi
          </p>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'hepsi', label: 'Tümü', count: filmCount + diziCount },
          { id: 'film', label: '🎬 Filmler', count: filmCount },
          { id: 'dizi', label: '📺 Diziler', count: diziCount },
        ].map(t => (
          <Link key={t.id} href={`/profil/${username}/izleme-listesi?tip=${t.id}`}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={t.id === tip
              ? { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: 'white' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
            {t.label} <span className="ml-1 opacity-60">{t.count}</span>
          </Link>
        ))}
      </div>

      {/* Grid */}
      {enriched.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-4xl mb-3">📭</p>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>
            {tip !== 'hepsi' ? 'Bu kategoride içerik yok.' : 'İzleme listesi boş.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {enriched.map((item, i) => (
            <Link key={`${item.media_id}-${i}`}
              href={`/${item.media_type}/${item.media_id}`}
              className="group flex flex-col gap-1.5">
              <div className="aspect-[2/3] rounded-xl overflow-hidden relative"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {item.poster ? (
                  <img src={item.poster} alt={item.title ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">
                    {item.media_type === 'film' ? '🎬' : '📺'}
                  </div>
                )}
                {item.priority === 'high' && (
                  <div className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(225,29,72,0.8)', color: 'white' }}>
                    Öncelikli
                  </div>
                )}
                {item.rating && (
                  <div className="absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70"
                    style={{ color: '#D4A843' }}>
                    ★ {item.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-white line-clamp-2 leading-tight group-hover:text-[--accent] transition-colors">
                {item.title}
              </p>
              {item.year && (
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.year}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
