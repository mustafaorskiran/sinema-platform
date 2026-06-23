# SineMa — Başlatma Kılavuzu

## 1. API Anahtarlarını Al

### TMDb API Key (Ücretsiz)
1. themoviedb.org adresine git ve hesap aç
2. Settings > API > API Key (v4 auth) kısmından key al
3. "Bearer Token" formatında bir key verilecek

### Supabase Projesi
1. supabase.com adresine git ve proje oluştur
2. Settings > API'dan şunları kopyala:
   - Project URL
   - anon/public key

## 2. .env.local Dosyasını Oluştur

Proje kökünde `.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TMDB_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Supabase Şemasını Kur

Supabase Dashboard > SQL Editor'a git ve `supabase-schema.sql` içeriğini çalıştır.

## 4. Geliştirme Sunucusunu Başlat

> ÖNEMLİ: Klasör adında `&` karakteri var. Sunucuyu şu yöntemle başlat:

**Windows CMD ile:**
```
cd "C:\Users\user\Desktop\Sinema & dizi yorum platformu\sinema-platform"
npm run dev
```

**Veya Git Bash ile:**
```
cd "/c/sinema-dev"
npm run dev
```

(`C:\sinema-dev` junction olarak zaten kurulu)

Sonra: http://localhost:3000

## Proje Yapısı

```
src/
├── app/
│   ├── page.tsx          ← Ana sayfa (trend + popüler)
│   ├── film/[id]/        ← Film detay + yorumlar
│   ├── dizi/[id]/        ← Dizi detay + yorumlar
│   ├── filmler/          ← Film listesi
│   ├── diziler/          ← Dizi listesi
│   ├── arama/            ← Arama sonuçları
│   ├── auth/giris/       ← Giriş sayfası
│   ├── auth/kayit/       ← Kayıt sayfası
│   └── api/reviews/      ← Yorum API (POST/PUT/DELETE)
├── components/
│   ├── Navbar.tsx
│   ├── MovieCard.tsx
│   ├── StarRating.tsx
│   ├── ReviewForm.tsx
│   └── ReviewList.tsx
└── lib/
    ├── tmdb.ts           ← TMDb API servisi
    ├── types.ts          ← TypeScript tipleri
    └── supabase/         ← Supabase client (browser + server)
```
