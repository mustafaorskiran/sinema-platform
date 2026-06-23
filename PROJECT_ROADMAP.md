# Sinezon — Proje Yol Haritası

## Tamamlananlar

- SEO (metadata, sitemap, canonical, OG)
- Google OAuth
- Mobil alt navigasyon
- Premium tema (koyu lacivert, rose-red, altın)
- Film/dizi filtre sistemi (tür, platform, yıl, puan, sıralama)
- Film/dizi liste kartları (MovieCard, MovieListItem yeniden tasarımı)
- Ana sayfa carousel bölümleri (6 yatay Netflix tarzı bölüm)
- Film/dizi detay sayfası premiumlaştırma (hero, bilgi kartları, fragman, oyuncu carousel, benzer içerikler)
- Profil sistemi
- Moderasyon / rate limit
- Özel kategori filtreleri — P3 tamamlandı:
  - 23 kategoride geçersiz/yanlış keyword ID düzeltildi
  - Kök neden: virgül=AND (çok kısıtlayıcı) → pipe (|) = OR'a çevrildi
  - Yeni doğru ID'ler: polisiye(703|179431), genclik(704|6270), uzay(3801|252634), noir(9807), steampunk(10028), found-footage(163053), psikolojik-korku(295907), yol-filmi(7312|167043), mahkeme(33519|214780|222517), askeri(162365), alternatif-tarih(12026) vb.
- Bildirim sistemi — P2 tamamlandı:
  - `/bildirimler` tam sayfa (server component, 100 bildirim, okunmamış vurgusu, avatar + tip badge)
  - `BildirimlerClient`: "Tümünü okundu işaretle" butonu (PATCH /api/notifications + router.refresh)
  - `NotificationBell` dropdown'ına "Tüm bildirimleri gör →" footer linki eklendi
  - Mobil menüye `/bildirimler` linki eklendi
- Listeler sistemi — P1 tamamlandı:
  - Liste detay sayfası: full-bleed hero (poster şerit kolajı veya kapak), istatistik kartları (İçerik/Beğeni/Takipçi), premium içerik ızgarası
  - ListeActions: butonlar büyütüldü, sayaç her zaman gösteriliyor (0 dahil)
  - Liste yorumları: kart arkaplanı, accent border'lı bölüm başlığı
  - ListCard: beğeni sayısı her zaman görünür
  - Listeler sayfası: "Bu Hafta Trend" bölümü (kalıcı, ayrı query), trend hesabı her zaman çalışıyor

- P0 Altyapı iyileştirmeleri — 2026-06-23:
  - `rateLimit.ts` → Upstash Redis sliding window (serverless-safe); in-memory fallback local dev için
  - `src/middleware.ts` oluşturuldu: Supabase session refresh + `/admin/*` server-level koruma
  - `src/proxy.ts` silindi (artık middleware.ts tarafından karşılanıyor)
  - `vercel.json`'a güvenlik headerları eklendi: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP
  - `next.config.ts`: Supabase Storage + Google OAuth avatar domain'leri eklendi
  - `<img>` → `next/image` (MovieCard, HomeCarousel, CastRow, Navbar arama önerileri)
  - Navbar responsive düzeltme: overflow:visible, shrink-0, search md:block
  - Auth sayfaları: w-full + py-12 ile tam ortalama garantisi

- Navbar UX iyileştirmesi — 2026-06-23 (4. batch):
  - Desktop: 3-sütun grid (`auto|1fr|auto`); arama merkeze taşındı (max-w 320→400→580px)
  - Akış, Öneriler, Film Gecesi, Mesajlar, Listem → yalnızca UserDropdown
  - UserDropdown: "İzleme Listem" → "Listem"
  - Mobil: Bildirim ikonu üst bara taşındı; hamburger "Hesabım" bölümü eklendi
  - Nav linkleri lg+ breakpoint'e alındı (md taşma önlendi)

