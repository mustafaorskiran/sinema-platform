# Sinezon — Claude Code Rehberi

## Proje
IMDb + Letterboxd + Netflix karışımı sosyal film/dizi platformu.
Stack: Next.js (App Router) · Supabase (PostgreSQL + Auth + RLS) · TMDb API · Vercel

## Tasarım Hedefi
Premium/luxury görünüm. Koyu lacivert arka plan (`--bg-primary: #0B0F19`), rose-red vurgu (`--accent: #E11D48`), altın puan rengi (`--gold: #D4A843`). UI dili Türkçe.

## Kod Kuralları

- `<img>` kullan — `next/image` kullanma
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

## Kritik Bilgiler

- Supabase Proje ID: `wbomlhiagwjkncauslgr`
- Junction path: `C:\sinema-dev`
- Admin: `mustafaorskiran@gmail.com`
- CSS değişkenleri `src/app/globals.css`'de
- TMDb fonksiyonları: `getPosterUrl`, `getBackdropUrl`, `getMediaTitle`, `getMediaYear` → `@/lib/tmdb`
- Özel kategori filtreleri → `@/lib/ozel-kategoriler.ts`
