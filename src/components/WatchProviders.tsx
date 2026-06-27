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

export default function WatchProviders({ allProviders, mediaType }: Props) {
  const basePage = mediaType === 'dizi' ? '/diziler' : '/filmler'
  const [selectedCountry, setSelectedCountry] = useState('TR')

  if (!allProviders) return null

  // Sadece veri olan ülkeleri göster, öncelik sırasına göre yeniden sırala
  const availableCountryCodes = new Set(Object.keys(allProviders))
  const availableCountries = COUNTRIES.filter(c => availableCountryCodes.has(c.code))

  // Eğer TR yoksa ilk mevcut ülkeyi seç
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
                    const inner = (
                      <>
                        {p.logo_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                            alt={p.provider_name}
                            className="w-5 h-5 rounded-sm object-cover"
                          />
                        )}
                        <span className="text-xs text-white">{p.provider_name}</span>
                      </>
                    )
                    const cls = "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:border-[--accent]/40 transition-colors"
                    const clsStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                    return mediaType ? (
                      <a
                        key={p.provider_id}
                        href={`${basePage}?platform=${p.provider_id}`}
                        title={`${p.provider_name}'deki tüm ${mediaType === 'dizi' ? 'diziler' : 'filmler'}`}
                        className={cls + " cursor-pointer"}
                        style={clsStyle}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div key={p.provider_id} title={p.provider_name} className={cls} style={clsStyle}>
                        {inner}
                      </div>
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