- Auth & Navbar iyileştirmeleri — 2026-06-23:
  - Google OAuth butonu kaldırıldı (Supabase'de aktif değil; provider etkinleştirildiğinde geri eklenecek)
  - UserDropdown.tsx: avatar tıklama → animasyonlu dropdown (Profilim, İzleme Listem, Mesajlar, Akış, Öneriler, Film Gecesi, Ayarlar, Admin Paneli, Çıkış)
  - Navbar sadeleştirildi: Filmler (dropdown 6 öğe), Diziler (dropdown 6 öğe), Popüler, Ne İzlesem?, Listeler, Takvim
  - layout.tsx: is_admin profil bilgisi çekiliyor ve Navbar'a iletiliyor
  - Admin Panel linki sadece is_admin=true kullanıcılarda görünüyor

## Bilinen Buglar

- ~~Özel kategori filtreleri~~ ✅ — P3 kapsamında düzeltildi.

## Sıradaki İşler

| Öncelik | Görev |
|---------|-------|
| P1 | ~~Listeler sistemi güçlendirme~~ ✅ |
| P2 | ~~Bildirim sistemi~~ ✅ |
| P3 | ~~Özel kategori filtre keyword düzeltmeleri~~ ✅ |
| P4 | ~~Profil sayfası görsel polish~~ ✅ |
| P5 | ~~SEO son kontrol~~ ✅ |

## P10 — Migration Durumu Notu

- Kod tarafı tamamlandı (Kritik+Yüksek+Düşük+JSON-LD düzeltmeleri uygulandı).
- Production Supabase şeması manuel yönetiliyor; `supabase/migrations/` klasörü yok.
- `supabase-schema.sql` güncel değil — yalnızca `profiles` ve `reviews` tablolarını içeriyor.
- Kodda kullanılan toplam **39 tablo** var; 37'sinin şema kaydı yok (Dashboard'da yaşıyor).
- 2 RPC fonksiyonu (`find_similar_users`, `get_similar_user_picks`) şema dosyasında tanımsız.
- Migration işi ileri aşamada, güvenli bir staging ortamında `supabase db pull` ile yapılacak.
- Şimdilik production veritabanına müdahale edilmeyecek.

## Büyüme Sprinti — 24 Özellik (FAZ 1-5) ✅ 2026-06-23

### FAZ 1 — Keşif & İzleme Altyapısı ✅
- `CriticScores.tsx`: OMDB API → RT + Metacritic + IMDb skorları film sayfasında
- `WatchProviders.tsx`: JustWatch via TMDb — nerede izlenir (zaten vardı, entegre)
- Koleksiyon/Franchise kutusu film sayfasında (zaten vardı, entegre)
- Dark/Light mod: `ThemeToggle` navbar'a, `ThemeScript` layout'a eklendi

### FAZ 2 — Dizi & Bölüm Deneyimi ✅
- `WatchStatusButton.tsx` + `/api/watch-status`: 5 durum (izliyorum/tamamladım/bıraktım/izleyeceğim/askıda)
- `watch_status` Supabase tablosu (RLS + migration uygulandı)
- `SeasonTracker.tsx` + `episode_watches`: bölüm takibi + puanlama (zaten vardı, entegre)

### FAZ 3 — Sosyal & Topluluk ✅
- `/alintilar`: public alıntılar sayfası (quotes tablosundan, approved=true)
- `DemoRatings.tsx`: yaş grubu (18-25/26-40/40+) + Türkiye vs Dünya puan analizi
- `FilmPreviewPopup.tsx`: hover önizleme kartı (300ms delay, inline popup)
- Forum arama: `searchParams.q` + Supabase ilike filtresi

### FAZ 4 — Profil, İstatistikler & İçerik Akışı ✅
- `/yeni-gelenler`: Netflix/Disney+/Prime/MUBI yeni içerikler (TMDb Discover + watch_providers)
- `/haberler`: Beyazperde + Hollywood Reporter + Variety RSS (regex parse, ISR 1h)
- `/gise`: TMDb now_playing (TR) + popular (Dünya) gişe sıralaması
- Ana sayfa `HomeCarousel`: "Bu Hafta Trend" bölümü (watchlist frekans analizi)

### FAZ 5 — Büyüme, AI & Premium ✅
- `AISummary.tsx` + `/api/ai/film-ozeti`: Claude Haiku ile Türkçe film özeti
- `/quiz` + `QuizClient`: "Posteri Gör, Filmi Bul" — 10 soruluk quiz oyunu
- `/istatistikler`: platform genel istatistikleri (kullanıcı/yorum/watchlist/top5)
- `/yillik-hedef`: `YearlyChallenge` bileşeni ile yıllık izleme hedefi sayfası
- `/davet/[code]` + `/api/referral` + `InviteSection`: referral/davet sistemi
- `profiles` tablosuna `referral_code` + `referred_by` kolonları (migration ✅)
- Google OAuth: `GoogleAuthButton` zaten aktifti (giris + kayit sayfalarında mevcut)

### Supabase Migrations (sprint kapsamında)
- `create_watch_status_table`: watch_status tablosu + RLS politikaları
- `add_referral_code_to_profiles`: referral_code UNIQUE + referred_by FK

## Faz 2 — Büyüme ve Kullanıcı Bağlılığı

| Öncelik | Görev |
|---------|-------|
| P6 | Forum ve topluluk sayfalarını güçlendir |
| P7 | ~~Yorum/review deneyimini geliştirme~~ ✅ |
| P8 | ~~Kullanıcı öneri sistemi 2.0~~ ✅ |
| P9 | Film kulüpleri / ortak izleme listeleri |
| P10 | Final teknik borç ve performans denetimi (Teknik denetim tamamlandı; migration dokümantasyonu bekliyor) |
