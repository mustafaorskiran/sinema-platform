'use client'

import { useState } from 'react'
import { useLocale } from '@/context/LocaleContext'

interface Props {
  username: string
  isOwn: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'

export default function EmbedPage({ username, isOwn }: Props) {
  const { t } = useLocale()
  const [limit, setLimit] = useState(5)
  const [copied, setCopied] = useState(false)

  const embedSrc = `${BASE_URL}/api/embed/${username}?limit=${limit}`
  const iframeCode = `<iframe src="${embedSrc}" width="300" height="260" frameborder="0" scrolling="no" style="border-radius:16px;overflow:hidden;"></iframe>`

  function copy() {
    navigator.clipboard.writeText(iframeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">
          {isOwn ? t('profile.widgetTitleOwn') : t('profile.widgetTitleOther', { username })}
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {isOwn
            ? t('profile.widgetSubtitleOwn')
            : t('profile.widgetSubtitleOther', { username })}
        </p>
      </div>

      {/* Önizleme */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {t('profile.widgetPreview')}
        </p>
        <div className="rounded-2xl overflow-hidden p-6 flex justify-center"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.6), rgba(14,20,32,0.8))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <iframe
            src={embedSrc}
            width="300"
            height="260"
            frameBorder="0"
            scrolling="no"
            className="rounded-2xl"
            key={limit}
          />
        </div>
      </div>

      {/* Ayarlar */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('profile.widgetSettings')}</p>
        <div className="flex items-center gap-4">
          <label className="text-sm text-white">{t('profile.widgetRecentLabel')}</label>
          <div className="flex gap-2">
            {[3, 4, 5, 6].map(n => (
              <button key={n} onClick={() => setLimit(n)}
                className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                style={n === limit
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                }>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kod */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('profile.widgetHtmlCode')}</p>
          <button onClick={copy}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:scale-105"
            style={copied
              ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
            }>
            {copied ? `✓ ${t('profile.copied')}` : t('profile.widgetCopy')}
          </button>
        </div>
        <pre className="px-4 py-4 text-xs overflow-x-auto" style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
          {iframeCode}
        </pre>
      </div>

      <p className="text-[11px] text-center mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
        {t('profile.widgetFooterNote')}
      </p>
    </div>
  )
}
