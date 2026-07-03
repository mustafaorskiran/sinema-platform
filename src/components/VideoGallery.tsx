'use client'

import { useState } from 'react'
import type { TMDbVideo } from '@/lib/types'
import { useLocale } from '@/context/LocaleContext'
import { IconClapperboard, IconPlay } from '@/components/icons'

interface Props {
  videos: TMDbVideo[]
  title: string
}

const TYPE_LABEL_KEYS: Record<string, string> = {
  Trailer: 'trailer', Teaser: 'teaser', Clip: 'clip',
  Featurette: 'featurette', 'Behind the Scenes': 'behindTheScenes', Bloopers: 'bloopers',
}

export default function VideoGallery({ videos, title }: Props) {
  const { t } = useLocale()
  const ytVideos = videos.filter(v => v.site === 'YouTube')
  const [activeKey, setActiveKey] = useState<string>(
    ytVideos.find(v => v.type === 'Trailer' && v.official)?.key ||
    ytVideos.find(v => v.type === 'Trailer')?.key ||
    ytVideos[0]?.key || ''
  )

  if (ytVideos.length === 0) return null

  const active = ytVideos.find(v => v.key === activeKey) ?? ytVideos[0]
  const rest = ytVideos.filter(v => v.key !== activeKey).slice(0, 8)

  function typeLabel(type?: string | null) {
    const key = TYPE_LABEL_KEYS[type ?? '']
    return key ? t(`videoGallery.${key}`) : type
  }

  return (
    <div className="mt-12" id="videolar">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #f87171 0%, #E11D48 100%)' }} />
        <h2 className="flex items-center gap-2 text-xl font-bold text-white tracking-tight"><IconClapperboard size={20} />{t('videoGallery.title')}</h2>
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>({ytVideos.length})</span>
      </div>
      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Ana video */}
        <div className="flex-1 min-w-0">
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${active.key}?autoplay=0&rel=0`}
              className="w-full h-full"
              allowFullScreen
              title={active.name ?? title}
            />
          </div>
          <div className="mt-2">
            <p className="text-white font-medium text-sm">{active.name}</p>
            <p className="text-xs text-[--text-secondary]">{typeLabel(active.type)}</p>
          </div>
        </div>

        {/* Thumbnail listesi */}
        {rest.length > 0 && (
          <div className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-96 pb-2 lg:pb-0 shrink-0">
            {rest.map(v => (
              <button
                key={v.key}
                onClick={() => setActiveKey(v.key)}
                className="group relative shrink-0 w-40 lg:w-full rounded-lg overflow-hidden transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="aspect-video relative">
                  <img
                    src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
                    alt={v.name ?? ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                      <IconPlay size={14} className="text-black ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-1.5 text-left">
                  <p className="text-xs text-white font-medium line-clamp-1">{v.name}</p>
                  <p className="text-[10px] text-[--text-secondary]">{typeLabel(v.type)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
