'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ background: '#0B0F19', color: '#fff', margin: 0 }}>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bir Şeyler Ters Gitti</h1>
          <p style={{ fontSize: '0.875rem', marginBottom: '2rem', maxWidth: '28rem', color: 'rgba(255,255,255,0.4)' }}>
            Sayfa şu anda yüklenemedi. Sunucularımız yoğun olabilir, lütfen tekrar deneyin.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            <button onClick={() => reset()} style={{
              padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
              color: '#fff', background: 'linear-gradient(135deg, #E11D48, #be123c)', border: 'none', cursor: 'pointer',
            }}>
              Tekrar Dene
            </button>
            <a href="/" style={{
              padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none',
            }}>
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
