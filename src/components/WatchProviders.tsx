'use client'

import { useState } from 'react'
import type { WatchProviderResult } from '@/lib/tmdb'
import { useLocale } from '@/context/LocaleContext'
import { IconPlay, IconTag, IconCreditCard, IconShoppingCart, IconExternalLink } from '@/components/icons'

interface Props {
  allProviders: Record<string, WatchProviderResult> | null
  mediaType?: 'film' | 'dizi'
  title?: string
}

const COUNTRIES: { code: string; flag: string; nameKey: string }[] = [
  { code: 'TR', flag: '🇹🇷', nameKey: 'Turkey' },
  { code: 'US', flag: '🇺🇸', nameKey: 'Usa' },
  { code: 'GB', flag: '🇬🇧', nameKey: 'Uk' },
  { code: 'DE', flag: '🇩🇪', nameKey: 'Germany' },
  { code: 'FR', flag: '🇫🇷', nameKey: 'France' },
  { code: 'IT', flag: '🇮🇹', nameKey: 'Italy' },
  { code: 'ES', flag: '🇪🇸', nameKey: 'Spain' },
  { code: 'NL', flag: '🇳🇱', nameKey: 'Netherlands' },
  { code: 'CA', flag: '🇨🇦', nameKey: 'Canada' },
  { code: 'AU', flag: '🇦🇺', nameKey: 'Australia' },
  { code: 'JP', flag: '🇯🇵', nameKey: 'Japan' },
  { code: 'KR', flag: '🇰🇷', nameKey: 'SouthKorea' },
  { code: 'BR', flag: '🇧🇷', nameKey: 'Brazil' },
  { code: 'MX', flag: '🇲🇽', nameKey: 'Mexico' },
  { code: 'IN', flag: '🇮🇳', nameKey: 'India' },
  { code: 'SE', flag: '🇸🇪', nameKey: 'Sweden' },
  { code: 'NO', flag: '🇳🇴', nameKey: 'Norway' },
  { code: 'PL', flag: '🇵🇱', nameKey: 'Poland' },
  { code: 'PT', flag: '🇵🇹', nameKey: 'Portugal' },
  { code: 'AR', flag: '🇦🇷', nameKey: 'Argentina' },
]

const SECTION_ICONS: Record<string, typeof IconPlay> = {
  flatrate: IconPlay,
  free: IconTag,
  rent: IconCreditCard,
  buy: IconShoppingCart,
}

// Abonelik platformları → anasayfa
const PROVIDER_HOME: Record<number, string> = {
  8:    'https://www.netflix.com',
  9:    'https://www.primevideo.com',
  10:   'https://www.amazon.com/Prime-Video',
  337:  'https://www.disneyplus.com',
  350:  'https://tv.apple.com',
  2:    'https://tv.apple.com',
  1899: 'https://www.max.com',
  384:  'https://www.max.com',
  531:  'https://www.paramountplus.com',
  15:   'https://www.hulu.com',
  3:    'https://play.google.com/store/movies',
  192:  'https://www.youtube.com',
  188:  'https://www.youtube.com/premium',
  11:   'https://mubi.com',
  283:  'https://www.crunchyroll.com',
  35:   'https://www.viki.com',
  341:  'https://www.blutv.com',
  582:  'https://www.gain.tv',
  1870: 'https://www.exxen.com',
  619:  'https://www.stan.com.au',
  167:  'https://www.sky.com',
  103:  'https://www.channel4.com',
  43:   'https://www.starz.com',
  87:   'https://www.epix.com',
  300:  'https://www.peacocktv.com',
  386:  'https://www.peacocktv.com',
  257:  'https://fubo.tv',
  237:  'https://www.tubitv.com',
  73:   'https://www.tubitv.com',
}

// Kiralama / Satın Al → başlık ile arama URL'i oluştur
// TMDb API doğrudan platform kiralama linki vermiyor; en yakın yol platform araması
function buildSearchUrl(providerId: number, title: string): string | null {
  const q = encodeURIComponent(title)
  switch (providerId) {
    case 9:
    case 10:  return `https://www.amazon.com/s?k=${q}&i=instant-video`
    case 2:   return `https://tv.apple.com/search?term=${q}`
    case 350: return `https://tv.apple.com/search?term=${q}`
    case 3:   return `https://play.google.com/store/search?q=${q}&c=movies`
    case 192: return `https://www.youtube.com/results?search_query=${q}&sp=EgIQAQ%3D%3D`
    case 7:   return `https://www.vudu.com/content/movies/search?searchString=${q}`
    case 68:  return `https://www.microsoft.com/en-us/search/shop/movies?q=${q}`
    case 100: return `https://mubi.com/en/films?q=${q}`
    default:  return null
  }
}

