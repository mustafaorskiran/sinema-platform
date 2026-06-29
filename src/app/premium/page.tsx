import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sinezon — Tüm Özellikler',
  description: 'Sinezon\'daki tüm özellikler sonsuza kadar ücretsizdir.',
}

const FEATURES = [
  { icon: '🎬', label: 'Sınırsız film & dizi yorumu', desc: 'Her içerik için puan ver, uzun yorum yaz' },
  { icon: '📋', label: 'İzleme listesi yönetimi', desc: 'İzledim / İzleyeceğim / Bıraktım takibi' },
  { icon: '👥', label: 'Arkadaş takip & aktivite akışı', desc: 'Arkadaşlarının ne izlediğini gör' },
  { icon: '🤖', label: 'AI destekli film önerileri', desc: 'İzleme geçmişine göre kişisel öneriler' },
  { icon: '🗂️', label: 'Sınırsız özel liste oluşturma', desc: 'Tema listeler oluştur ve paylaş' },
  { icon: '🏅', label: 'Rozetler & başarı sistemi', desc: '40+ rozet kazan, ilerleme takip et' },
  { icon: '📖', label: 'İzleme günlüğü & yıllık özet', desc: 'Yıl içinde ne izlediğini gör' },
  { icon: '🔔', label: 'Push bildirimleri', desc: 'Like, yorum ve takip bildirimleri' },
  { icon: '⚔️', label: 'Film vs Film oylaması', desc: 'İki film arasında tercihini belirt' },
  { icon: '🧩', label: 'Film quiz', desc: 'Posteri gör, filmi bul — skor kazan' },
  { icon: '📊', label: 'Gelişmiş istatistikler', desc: 'Tür dağılımı, izleme ısı haritası ve daha fazlası' },
  { icon: '💬', label: 'Forum & topluluk', desc: 'Sinema hakkında tartış, konu aç' },
]

export default function PremiumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
          ✓ Tamamen Ücretsiz — Kredi kartı yok
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
          Sinezon ile<br />
          <span style={{ color: 'var(--accent)' }}>her şey dahil</span>
        </h1>
        <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Film ve dizi severler için tasarlanmış sosyal platform. Tüm özellikler sonsuza kadar ücretsiz.
        </p>
      </div>

      {/* Özellikler Grid */}
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {FEATURES.map(f => (
          <div key={f.label}
            className="flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white">{f.label}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Destek / Ko-fi */}
      <div className="text-center rounded-3xl p-8"
        style={{ background: 'linear-gradient(160deg, rgba(255,216,77,0.06), rgba(14,20,32,0.95))', border: '1px solid rgba(255,216,77,0.15)' }}>
        <div className="text-4xl mb-3">☕</div>
        <p className="text-xl font-black text-white mb-2">Projeyi Destekle</p>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Sinezon tamamen ücretsiz. Sunucu & geliştirme maliyetlerimizi karşılamak için bağış yapabilirsin.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://ko-fi.com/sinezon" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF5E5B, #ff4040)', boxShadow: '0 4px 20px rgba(255,94,91,0.3)' }}>
            ☕ Ko-fi&apos;de Destek Ver
          </a>
          <a href="https://www.patreon.com/sinezon" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 inline-flex items-center gap-2"
            style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c' }}>
            🎁 Patreon&apos;da Destekle
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center rounded-3xl p-8"
        style={{ background: 'linear-gradient(160deg, rgba(225,29,72,0.08), rgba(14,20,32,0.95))', border: '1px solid rgba(225,29,72,0.15)' }}>
        <p className="text-xl font-black text-white mb-2">Hemen başla</p>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Kayıt 30 saniye sürer. Hiçbir ücret yok.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/kayit"
            className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 20px rgba(225,29,72,0.3)' }}>
            Ücretsiz Hesap Aç
          </Link>
          <Link href="/filmler"
            className="px-8 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            Filmlere Bak
          </Link>
        </div>
      </div>
    </div>
  )
}
