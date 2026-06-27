import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sinezon Hakkında | Sinezon',
  description: 'Sinezon nedir? Türkiye\'nin film ve dizi topluluk platformu hakkında her şey.',
}

const FEATURES = [
  { icon: '🎬', title: 'Geniş Katalog', desc: '10.000+ film ve dizi arşivi, TMDb entegrasyonu ile güncel içerik' },
  { icon: '⭐', title: 'Puan Sistemi', desc: 'Her içeriğe 1-10 arası puan ver, kendi eleştirmenliğini ortaya koy' },
  { icon: '✍️', title: 'Yorum & Eleştiri', desc: 'Spoilerlı veya spoilersız yorum yaz, toplulukla paylaş' },
  { icon: '📋', title: 'Listeler', desc: 'Kendi film listelerini oluştur, diğerlerinin listelerini keşfet' },
  { icon: '📅', title: 'İzleme Günlüğü', desc: 'Ne zaman, ne izlediğini kaydet; yıllık özetini gör' },
  { icon: '👥', title: 'Sosyal Özellikler', desc: 'Arkadaşlarını takip et, mesajlaş, aktivite akışını takip et' },
  { icon: '🏆', title: 'Rozetler & Başarılar', desc: 'İzledikçe ve yorum yaptıkça özel rozetler kazan' },
  { icon: '🤖', title: 'AI Önerisi', desc: 'Yapay zeka destekli kişisel film ve dizi önerileri al' },
  { icon: '🔥', title: 'Top 10 & Trendler', desc: 'Haftalık en çok izlenenleri ve topluluk trendlerini takip et' },
  { icon: '📺', title: 'Dizi Takipçisi', desc: 'Sezon ve bölüm bazında izleme durumunu takip et' },
  { icon: '🎭', title: 'Sinema Evrenler', desc: 'MCU, DC, Star Wars gibi büyük evrenler ve serileri keşfet' },
  { icon: '📰', title: 'Sinema Haberleri', desc: 'Variety, Hollywood Reporter ve Beyazperde\'den güncel haberler' },
]

const FAQ = [
  {
    q: 'Sinezon ücretsiz mi?',
    a: 'Evet! Sinezon\'daki tüm özellikler sonsuza kadar tamamen ücretsizdir. Kredi kartı veya abonelik gerekmez.',
  },
  {
    q: 'Hangi dilleri destekliyor?',
    a: 'Platform Türkçe olarak tasarlanmıştır. İçerik bilgileri hem Türkçe hem İngilizce olarak sunulabilir.',
  },
  {
    q: 'Yorumlarım kimler tarafından görülebilir?',
    a: 'Yorumlar ve değerlendirmeler varsayılan olarak herkese açıktır. Profil gizliliği ayarlarından değiştirebilirsiniz.',
  },
  {
    q: 'Veri güvenliğim nasıl sağlanıyor?',
    a: 'Verileriniz Supabase altyapısı üzerinde güvenli şekilde saklanır. Dilediğiniz zaman verilerinizi CSV olarak indirebilirsiniz.',
  },
  {
    q: 'İçerik ekleyebilir miyim?',
    a: 'Film ve dizi bilgileri TMDb veritabanından gelmektedir. Alıntı, liste ve yorumlar için katkı sağlayabilirsiniz.',
  },
]

export default function HakkindaPage() {
  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="text-4xl font-black" style={{ color: '#E11D48' }}>Sine</span>
          <span className="text-4xl font-black" style={{ color: '#D4A843' }}>zon</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          Türkiye&apos;nin Sinema Topluluğu
        </h1>
        <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Sinezon, film ve dizi tutkunları için tasarlanmış Türkçe bir topluluk platformudur.
          İzlediklerini kaydet, puan ver, yorum yaz ve sinema severlerin oluşturduğu
          büyük topluluğun parçası ol.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link href="/auth/kayit"
            className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 16px rgba(225,29,72,0.3)' }}>
            Hemen Katıl — Ücretsiz
          </Link>
          <Link href="/filmler"
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
            Filmleri Keşfet
          </Link>
        </div>
      </div>

      {/* Özellikler */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Neler Yapabilirsin?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.icon} className="p-4 rounded-xl" style={card}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-semibold text-white text-sm mb-1">{f.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* İstatistikler */}
      <section className="mb-14">
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(160deg, rgba(225,29,72,0.06), rgba(14,20,32,0.95))', border: '1px solid rgba(225,29,72,0.15)' }}>
          <h2 className="text-xl font-bold text-white mb-6">Topluluk Büyüyor</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { v: '10.000+', l: 'Film & Dizi' },
              { v: '∞', l: 'Yorum' },
              { v: '100%', l: 'Türkçe' },
              { v: 'Ücretsiz', l: 'Temel Plan' },
            ].map(s => (
              <div key={s.l}>
                <p className="text-2xl font-black text-white">{s.v}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-6">Sık Sorulan Sorular</h2>
        <div className="space-y-3">
          {FAQ.map(item => (
            <div key={item.q} className="p-5 rounded-xl" style={card}>
              <p className="font-semibold text-white text-sm mb-1.5">{item.q}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))', border: '1px solid rgba(212,168,67,0.12)' }}>
          <p className="text-2xl font-black text-white mb-2">Topluluğa Katıl</p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Ücretsiz hesap oluştur, izlediklerini kaydet, yorum yap.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/kayit"
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 16px rgba(225,29,72,0.25)' }}>
              Ücretsiz Kayıt Ol
            </Link>
            <Link href="/gizlilik"
              className="px-6 py-3 rounded-xl text-sm font-medium transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Gizlilik Politikası →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
