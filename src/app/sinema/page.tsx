import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dünya Sineması | SineMa' }

const ULKELER = [
  { slug: 'kore',       kod: 'KR', bayrak: '🇰🇷', ad: 'Kore',          tmdb: 'KR', aciklama: 'K-Drama ve K-Film' },
  { slug: 'japonya',    kod: 'JP', bayrak: '🇯🇵', ad: 'Japonya',        tmdb: 'JP', aciklama: 'Anime, Manga adaptasyonları' },
  { slug: 'fransa',     kod: 'FR', bayrak: '🇫🇷', ad: 'Fransa',         tmdb: 'FR', aciklama: 'Fransız sineması' },
  { slug: 'italya',     kod: 'IT', bayrak: '🇮🇹', ad: 'İtalya',         tmdb: 'IT', aciklama: 'İtalyan klasikleri' },
  { slug: 'ispanya',    kod: 'ES', bayrak: '🇪🇸', ad: 'İspanya',        tmdb: 'ES', aciklama: 'İspanyolca yapımlar' },
  { slug: 'almanya',    kod: 'DE', bayrak: '🇩🇪', ad: 'Almanya',        tmdb: 'DE', aciklama: 'Alman sineması' },
  { slug: 'hindistan',  kod: 'IN', bayrak: '🇮🇳', ad: 'Hindistan',      tmdb: 'IN', aciklama: 'Bollywood ve ötesi' },
  { slug: 'cin',        kod: 'CN', bayrak: '🇨🇳', ad: 'Çin',            tmdb: 'CN', aciklama: 'Çin yapımları' },
  { slug: 'turkiye',    kod: 'TR', bayrak: '🇹🇷', ad: 'Türkiye',        tmdb: 'TR', aciklama: 'Yerli filmler ve diziler' },
  { slug: 'ingiltere',  kod: 'GB', bayrak: '🇬🇧', ad: 'İngiltere',      tmdb: 'GB', aciklama: 'İngiliz yapımları' },
  { slug: 'brezilya',   kod: 'BR', bayrak: '🇧🇷', ad: 'Brezilya',       tmdb: 'BR', aciklama: 'Brezilya sineması' },
  { slug: 'meksika',    kod: 'MX', bayrak: '🇲🇽', ad: 'Meksika',        tmdb: 'MX', aciklama: 'Meksika yapımları' },
  { slug: 'iran',       kod: 'IR', bayrak: '🇮🇷', ad: 'İran',           tmdb: 'IR', aciklama: 'İran sineması' },
  { slug: 'rusya',      kod: 'RU', bayrak: '🇷🇺', ad: 'Rusya',          tmdb: 'RU', aciklama: 'Rus yapımları' },
  { slug: 'tayland',    kod: 'TH', bayrak: '🇹🇭', ad: 'Tayland',        tmdb: 'TH', aciklama: 'Tayland yapımları' },
  { slug: 'avustralya', kod: 'AU', bayrak: '🇦🇺', ad: 'Avustralya',     tmdb: 'AU', aciklama: 'Avustralya yapımları' },
]

export default function DunyaSinemasPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">🌍 Dünya Sineması</h1>
        <p className="text-[--text-secondary]">Ülkeye göre film ve dizi keşfet</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ULKELER.map(u => (
          <Link key={u.slug} href={`/sinema/${u.slug}`}
            className="group flex flex-col items-center gap-2 p-5 rounded-2xl transition-all hover:-translate-y-1 text-center"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-4xl">{u.bayrak}</span>
            <div>
              <p className="font-bold text-white text-sm">{u.ad}</p>
              <p className="text-[10px] text-[--text-secondary] mt-0.5">{u.aciklama}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
