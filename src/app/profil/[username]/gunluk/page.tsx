import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPosterUrl, getMediaTitle, getMovieDetail, getSeriesDetail } from '@/lib/tmdb'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ sayfa?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `@${username} — Film Günlüğü | Sinezon`,
    description: `${username} kullanıcısının izleme günlüğü.`,
  }
}

const PAGE_SIZE = 20

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  10: { label: 'Şaheser', color: '#D4A843' },
  9:  { label: 'Mükemmel', color: '#4ade80' },
  8:  { label: 'Harika', color: '#60a5fa' },
  7:  { label: 'İyi', color: '#a78bfa' },
  6:  { label: 'Fena Değil', color: 'rgba(255,255,255,0.4)' },
  5:  { label: 'Vasat', color: 'rgba(255,255,255,0.3)' },
}

export default async function ProfilGunlukPage({ params, searchParams }: Props) {
  const { username } = await params
  const { sayfa } = await searchParams
  const page = Math.max(1, Number(sayfa) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: entries, count } = await supabase
    .from('diary_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', profile.id)
    .order('watched_at', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const enriched = await Promise.all(
    (entries ?? []).map(async (entry: any) => {
      try {
        const detail = entry.media_type === 'film'
          ? await getMovieDetail(entry.media_id)
          : await getSeriesDetail(entry.media_id)
        return {
          ...entry,
          title: getMediaTitle(detail),
          poster: detail.poster_path ? getPosterUrl(detail.poster_path, 'w342') : null,
        }
      } catch {
        return { ...entry, title: `#${entry.media_id}`, poster: null }
      }
    })
  )

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Geri */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profil/${username}`} className="text-sm hover:text-white transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← @{username}
        </Link>
      </div>

      {/* Başlık */}
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
            {profile.full_name ? `${profile.full_name}'in` : `@${username}'in`} Film Günlüğü
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {count ?? 0} kayıt
          </p>
        </div>
      </div>

      {/* Günlük */}
      {enriched.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-4xl mb-3">📖</p>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Henüz günlük kaydı yok.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {enriched.map((entry: any) => {
              const ratingInfo = entry.rating ? RATING_LABELS[Math.round(entry.rating)] : null
              return (
                <div key={entry.id} className="flex gap-4 p-4 rounded-xl" style={card}>
                  <Link href={`/${entry.media_type}/${entry.media_id}`}
                    className="shrink-0 w-12 h-[72px] rounded-lg overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {entry.poster
                      ? <img src={entry.poster} alt={entry.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">
                          {entry.media_type === 'film' ? '🎬' : '📺'}
                        </div>
                    }
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/${entry.media_type}/${entry.media_id}`}
                        className="font-semibold text-sm text-white hover:text-[--accent] transition-colors line-clamp-1">
                        {entry.title}
                      </Link>
                      {entry.rating && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-sm font-black" style={{ color: ratingInfo?.color ?? '#D4A843' }}>
                            {entry.rating}
                          </span>
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/10</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        📅 {formatDate(entry.watched_at)}
                      </span>
                      {entry.rewatch && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
                          🔁 Tekrar
                        </span>
                      )}
                      {ratingInfo && (
                        <span className="text-[10px] font-medium" style={{ color: ratingInfo.color }}>
                          {ratingInfo.label}
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed italic"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                        &ldquo;{entry.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link href={`/profil/${username}/gunluk?sayfa=${page - 1}`}
                  className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  ← Önceki
                </Link>
              )}
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/profil/${username}/gunluk?sayfa=${page + 1}`}
                  className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Sonraki →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
