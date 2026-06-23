# SineMa — Tasarım Sistemi & Stil Rehberi

## Marka

| | |
|---|---|
| **Marka adı** | SineMa |
| **Yazım** | `Sine` beyaz + `Ma` kırmızı (`text-[--accent]`) |
| **Slogan** | Film & Dizi Yorumları |
| **Ton** | Şık, sinematik, karanlık-ağırlıklı |

---

## Renk Sistemi

Tüm renkler CSS custom property ile tanımlanır — asla hardcode etme.

### Dark Mode (varsayılan)
```css
--bg-primary:    #0a0a0a   /* Sayfa arka planı */
--bg-secondary:  #141414   /* İkincil arka plan, input */
--bg-card:       #1c1c1c   /* Kart arka planı */
--text-primary:  #ffffff   /* Ana metin */
--text-secondary:#a3a3a3   /* İkincil metin, placeholder */
--border:        #2a2a2a   /* Kenarlıklar */
--skeleton:      #2a2a2a   /* Skeleton animasyon */
--accent:        #e50914   /* Ana vurgu — SineMa kırmızısı */
--accent-hover:  #b20710   /* Hover durumu */
--gold:          #f5c518   /* Yıldız / puan rengi (IMDb gold) */
```

### Light Mode
```css
--bg-primary:    #f4f4f5
--bg-secondary:  #e8e8ea
--bg-card:       #ffffff
--text-primary:  #111111
--text-secondary:#6b7280
--border:        #d4d4d8
--skeleton:      #e4e4e7
--accent:        #e50914
--accent-hover:  #b20710
--gold:          #b8860b
```

### Kullanım Örnekleri
```tsx
// Doğru
className="bg-[--bg-card] text-[--text-primary] border-[--border]"
className="text-[--accent] hover:bg-[--accent-hover]"
className="text-[--gold]"  // yıldız puanı

// Yanlış — asla yapma
className="bg-zinc-900 text-white border-zinc-700"
className="text-red-600"
```

---

## Tipografi

```
Font: System font stack (Tailwind varsayılanı)
Başlık: font-bold, text-white
Alt başlık: font-semibold, text-white
Metin: text-[--text-secondary], leading-relaxed
Küçük: text-xs veya text-sm, text-[--text-secondary]
Vurgu: text-[--accent]
```

### Boyut Hiyerarşisi
| Kullanım | Class |
|---|---|
| Sayfa başlığı | `text-3xl font-bold text-white` |
| Bölüm başlığı | `text-xl font-bold text-white` |
| Kart başlığı | `text-base font-semibold text-white` |
| Normal metin | `text-sm text-[--text-secondary]` |
| Meta bilgi | `text-xs text-[--text-secondary]` |

---

## Boşluk & Layout

```
Sayfa padding:   px-4 sm:px-6 lg:px-8
Sayfa max-width: max-w-7xl mx-auto (genel) / max-w-4xl (içerik)
Dikey padding:   py-10
Kart padding:    p-5 veya p-6
Gap (grid):      gap-4 veya gap-6
```

---

## Bileşen Stilleri

### Kart
```tsx
className="rounded-2xl bg-[--bg-card] border border-[--border] p-5
           hover:border-[--accent]/40 transition-all
           hover:shadow-lg hover:shadow-black/20"
```

### Buton — Primary (Aksiyon)
```tsx
className="px-4 py-2 rounded-full bg-[--accent] hover:bg-[--accent-hover]
           text-white text-sm font-semibold transition-colors"
```

### Buton — Secondary (İkincil)
```tsx
className="px-4 py-2 rounded-full border border-[--border]
           text-[--text-secondary] hover:text-white hover:border-white/30
           text-sm font-medium transition-colors"
```

### Buton — Ghost (Şeffaf)
```tsx
className="px-3 py-1.5 rounded-lg text-[--text-secondary]
           hover:text-white hover:bg-[--bg-secondary]
           text-sm transition-colors"
```

### Input
```tsx
className="w-full rounded-lg bg-[--bg-secondary] border border-[--border]
           px-4 py-3 text-sm text-white placeholder-[--text-secondary]
           outline-none focus:border-[--accent] transition-colors"
```

### Badge / Etiket
```tsx
// Tür rozeti
className="px-3 py-1 rounded-full bg-[--bg-secondary] border border-[--border]
           text-xs text-[--text-secondary] hover:text-white hover:border-[--accent]/30
           transition-colors"

// Sayı rozeti (bildirim, rank vb.)
className="h-5 min-w-5 px-1 rounded bg-[--accent] text-white text-[10px] font-bold
           flex items-center justify-center"
```

### Avatar
```tsx
// Küçük (navbar, liste)
className="h-7 w-7 rounded-full bg-[--accent] flex items-center justify-center
           text-xs font-bold text-white overflow-hidden"

// Orta (profil kart)
className="h-10 w-10 rounded-full ..."

// Büyük (profil sayfası)
className="h-20 w-20 rounded-full ..."
```

### Film/Dizi Poster Kartı
```tsx
// Poster
className="aspect-[2/3] rounded-xl overflow-hidden bg-[--bg-card]
           border border-[--border] group-hover:border-[--accent]/50
           transition-colors"

// Başlık
className="mt-1.5 text-sm text-[--text-secondary] line-clamp-1
           group-hover:text-white transition-colors"
```

---

## İkon Kullanımı

**Tüm ikonlar `@/components/icons` kütüphanesinden gelir.**

```tsx
import { IconStar, IconFilm, IconHeart } from '@/components/icons'

// Kullanım
<IconStar className="h-4 w-4 text-[--gold]" />
<IconFilm className="h-5 w-5 text-[--accent]" />
<IconHeart className="h-4 w-4 text-red-400" />
```

### İkon Boyut Rehberi
| Bağlam | Boyut |
|---|---|
| Navbar linkleri | `h-3.5 w-3.5` |
| Buton içi | `h-4 w-4` |
| Bölüm başlığı | `h-5 w-5` |
| Hero / büyük vurgu | `h-6 w-6` veya `h-7 w-7` |
| Empty state | `h-12 w-12 opacity-30` |

---

## Animasyonlar

```css
/* Skeleton pulse */
.animate-pulse { animation: pulse-skeleton 1.8s ease-in-out infinite; }

/* Geçişler */
transition-colors   /* renk geçişi, hover efektleri */
transition-all      /* kart hover efekti */
transition-opacity  /* görünürlük geçişi */

/* Süre */
duration-200        /* buton hover (hızlı) */
duration-300        /* kart geçişi (orta) */
```

---

## Sayfa Yapısı Şablonu

```tsx
export default async function SayfaAdi() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-8">
        <IconFilm className="h-7 w-7 text-[--accent]" />
        <h1 className="text-3xl font-bold text-white">Sayfa Başlığı</h1>
      </div>

      {/* İçerik */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ... */}
      </div>
    </div>
  )
}
```

---

## Responsive Breakpoints

```
sm:  640px  — küçük tablet
md:  768px  — tablet
lg:  1024px — küçük masaüstü
xl:  1280px — masaüstü
```

### Grid Kullanımı
```tsx
// Film/dizi listesi
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"

// Kart listesi (geniş)
className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"

// İki kolon
className="grid md:grid-cols-2 gap-6"
```

---

## Dark/Light Mode

`html.dark` ve `html.light` sınıfları ile kontrol edilir.
FOUC (flash of unstyled content) önlemek için `ThemeScript` `<head>`'de inline script çalıştırır.
Geçiş: `body { transition: background-color 0.2s ease, color 0.2s ease; }`
