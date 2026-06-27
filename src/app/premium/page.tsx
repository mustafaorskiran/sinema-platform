import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { IconStar, IconCheck } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Premium Üyelik | Sinezon',
  description: 'Sinezon Premium ile sinema deneyimini bir üst seviyeye taşı.',
}

const FEATURES = [
  { free: true,  premium: true,  label: 'Sınırsız film & dizi yorumu' },
  { free: true,  premium: true,  label: 'İzleme listesi yönetimi' },
  { free: true,  premium: true,  label: 'Arkadaş takip & akış' },
  { free: false, premium: true,  label: 'Reklamsız deneyim' },
  { free: false, premium: true,  label: 'Özel profil rozeti (⭐ Premium)' },
  { free: false, premium: true,  label: 'Gelişmiş istatistikler & grafikler' },
  { free: false, premium: true,  label: 'Push bildirimleri (öncelikli)' },
  { free: false, premium: true,  label: 'Erken özellik erişimi (beta)' },
  { free: false, premium: true,  label: 'Profil embed widget özelleştirme' },
  { free: '3',   premium: 'Sınırsız', label: 'Özel liste oluşturma' },
]

const PLANS = [
  {
    id: 'aylik',
    name: 'Aylık',
    price: '₺49',
    period: '/ay',
    desc: 'İstediğin zaman iptal et',
    highlight: false,
  },
  {
    id: 'yillik',
    name: 'Yıllık',
    price: '₺399',
    period: '/yıl',
    desc: '%32 tasarruf · Aylık ₺33',
    highlight: true,
  },
]

export default async function PremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPremium = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single()
    isPremium = profile?.is_premium ?? false
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(212,168,67,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Başlık */}
      <div className="text-center mb-14 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', color: '#D4A843' }}>
          <IconStar className="h-3 w-3 fill-[#D4A843]" />
          Premium Üyelik
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Sinema tutkunu için<br />
          <span style={{ background: 'linear-gradient(135deg, #D4A843, #E11D48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            premium deneyim
          </span>
        </h1>
        <p className="text-[--text-secondary] max-w-lg mx-auto">
          Daha fazla özellik, daha az kısıtlama. Sinezon Premium ile sinema günlüğünü tam anlamıyla yaşa.
        </p>

        {isPremium && (
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' }}>
            <IconStar className="h-4 w-4 fill-[#D4A843]" />
            Zaten Premium Üyesiniz!
          </div>
        )}
      </div>

      {/* Fiyat planları */}
      {!isPremium && (
        <div className="grid sm:grid-cols-2 gap-4 mb-14 max-w-2xl mx-auto">
          {PLANS.map(plan => (
            <div key={plan.id} className="rounded-2xl p-6 relative"
              style={plan.highlight
                ? { background: 'linear-gradient(160deg, rgba(28,20,10,0.95), rgba(22,14,6,0.98))', border: '1px solid rgba(212,168,67,0.3)', boxShadow: '0 0 40px rgba(212,168,67,0.08)' }
                : { background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.07)' }
              }>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #D4A843, #b8912a)', color: '#000' }}>
                  En Popüler
                </div>
              )}
              <p className="text-sm font-semibold mb-1" style={{ color: plan.highlight ? '#D4A843' : 'rgba(255,255,255,0.7)' }}>{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
              </div>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>{plan.desc}</p>
              {user ? (
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={plan.highlight
                    ? { background: 'linear-gradient(135deg, #D4A843, #b8912a)', color: '#000' }
                    : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }
                  }
                  disabled
                >
                  Yakında
                </button>
              ) : (
                <Link href="/auth/giris"
                  className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
                  Giriş Yap
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Özellik karşılaştırma */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Tablo başlığı */}
        <div className="grid grid-cols-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-sm font-semibold text-white">Özellik</div>
          <div className="text-center text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Ücretsiz</div>
          <div className="text-center text-sm font-semibold" style={{ color: '#D4A843' }}>
            <IconStar className="h-3.5 w-3.5 fill-[#D4A843] inline mr-1" />Premium
          </div>
        </div>

        {FEATURES.map((f, i) => (
          <div key={i} className="grid grid-cols-3 px-6 py-3.5 transition-colors hover:bg-white/3"
            style={{ borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div className="text-sm text-white/80 pr-4">{f.label}</div>
            <div className="flex justify-center items-center">
              {f.free === true
                ? <IconCheck className="h-4 w-4" style={{ color: 'rgba(74,222,128,0.7)' }} />
                : f.free === false
                ? <span className="text-lg" style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>
                : <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.free}</span>
              }
            </div>
            <div className="flex justify-center items-center">
              {f.premium === true
                ? <IconCheck className="h-4 w-4 text-[#D4A843]" />
                : <span className="text-xs font-semibold" style={{ color: '#D4A843' }}>{f.premium}</span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Alt not */}
      <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Premium özellikler aktif olarak geliştiriliyor. Ödeme sistemi yakında açılacak.
      </p>
    </div>
  )
}
