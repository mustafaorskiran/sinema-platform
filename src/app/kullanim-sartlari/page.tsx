import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanım Şartları | Sinezon',
  description: 'Sinezon kullanım şartları ve koşulları — platforma kayıt olarak kabul ettiğiniz kurallar.',
}

const sections = [
  {
    title: '1. Hizmetin Kapsamı',
    content: [
      {
        subtitle: '',
        text: 'Sinezon; film ve dizi puanlama, yorum yapma, izleme listesi oluşturma, alıntı ekleme, liste paylaşma, forum tartışmaları ve sosyal etkileşim gibi özellikler sunan bir sinema topluluğu platformudur. Platforma erişerek bu şartları kabul etmiş sayılırsınız.',
      },
    ],
  },
  {
    title: '2. Hesap Oluşturma',
    content: [
      {
        subtitle: 'Kayıt Şartları',
        text: 'Sinezon\'a kayıt olmak için 13 yaşını doldurmuş olmanız gerekmektedir. Hesap bilgilerinizin doğru ve güncel olmasından siz sorumlusunuz. Bir e-posta adresiyle yalnızca bir hesap açılabilir.',
      },
      {
        subtitle: 'Hesap Güvenliği',
        text: 'Şifrenizin gizliliğini korumak sizin sorumluluğunuzdadır. Hesabınızda gerçekleşen tüm aktivitelerden siz sorumlusunuz. Hesabınızın yetkisiz kullanıldığını fark ederseniz derhal sinezon@iletisim.com adresine bildirin.',
      },
      {
        subtitle: 'Kullanıcı Adı',
        text: 'Kullanıcı adınız başkalarına ait olmamalı, yanıltıcı içermemeli ve topluluk kurallarına aykırı olmamalıdır. Uygunsuz kullanıcı adları moderatörler tarafından değiştirilebilir.',
      },
    ],
  },
  {
    title: '3. İçerik Kuralları',
    content: [
      {
        subtitle: 'İzin Verilen İçerik',
        text: 'Film ve diziler hakkında dürüst yorum ve değerlendirmeler, kişisel izleme deneyimleri, yapıcı eleştiriler, öneriler ve tartışmalar paylaşabilirsiniz.',
      },
      {
        subtitle: 'Yasak İçerik',
        text: 'Hakaret, nefret söylemi, ayrımcılık, şiddet çağrısı, kişisel saldırı, spam, yanlış bilgi, telif hakkı ihlali ve yasadışı içerik kesinlikle yasaktır. Bu tür içerikler moderatörler tarafından kaldırılır ve hesabınız askıya alınabilir.',
      },
      {
        subtitle: 'Spoiler Kuralı',
        text: 'Film veya dizilere ait önemli olay örgüsü detaylarını paylaşırken spoiler uyarısı yapmanız zorunludur. Spoiler uyarısı yapılmadan paylaşılan içerikler kaldırılabilir.',
      },
      {
        subtitle: 'Telif Hakkı',
        text: 'Başkalarına ait metinleri, görselleri veya diğer içerikleri telif hakkı sahibinin izni olmadan paylaşamazsınız. Film fragmanları ve afişler resmi kaynaklardan (TMDb) çekilmektedir.',
      },
    ],
  },
  {
    title: '4. Platform Kullanımı',
    content: [
      {
        subtitle: 'Adil Kullanım',
        text: 'Platformu yalnızca meşru amaçlar için kullanabilirsiniz. Otomatik botlar, scraper\'lar veya API\'yi aşmaya yönelik araçlar kullanmak yasaktır. Sistemin güvenliğini tehdit eden her türlü girişim derhal yasal işleme tabi tutulacaktır.',
      },
      {
        subtitle: 'Sahte Değerlendirme',
        text: 'Bir filmi veya diziyi manipüle etmek amacıyla sahte hesaplar kullanarak puan vermek, yorum yazmak veya oy kullanmak yasaktır. Bu tür manipülasyonlar tespit edildiğinde ilgili hesaplar kalıcı olarak kapatılır.',
      },
      {
        subtitle: 'Ticari Kullanım',
        text: 'Sinezon içeriklerini veya altyapısını ticari amaçla kullanmak, kopyalamak veya başka bir platformda yayınlamak yasaktır.',
      },
    ],
  },
  {
    title: '5. Fikri Mülkiyet',
    content: [
      {
        subtitle: 'Sinezon Mülkiyeti',
        text: 'Sinezon logosu, tasarımı, kodu ve özgün içerikleri telif hakkıyla korunmaktadır. Bu materyaller yazılı izin olmaksızın kullanılamaz.',
      },
      {
        subtitle: 'Kullanıcı İçerikleri',
        text: 'Platforma yüklediğiniz yorum, alıntı, liste ve diğer içeriklerin telif hakkı size aittir. Ancak bu içerikleri Sinezon\'da yayınlayarak, Sinezon\'un bu içerikleri platform dahilinde görüntüleme, işleme ve tanıtım amacıyla kullanma hakkı verdiğinizi kabul edersiniz.',
      },
    ],
  },
  {
    title: '6. Moderasyon ve Yaptırımlar',
    content: [
      {
        subtitle: 'İçerik Moderasyonu',
        text: 'Sinezon moderatörleri bu şartlara aykırı içerikleri önceden bildirim yapmaksızın kaldırma hakkını saklı tutar. Kaldırılan içerikler için itiraz hakkı saklıdır.',
      },
      {
        subtitle: 'Hesap Yaptırımları',
        text: 'Kural ihlallerine bağlı olarak uyarı, geçici askıya alma veya kalıcı hesap kapatma yaptırımları uygulanabilir. Ciddi ihlallerde (yasadışı içerik, sisteme zarar verme) doğrudan kalıcı kapatma uygulanır.',
      },
      {
        subtitle: 'Bildirim',
        text: 'Uygunsuz içerik gördüğünüzde "Şikayet Et" butonunu kullanabilir veya sinezon@iletisim.com adresine e-posta gönderebilirsiniz.',
      },
    ],
  },
  {
    title: '7. Hizmet Değişiklikleri ve Kesintiler',
    content: [
      {
        subtitle: '',
        text: 'Sinezon; özelliklerini değiştirme, kaldırma veya ekleme hakkını önceden bildirim yaparak veya yapmaksızın saklı tutar. Bakım, güncelleme veya teknik sorunlar nedeniyle hizmet geçici olarak kesintiye uğrayabilir. Bu kesintilerden Sinezon sorumlu tutulamaz.',
      },
    ],
  },
  {
    title: '8. Sorumluluk Reddi',
    content: [
      {
        subtitle: 'Kullanıcı İçeriği',
        text: 'Sinezon, kullanıcılar tarafından oluşturulan içeriklerin doğruluğundan veya güvenilirliğinden sorumlu değildir. Yorumlar ve puanlamalar kullanıcıların kişisel görüşlerini yansıtmaktadır.',
      },
      {
        subtitle: 'Üçüncü Taraf Bağlantılar',
        text: 'Platformda yer alan dış bağlantılar (streaming hizmetleri, haber kaynakları vb.) Sinezon\'a ait değildir. Bu sitelerdeki içerik ve gizlilik politikalarından Sinezon sorumlu değildir.',
      },
    ],
  },
  {
    title: '9. Uygulanacak Hukuk',
    content: [
      {
        subtitle: '',
        text: 'Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir. Anlaşmazlık halinde Türkiye mahkemeleri yetkilidir. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki haklarınız için Gizlilik Politikamızı inceleyebilirsiniz.',
      },
    ],
  },
  {
    title: '10. Şartların Güncellenmesi',
    content: [
      {
        subtitle: '',
        text: 'Bu kullanım şartlarını zaman zaman güncelleyebiliriz. Önemli değişiklikler öncesinde platforma giriş yaptığınızda bildirim gösterilecektir. Güncelleme sonrası platformu kullanmaya devam etmeniz yeni şartları kabul ettiğiniz anlamına gelir.',
      },
    ],
  },
  {
    title: '11. İletişim',
    content: [
      {
        subtitle: '',
        text: 'Kullanım şartlarına ilişkin sorularınız için sinezon@iletisim.com adresine yazabilirsiniz. İletişim talebinizi en geç 5 iş günü içinde yanıtlamaya çalışıyoruz.',
      },
    ],
  },
]

export default function KullanimSartlariPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #E11D48 0%, #be123c 100%)' }} />
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Kullanım Şartları</h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Son güncelleme: 28 Haziran 2026
        </p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Sinezon'a üye olarak veya platformumuzu kullanarak aşağıdaki şart ve koşulları kabul etmiş sayılırsınız.
          Lütfen dikkatlice okuyun.
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
        <a href="/gizlilik" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Gizlilik Politikası →
        </a>
        <a href="/hakkimizda" className="hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Hakkımızda →
        </a>
      </div>
    </div>
  )
}
