import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Sinezon',
  description: 'Sinezon gizlilik politikası — kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgi.',
}

const sections = [
  {
    title: '1. Topladığımız Bilgiler',
    content: [
      {
        subtitle: 'Hesap Bilgileri',
        text: 'Sinezon\'a kayıt olduğunuzda kullanıcı adı, e-posta adresi ve şifrenizi (şifrelenmiş olarak) topluyoruz. Profil fotoğrafı, biyografi ve sosyal medya bağlantıları gibi ek bilgileri isteğe bağlı olarak girebilirsiniz.',
      },
      {
        subtitle: 'Kullanım Verileri',
        text: 'İzleme listeniz, film/dizi yorumlarınız, puanlarınız, oluşturduğunuz listeler, alıntılar ve platform içi aktiviteleriniz gibi içerik verilerini saklıyoruz. Bu veriler size kişiselleştirilmiş öneriler sunmak için kullanılır.',
      },
      {
        subtitle: 'Teknik Veriler',
        text: 'IP adresi, tarayıcı türü, işletim sistemi ve oturum bilgileri gibi teknik verileri güvenlik ve performans amaçlı otomatik olarak topluyoruz. Bu veriler hiçbir zaman reklam amacıyla kullanılmaz.',
      },
    ],
  },
  {
    title: '2. Verileri Nasıl Kullanıyoruz',
    content: [
      {
        subtitle: 'Hizmet Sunumu',
        text: 'Topladığımız veriler; izleme takibi, kişiselleştirilmiş film/dizi önerileri, sosyal özellikler (takip, yorum, liste paylaşımı) ve bildirimler gibi temel platform hizmetlerini sunmak için kullanılır.',
      },
      {
        subtitle: 'Platform İyileştirme',
        text: 'Kullanım istatistikleri ve hata raporları, Sinezon\'u daha iyi bir deneyim sunacak şekilde geliştirmemize yardımcı olur. Bu analizler anonim hale getirilmiş toplu verilerle yapılır.',
      },
      {
        subtitle: 'İletişim',
        text: 'E-posta adresinizi yalnızca hesabınızla ilgili önemli bildirimler (şifre sıfırlama, güvenlik uyarıları) için kullanırız. Pazarlama e-postası göndermiyoruz.',
      },
    ],
  },
  {
    title: '3. Veri Güvenliği',
    content: [
      {
        subtitle: 'Şifreleme',
        text: 'Tüm veriler Supabase altyapısı üzerinde AES-256 şifreleme ile saklanır. Şifreleriniz bcrypt algoritmasıyla hash\'lenir ve hiçbir zaman düz metin olarak tutulmaz. Bağlantılarınız TLS 1.3 ile şifrelenir.',
      },
      {
        subtitle: 'Erişim Kontrolü',
        text: 'Verilerinize yalnızca sizin ve yetkili Sinezon ekibi üyelerinin erişimi vardır. Üçüncü taraf uygulamalar verilerinize erişemez. Row-Level Security (RLS) politikaları ile her kullanıcı yalnızca kendi verilerini görebilir.',
      },
    ],
  },
  {
    title: '4. Üçüncü Taraf Hizmetler',
    content: [
      {
        subtitle: 'TMDb (The Movie Database)',
        text: 'Film ve dizi bilgilerini TMDb API\'si üzerinden çekiyoruz. TMDb\'ye herhangi bir kişisel veri aktarımı yapılmamaktadır.',
      },
      {
        subtitle: 'Supabase',
        text: 'Veritabanı ve kimlik doğrulama altyapımız Supabase üzerinde çalışmaktadır. Supabase, GDPR uyumlu bir hizmet sağlayıcıdır. Verileriniz Frankfurt, Almanya sunucularında saklanır.',
      },
      {
        subtitle: 'Vercel',
        text: 'Web uygulamamız Vercel platformu üzerinde barındırılmaktadır. Vercel, SOC 2 Type II sertifikalı ve GDPR uyumludur.',
      },
    ],
  },
  {
    title: '5. Verilerinizin Kontrolü',
    content: [
      {
        subtitle: 'Erişim ve Düzenleme',
        text: 'Profil ayarları sayfasından kişisel bilgilerinizi istediğiniz zaman görüntüleyebilir ve güncelleyebilirsiniz.',
      },
      {
        subtitle: 'Hesap Silme',
        text: 'Hesabınızı silmek için Ayarlar sayfasını kullanabilir veya sinezon@iletisim.com adresine e-posta gönderebilirsiniz. Hesap silme işlemi 30 gün içinde tamamlanır ve tüm kişisel verileriniz kalıcı olarak silinir.',
      },
      {
        subtitle: 'Veri Dışa Aktarma',
        text: 'İzleme listenizi, yorumlarınızı ve listelerinizi JSON/CSV formatında dışa aktarabilirsiniz. Bu özelliğe Ayarlar sayfasından erişebilirsiniz.',
      },
    ],
  },
  {
    title: '6. Çerezler',
    content: [
      {
        subtitle: 'Oturum Çerezleri',
        text: 'Oturumunuzu açık tutmak için zorunlu oturum çerezleri kullanıyoruz. Bu çerezler tarayıcınızı kapattığınızda silinir veya 30 gün sonra otomatik olarak sona erer.',
      },
      {
        subtitle: 'Analitik Çerezler',
        text: 'Platform kullanımını iyileştirmek amacıyla anonim analitik veriler topluyoruz. Hiçbir reklam ağı veya üçüncü taraf izleme servisi kullanmıyoruz.',
      },
    ],
  },
  {
    title: '7. Yaş Sınırı',
    content: [
      {
        subtitle: '',
        text: 'Sinezon, 13 yaş altındaki çocuklara yönelik değildir. 13 yaşın altındaki bir kullanıcının hesap açtığını fark edersek ilgili hesabı derhal kaldırırız. Ebeveynler bu konuda endişe duyuyorsa sinezon@iletisim.com adresine ulaşabilir.',
      },
    ],
  },
  {
    title: '8. Politika Değişiklikleri',
    content: [
      {
        subtitle: '',
        text: 'Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler yapıldığında kayıtlı e-posta adresinize bildirim göndeririz. Politikanın en güncel versiyonu her zaman bu sayfada yayınlanır.',
      },
    ],
  },
  {
    title: '9. İletişim',
    content: [
      {
        subtitle: '',
        text: 'Gizlilik politikamız hakkında sorularınız için gizlilik@sinezon.com adresine yazabilirsiniz. Talebinizi en geç 72 saat içinde yanıtlamaya çalışıyoruz.',
      },
    ],
  },
]

export default function GizlilikPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #E11D48 0%, #be123c 100%)' }} />
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Gizlilik Politikası</h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Son güncelleme: 28 Haziran 2026
        </p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Sinezon olarak gizliliğinizi ciddiye alıyoruz. Bu politika, hangi verileri topladığımızı,
          nasıl kullandığımızı ve sizi nasıl koruduğumuzu açıklamaktadır.
        </p>
      </div>

      {/* Bölümler */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2 className="text-base font-bold text-white mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i}>
                  {item.subtitle && (
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#E11D48' }}>
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alt bağlantılar */}
      <div className="mt-10 pt-6 flex flex-wrap gap-4 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/kullanim-sartlari" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Kullanım Şartları →
        </a>
        <a href="/hakkimizda" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Hakkımızda →
        </a>
      </div>
    </div>
  )
}
