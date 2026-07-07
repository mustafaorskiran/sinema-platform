import Link from 'next/link'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'
import { IconGlobe } from '@/components/icons'

export const metadata: Metadata = { title: 'Dünya Sineması | Sinezon' }

const ULKELER = [
  { slug: 'kore',       kod: 'KR', bayrak: '🇰🇷', nameKey: 'country.names.kore',       tmdb: 'KR', descKey: 'country.descs.kore' },
  { slug: 'japonya',    kod: 'JP', bayrak: '🇯🇵', nameKey: 'country.names.japonya',    tmdb: 'JP', descKey: 'country.descs.japonya' },
  { slug: 'fransa',     kod: 'FR', bayrak: '🇫🇷', nameKey: 'country.names.fransa',     tmdb: 'FR', descKey: 'country.descs.fransa' },
  { slug: 'italya',     kod: 'IT', bayrak: '🇮🇹', nameKey: 'country.names.italya',     tmdb: 'IT', descKey: 'country.descs.italya' },
  { slug: 'ispanya',    kod: 'ES', bayrak: '🇪🇸', nameKey: 'country.names.ispanya',    tmdb: 'ES', descKey: 'country.descs.ispanya' },
  { slug: 'almanya',    kod: 'DE', bayrak: '🇩🇪', nameKey: 'country.names.almanya',    tmdb: 'DE', descKey: 'country.descs.almanya' },
  { slug: 'hindistan',  kod: 'IN', bayrak: '🇮🇳', nameKey: 'country.names.hindistan',  tmdb: 'IN', descKey: 'country.descs.hindistan' },
  { slug: 'cin',        kod: 'CN', bayrak: '🇨🇳', nameKey: 'country.names.cin',        tmdb: 'CN', descKey: 'country.descs.cin' },
  { slug: 'turkiye',    kod: 'TR', bayrak: '🇹🇷', nameKey: 'country.names.turkiye',    tmdb: 'TR', descKey: 'country.descs.turkiye' },
  { slug: 'ingiltere',  kod: 'GB', bayrak: '🇬🇧', nameKey: 'country.names.ingiltere',  tmdb: 'GB', descKey: 'country.descs.ingiltere' },
  { slug: 'brezilya',   kod: 'BR', bayrak: '🇧🇷', nameKey: 'country.names.brezilya',   tmdb: 'BR', descKey: 'country.descs.brezilya' },
  { slug: 'meksika',    kod: 'MX', bayrak: '🇲🇽', nameKey: 'country.names.meksika',    tmdb: 'MX', descKey: 'country.descs.meksika' },
  { slug: 'iran',       kod: 'IR', bayrak: '🇮🇷', nameKey: 'country.names.iran',       tmdb: 'IR', descKey: 'country.descs.iran' },
  { slug: 'rusya',      kod: 'RU', bayrak: '🇷🇺', nameKey: 'country.names.rusya',      tmdb: 'RU', descKey: 'country.descs.rusya' },
  { slug: 'tayland',    kod: 'TH', bayrak: '🇹🇭', nameKey: 'country.names.tayland',    tmdb: 'TH', descKey: 'country.descs.tayland' },
  { slug: 'avustralya', kod: 'AU', bayrak: '🇦🇺', nameKey: 'country.names.avustralya', tmdb: 'AU', descKey: 'country.descs.avustralya' },
]

export default async function DunyaSinemasPage() {
  const { t } = await getTranslations()
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2"><IconGlobe size={32} /> {t('country.worldCinema')}</h1>
        <p className="text-[--text-secondary]">{t('country.exploreByCountry')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ULKELER.map(u => (
          <Link key={u.slug} href={`/sinema/${u.slug}`}
            className="group flex flex-col items-center gap-2 p-5 rounded-2xl transition-all hover:-translate-y-1 text-center"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-4xl">{u.bayrak}</span>
            <div>
              <p className="font-bold text-white text-sm">{t(u.nameKey)}</p>
              <p className="text-[10px] text-[--text-secondary] mt-0.5">{t(u.descKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
