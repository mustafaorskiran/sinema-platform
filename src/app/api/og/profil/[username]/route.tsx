import { ImageResponse } from 'next/og'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, follower_count')
    .eq('username', username)
    .single()

  if (!profile) {
    return new Response('Not found', { status: 404 })
  }

  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  const displayName = profile.full_name || `@${username}`
  const followers = profile.follower_count ?? 0
  const reviews = reviewCount ?? 0

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0B0F19 0%, #0D1321 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(225,29,72,0.15) 0%, transparent 60%)',
          display: 'flex',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 1 }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              width={96}
              height={96}
              style={{ borderRadius: '50%', border: '3px solid rgba(225,29,72,0.5)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #E11D48, #be123c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', color: 'white', fontWeight: 'bold',
            }}>
              {username[0]?.toUpperCase()}
            </div>
          )}

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '36px', fontWeight: 800, color: 'white', margin: 0 }}>{displayName}</p>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>@{username}</p>
          </div>

          <div style={{ display: 'flex', gap: '48px' }}>
            {[
              { v: String(reviews), l: 'Yorum' },
              { v: String(followers), l: 'Takipçi' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: 900, color: '#E11D48', margin: 0 }}>{s.v}</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>{s.l}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <div style={{ width: '4px', height: '20px', background: '#E11D48', borderRadius: '2px' }} />
            <p style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Sinezon</p>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
