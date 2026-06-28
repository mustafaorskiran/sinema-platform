'use client'

import { useState } from 'react'
import type { WatchProviderResult } from '@/lib/tmdb'

interface Props {
  allProviders: Record<string, WatchProviderResult> | null
  mediaType?: 'film' | 'dizi'
}

const COUNTRIES: { code: string; flag: string; name: string }[] = [
  { code: 'TR', flag: '🇹🇷', name: 'Türkiye' },
  { code: 'US', flag: '🇺🇸', name: 'ABD' },
  { code: 'GB', flag: '🇬🇧', name: 'İngiltere' },
  { code: 'DE', flag: '🇩🇪', name: 'Almanya' },
  { code: 'FR', flag: '🇫🇷', name: 'Fransa' },
  { code: 'IT', flag: '🇮🇹', name: 'İtalya' },
  { code: 'ES', flag: '🇪🇸', name: 'İspanya' },
  { code: 'NL', flag: '🇳🇱', name: 'Hollanda' },
  { code: 'CA', flag: '🇨🇦', name: 'Kanada' },
  { code: 'AU', flag: '🇦🇺', name: 'Avustralya' },
  { code: 'JP', flag: '🇯🇵', name: 'Japonya' },
  { code: 'KR', flag: '🇰🇷', name: 'Güney Kore' },
  { code: 'BR', flag: '🇧🇷', name: 'Brezilya' },
  { code: 'MX', flag: '🇲🇽', name: 'Meksika' },
  { code: 'IN', flag: '🇮🇳', name: 'Hindistan' },
  { code: 'SE', flag: '🇸🇪', name: 'İsveç' },
  { code: 'NO', flag: '🇳🇴', name: 'Norveç' },
  { code: 'PL', flag: '🇵🇱', name: 'Polonya' },
  { code: 'PT', flag: '🇵🇹', name: 'Portekiz' },
  { code: 'AR', flag: '🇦🇷', name: 'Arjantin' },
]

const SECTION_LABELS: Record<string, string> = {
  flatrate: '▶️ Abonelik',
  free: '🆓 Ücretsiz',
  rent: '💳 Kirala',
  buy: '🛒 Satın Al',
}

// Bilinen streaming platformlarının URL'leri (provider_id → anasayfa)
const PROVIDER_URLS: Record<number, string> = {
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

export default function WatchProviders({ allProviders }: Props) {
  const [selectedCountry, setSelectedCountry] = useState('TR')

  if (!allProviders) return null

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
        <p className="text-sm font-semibold text-white">Nerede İzlenir?</p>
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
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {sections.length === 0 ? (
        <p className="text-xs text-[--text-secondary]">Bu ülkede platform verisi bulunamadı.</p>
      ) : (
        <div className="space-y-3">
          {sections.map(section => (
            <div key={section}>
              <p className="text-[10px] text-[--text-secondary] uppercase font-semibold mb-1.5">
                {SECTION_LABELS[section]}
              </p>
              <div className="flex flex-wrap gap-2">
                {providers![section]!
                  .sort((a, b) => a.display_priority - b.display_priority)
                  .map(p => {
                    const providerUrl = PROVIDER_URLS[p.provider_id]
                    // Bilinen platform → doğrudan platforma git, bilinmiyor → JustWatch'a
                    const href = providerUrl ?? providers?.link ?? '#'

                    return (
                      <a
                        key={p.provider_id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${p.provider_name}'de izle`}
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
                        <span className="text-[10px] opacity-40">↗</span>
                      </a>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-[--text-secondary] mt-3">
        {availableCountries.length} ülkede mevcut · JustWatch verisi
      </p>
    </div>
  )
}
