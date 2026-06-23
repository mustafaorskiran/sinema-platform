'use client'

import { useEffect, useState } from 'react'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  title: string
  year: string
  genres: string
  director?: string
}

export default function AISummary({ mediaId, mediaType, title, year, genres, director }: Props) {
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
      <div
        className="mt-4 rounded-r-2xl p-4"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(var(--border-rgb, 255,255,255), 0.1)',
          borderLeft: '4px solid var(--accent)',
        }}
      >
        <div className="space-y-2 animate-pulse">
          <div className="h-3 rounded" style={{ background: 'var(--bg-secondary)', width: '30%' }} />
          <div className="h-3 rounded" style={{ background: 'var(--bg-secondary)', width: '100%' }} />
          <div className="h-3 rounded" style={{ background: 'var(--bg-secondary)', width: '85%' }} />
        </div>
      </div>
    )
  }

  if (error || !summary) return null

  return (
    <div
      className="mt-4 rounded-r-2xl p-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
        borderLeft: '4px solid var(--accent)',
      }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
        ✦ Sinezon AI
      </p>
      <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
        {summary}
      </p>
      <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
        Bu değerlendirme yapay zeka tarafından oluşturulmuştur.
      </p>
    </div>
  )
}
