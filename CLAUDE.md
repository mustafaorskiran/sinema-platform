# Sinezon — Claude Code Rehberi

## Proje
IMDb + Letterboxd + Netflix karışımı sosyal film/dizi platformu.
Stack: Next.js (App Router) · Supabase (PostgreSQL + Auth + RLS) · TMDb API · Vercel

## Tasarım Hedefi
Premium/luxury görünüm. Koyu lacivert arka plan (`--bg-primary: #0B0F19`), rose-red vurgu (`--accent: #E11D48`), altın puan rengi (`--gold: #D4A843`). UI dili Türkçe.

## Kod Kuralları

- `next/image` kullan — `<img>` artık kullanılmıyor (2026-06-23'ten itibaren geçiş yapıldı)
- İkonlar sadece `@/components/icons`'dan — lucide-react import yapma
- Renk için CSS variable kullan: `text-[--accent]`, `bg-[--bg-card]` vb. — Tailwind renk class'ı kullanma
- Server Component'ta veri çek, Client Component'ta etkileşim yaz (`'use client'`)
- `createClient()` → server için `@/lib/supabase/server`, client için `@/lib/supabase/client`

## Çalışma Protokolü

1. Önce ilgili dosyaları oku, sonra uygula
2. Mevcut sistemi bozma — yeni özellik eklerken mevcut API ve component arayüzlerini koru
3. TypeScript hatası bırakma
4. Her görev sonunda çalıştır ve sonucu raporla:
   ```
   npx tsc --noEmit
   npm run build
   ```
5. Gereksiz dosya tarama yapma — doğrudan ilgili dosyaya git

## Commit Kuralları

Her görev sonunda değişiklikler commit edilmeden tamamlanmış sayılmaz:
```
git add .
git commit -m "type: açıklama"
git push origin master  # remote varsa
```
Prefix'ler: `feat:` `fix:` `refactor:` `perf:` `security:` `style:`

## Son Değişiklikler (2026-06-23 — 2. batch)

- `rateLimit.ts`: In-memory → Upstash Redis (`@upstash/ratelimit`, `@upstash/redis`). Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `src/middleware.ts`: Yeni dosya. Supabase session refresh + /admin/* server-side koruma
- `src/proxy.ts`: Silindi (middleware.ts ile birleştirildi)
- `vercel.json`: Güvenlik headerları eklendi (X-Frame-Options, CSP vb.)
- `next.config.ts`: *.supabase.co + lh3.googleusercontent.com image domain eklendi
- `MovieCard, HomeCarousel, CastRow, Navbar`: `<img>` → `next/image` geçişi
- Navbar: overflow:visible, nav gap-0.5, search md:block

## Son Değişiklikler (2026-06-23 — 4. batch)

- Navbar UX yeniden yapılandırıldı:
  - Desktop: `hidden md:grid` 3-sütun layout (`auto | 1fr | auto`): Logo+NavLinks (sol), arama kutusu (orta), Bildirim+Dil+Avatar (sağ)
  - Nav linkleri `lg:` breakpoint'te gösteriliyor (`md` ekranlarda sadece Logo+Arama+User — taşma yok)
  - Arama kutusu max-w: md=320px, lg=400px, xl=580px — placeholder: "Film, dizi, oyuncu veya liste ara..."
  - Akış / Öneriler / Film Gecesi / Mesajlar / Listem → yalnızca `UserDropdown` içinde
  - `UserDropdown`: "İzleme Listem" etiketi → "Listem" olarak güncellendi
  - Mobil üst bar: Bildirim ikonu (login varsa) + Arama toggle + Hamburger — tek satır, taşma yok
  - Mobil hamburger: genel linkler + "Hesabım" bölümü (Akış, Öneriler, Film Gecesi, Mesajlar, Listem, Çıkış) + Dil seçici

## Son Değişiklikler (2026-06-23 — 3. batch)

- Google OAuth butonu kaldırıldı (giris + kayit sayfaları). GoogleAuthButton.tsx bileşeni silinmedi, import kaldırıldı.
- UserDropdown.tsx: yeni bileşen. Avatar dropdown — is_admin ise Admin Paneli linki dahil.
- Navbar: 6 nav öğe (2 dropdown + 4 link). "Benim" ve "Keşfet" dropdown'ları kaldırıldı.
- layout.tsx: profiles tablosundan `username, is_admin` çekiliyor. User tipine `is_admin` eklendi.
- BottomNav.tsx: user tipine `is_admin` eklendi (layout uyumu için).

## Kritik Bilgiler

- Supabase Proje ID: `wbomlhiagwjkncauslgr`
- Junction path: `C:\sinema-dev`
- Admin: `mustafaorskiran@gmail.com`
- CSS değişkenleri `src/app/globals.css`'de
- TMDb fonksiyonları: `getPosterUrl`, `getBackdropUrl`, `getMediaTitle`, `getMediaYear` → `@/lib/tmdb`
- Özel kategori filtreleri → `@/lib/ozel-kategoriler.ts`
