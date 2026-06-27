import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sinezon — Tamamen Ücretsiz',
  description: 'Sinezon\'daki tüm özellikler sonsuza kadar ücretsizdir.',
}

const FEATURES = [
  { label: 'Sınırsız film & dizi yorumu' },
  { label: 'İzleme listesi yönetimi' },
  { label: 'Arkadaş takip & aktivite akışı' },
  { label: 'AI destekli film önerileri' },
  { label: 'Sınırsız özel liste oluşturma' },
  { label: 'Rozetler & başarı sistemi' },
  { label: 'İzleme günlüğü & yıllık özet' },
  { label: 'Push bildirimleri' },
  { label: 'Film ve dizi karşılaştırma' },
  { label: 'Profil embed widget' },
  { label: 'Gelişmiş istatistikler & grafikler' },
  { label: 'Forum & topluluk özellikleri' },
]

export default function PremiumPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="text-5xl mb-6">🎬</div>
      <h1 className="text-3xl font-black text-white mb-3">Tamamen Ücretsiz</h1>
      <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Sinezon&apos;daki tüm özellikler sonsuza kadar ücretsizdir. Kredi kartı yok, abonelik yok.
      </p>

      <div className="rounded-2xl p-6 mb-10 text-left"
        style={{
          background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
        <p className="text-sm font-bold text-white mb-4">Tüm özellikler dahil:</p>
        <ul className="space-y-2">
          {FEATURES.map(f => (
            <li key={f.label} className="flex items-center gap-2.5 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span className="text-green-400 shrink-0">✓</span>
              {f.label}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/auth/kayit"
        className="inline-block px-8 py-3 rounded-xl text-base font-bold text-white transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 20px rgba(225,29,72,0.3)' }}>
        Hemen Ücretsiz Katıl
      </Link>
    </div>
  )
}
