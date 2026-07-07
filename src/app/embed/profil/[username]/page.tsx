import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getPosterUrl } from '@/lib/tmdb'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} — Sinezon`,
    robots: { index: false, follow: false },
  }
}

export default async function EmbedProfilPage({ params }: Props) {
  const { username } = await params
  const { t } = await getTranslations()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, is_premium')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const [reviewsRes, watchedRes, recentRes] = await Promise.all([
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('watch_entries').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('reviews')
      .select('media_id, media_type, rating, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const reviewCount = reviewsRes.count ?? 0
  const watchedCount = watchedRes.count ?? 0
  const recent = recentRes.data ?? []

  const posterUrls: Record<string, string | null> = {}
  for (const r of recent) {
    try {
      const endpoint = r.media_type === 'film'
        ? `https://api.themoviedb.org/3/movie/${r.media_id}?language=tr-TR&api_key=${process.env.TMDB_BEARER_TOKEN}`
        : `https://api.themoviedb.org/3/tv/${r.media_id}?language=tr-TR&api_key=${process.env.TMDB_BEARER_TOKEN}`
      const res = await fetch(endpoint, { next: { revalidate: 86400 } })
      if (res.ok) {
        const data = await res.json()
        posterUrls[`${r.media_type}-${r.media_id}`] = data.poster_path ? getPosterUrl(data.poster_path, 'w342') : null
      }
    } catch {}
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sinema-platform.vercel.app'

  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: transparent; }
        `}</style>
      </head>
      <body>
        <a
          href={`${baseUrl}/profil/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <div style={{
            background: 'linear-gradient(160deg, rgba(13,17,30,0.98), rgba(10,14,24,0.99))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '16px',
            width: '320px',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden',
                background: 'rgba(255,255,255,0.08)', flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.1)',
              }}>
                {profile.avatar_url && (
                  <img src={profile.avatar_url} alt={username} width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>
                    {profile.full_name || username}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>@{username}</span>
              </div>
              <div style={{
                background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)',
                borderRadius: '6px', padding: '4px 8px',
                fontSize: '10px', fontWeight: 700, color: '#E11D48', letterSpacing: '0.05em',
              }}>
                SINEZON
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              {[
                { label: t('profile.embedReviewLabel'), value: reviewCount },
                { label: t('profile.embedWatchedLabel'), value: watchedCount },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  flex: 1, textAlign: 'center', padding: '8px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{value}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Son izledikler */}
            {recent.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {t('profile.embedRecentTitle')}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {recent.map(r => {
                    const key = `${r.media_type}-${r.media_id}`
                    const poster = posterUrls[key]
                    return (
                      <div key={key} style={{
                        width: '44px', height: '66px', borderRadius: '6px', overflow: 'hidden',
                        background: 'rgba(255,255,255,0.06)', flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.06)',
                        position: 'relative',
                      }}>
                        {poster && <img src={poster} alt="" width={44} height={66} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        {r.rating && (
                          <div style={{
                            position: 'absolute', bottom: '2px', right: '2px',
                            background: 'rgba(0,0,0,0.85)', borderRadius: '3px',
                            padding: '1px 3px', fontSize: '9px', fontWeight: 700, color: '#D4A843',
                          }}>
                            {r.rating}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>sinema-platform.vercel.app</span>
              <span style={{ fontSize: '10px', color: '#E11D48', fontWeight: 600 }}>{t('profile.embedViewProfile')}</span>
            </div>
          </div>
        </a>
      </body>
    </html>
  )
}
