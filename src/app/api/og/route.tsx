import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Sinezon'
  const type = searchParams.get('type') ?? 'film'
  const year = searchParams.get('year') ?? ''
  const rating = searchParams.get('rating') ?? ''
  const poster = searchParams.get('poster') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(160deg, #0d111e 0%, #141c2f 50%, #0a0e1a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '600px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(225,29,72,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          display: 'flex',
        }} />

        {/* Poster */}
        {poster && (
          <div style={{
            position: 'absolute', right: '60px', top: '60px', bottom: '60px',
            width: '240px', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            display: 'flex',
          }}>
            <img src={poster} width={240} height={360} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>
        )}

        {/* İçerik */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '60px', paddingRight: poster ? '340px' : '60px',
          height: '100%', flex: 1,
        }}>
          {/* Tür badge */}
          <div style={{
            display: 'flex', alignItems: 'center', marginBottom: '20px',
          }}>
            <div style={{
              background: type === 'film' ? 'rgba(59,130,246,0.2)' : 'rgba(139,92,246,0.2)',
              border: `1px solid ${type === 'film' ? 'rgba(59,130,246,0.4)' : 'rgba(139,92,246,0.4)'}`,
              color: type === 'film' ? '#60a5fa' : '#a78bfa',
              padding: '6px 16px', borderRadius: '100px',
              fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {type === 'film' ? '🎬 Film' : '📺 Dizi'}
            </div>
          </div>

          {/* Başlık */}
          <div style={{
            fontSize: title.length > 40 ? '36px' : '52px',
            fontWeight: 900, color: '#ffffff',
            lineHeight: 1.1, marginBottom: '16px',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em',
          }}>
            {title}
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            {year && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px' }}>{year}</div>
            )}
            {rating && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#D4A843', fontSize: '22px', fontWeight: 700,
              }}>
                ★ {rating}
              </div>
            )}
          </div>

          {/* Sinezon logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #E11D48, #be123c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 900, color: '#fff',
            }}>S</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 600 }}>
              sinema-platform.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