export default function WatchProviders({ allProviders, title = '' }: Props) {
  const { t } = useLocale()
  const [selectedCountry, setSelectedCountry] = useState('TR')

  if (!allProviders) return null

  function sectionLabel(section: string) {
    if (section === 'flatrate') return t('watchProviders.sectionFlatrate')
    if (section === 'free') return t('watchProviders.sectionFree')
    if (section === 'rent') return t('watchProviders.rent')
    if (section === 'buy') return t('watchProviders.buy')
    return section
  }

  const availableCountryCodes = new Set(Object.keys(allProviders))
  const availableCountries = COUNTRIES.filter(c => availableCountryCodes.has(c.code))

  const activeCode = availableCountryCodes.has(selectedCountry)
    ? selectedCountry
    : availableCountries[0]?.code ?? ''

  const providers = activeCode ? allProviders[activeCode] : null
  const sections = providers
    ? (['flatrate', 'free', 'rent', 'buy'] as const).filter(k => providers[k]?.length)
    : []

  if (availableCountries.length === 0) return null

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <p className="text-sm font-semibold text-white">{t('watchProviders.title')}</p>
        {providers?.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[--text-secondary] hover:text-white transition-colors"
          >
            JustWatch →
          </a>
        )}
      </div>

      {/* Ülke seçici */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {availableCountries.map(c => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
              activeCode === c.code
                ? 'bg-[--accent] text-white font-semibold'
                : 'text-white/40 hover:text-white hover:border-[--accent]/40 bg-white/5 border border-white/8'
            }`}
          >
            <span>{c.flag}</span>
            <span>{t(`watchProviders.country${c.nameKey}`)}</span>
          </button>
        ))}
      </div>

      {sections.length === 0 ? (
        <p className="text-xs text-[--text-secondary]">{t('watchProviders.noProviderData')}</p>
      ) : (
        <div className="space-y-3">
          {sections.map(section => {
            const SectionIcon = SECTION_ICONS[section]
            return (
            <div key={section}>
              <div className="flex items-center gap-2 mb-1.5">
                <p className="flex items-center gap-1 text-[10px] text-[--text-secondary] uppercase font-semibold">
                  <SectionIcon size={12} /> {sectionLabel(section)}
                </p>
                {(section === 'rent' || section === 'buy') && providers?.link && (
                  <span className="text-[9px] opacity-40">· {t('watchProviders.viaJustWatch')}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {providers![section]!
                  .sort((a, b) => a.display_priority - b.display_priority)
                  .map(p => {
                    const isSubscription = section === 'flatrate' || section === 'free'
                    let href: string
                    if (isSubscription) {
                      // Abonelik → platformun anasayfası (zaten abone, içerik dahil)
                      href = PROVIDER_HOME[p.provider_id] ?? providers?.link ?? '#'
                    } else {
                      // Kira / Satın Al:
                      // 1. Desteklenen platform → arama URL'i (başlık ile platform araması)
                      // 2. Desteklenmeyen → JustWatch içerik sayfası (tek tıkla platforma gider)
                      href = buildSearchUrl(p.provider_id, title)
                        ?? providers?.link
                        ?? PROVIDER_HOME[p.provider_id]
                        ?? '#'
                    }

                    const actionLabel = section === 'rent' ? t('watchProviders.rent') : section === 'buy' ? t('watchProviders.buy') : t('watchProviders.watch')

                    return (
                      <a
                        key={p.provider_id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('watchProviders.actionTitle', { provider: p.provider_name, action: actionLabel })}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all hover:scale-[1.04] hover:brightness-125 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {p.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                            alt={p.provider_name}
                            className="w-5 h-5 rounded-sm object-cover"
                          />
                        )}
                        <span className="text-xs text-white">{p.provider_name}</span>
                        <IconExternalLink size={11} className="opacity-40" />
                      </a>
                    )
                  })}
              </div>
            </div>
            )
          })}
        </div>
      )}

      <p className="text-[10px] text-[--text-secondary] mt-3">
        {t('watchProviders.availableInCountries', { count: availableCountries.length })}
      </p>
    </div>
  )
}
