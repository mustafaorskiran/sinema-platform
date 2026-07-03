'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { IconRobot } from '@/components/icons'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  title: string
  year: string
  genres: string
  director?: string
}

export default function AISummary({ mediaId, mediaType, title, year, genres, director }: Props) {
  const { t } = useLocale()
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({
      id: String(mediaId),
      type: mediaType,
      title,
      year,
      genres,
      ...(director ? { director } : {}),
    })

    fetch(`/api/ai/film-ozeti?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('fail')
        return res.json()
      })
      .then(data => {
        if (data.summary) {
          setSummary(data.summary)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [mediaId, mediaType, title, year, genres, director])

  if (loading) {
    return (
      <div className="mt-4 rounded-xl p-4"
        style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)', borderLeft: '3px solid rgba(124,58,237,0.5)' }}>
        <div className="space-y-2 animate-pulse">
          <div className="h-2.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', width: '30%' }} />
          <div className="h-2.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', width: '100%' }} />
          <div className="h-2.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', width: '85%' }} />
        </div>
      </div>
    )
  }

  if (error || !summary) return null

  return (
    <div className="mt-4 rounded-xl p-4"
      style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)', borderLeft: '3px solid rgba(124,58,237,0.5)' }}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1.5" style={{ color: '#a78bfa' }}>
        <IconRobot size={14} /> {t('aiSummary.title')}
      </p>
      <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {summary}
      </p>
      <p className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {t('aiSummary.disclaimer')}
      </p>
    </div>
  )
}
