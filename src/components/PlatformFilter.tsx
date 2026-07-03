'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
}

interface Props {
  providers: Provider[]
  basePath: string
  currentPlatform?: string
  currentParams: Record<string, string | undefined>
}

export default function PlatformFilter({ providers, basePath, currentPlatform, currentParams }: Props) {
  const router = useRouter()
  const { t } = useLocale()

  function navigate(platformId: string | undefined) {
    const params = new URLSearchParams()
    if (currentParams.genre)   params.set('genre',    currentParams.genre)
    if (currentParams.yil)     params.set('yil',      currentParams.yil)
    if (currentParams.puan)    params.set('puan',     currentParams.puan)
    if (currentParams.sirala)  params.set('sirala',   currentParams.sirala)
    if (currentParams.dil)     params.set('dil',      currentParams.dil)
    if (currentParams.goruntum && currentParams.goruntum !== 'liste')
      params.set('goruntum', currentParams.goruntum)
    if (platformId) params.set('platform', platformId)
    router.push(`${basePath}${params.toString() ? `?${params}` : ''}`)
  }

  if (providers.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[--border]">
      <span className="text-xs text-[--text-secondary] font-medium shrink-0">{t('browse.platformLabel')}</span>

      <button
        onClick={() => navigate(undefined)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
          !currentPlatform
            ? 'bg-[--accent] border-[--accent] text-white'
            : 'border-[--border] text-[--text-secondary] hover:text-white bg-[--bg-card]'
        }`}
      >
        {t('common.all')}
      </button>

      {providers.map(p => (
        <button
          key={p.provider_id}
          onClick={() => navigate(String(p.provider_id))}
          title={p.provider_name}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            currentPlatform === String(p.provider_id)
              ? 'border-[--accent] bg-[--accent]/10 text-white font-semibold'
              : 'border-[--border] text-[--text-secondary] hover:text-white bg-[--bg-card] hover:border-[--accent]/40'
          }`}
        >
          {p.logo_path && (
            <img
              src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
              alt={p.provider_name}
              className="w-4 h-4 rounded-sm object-cover shrink-0"
            />
          )}
          <span>{p.provider_name}</span>
        </button>
      ))}
    </div>
  )
}
