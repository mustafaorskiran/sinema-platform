'use client'
import { useState } from 'react'
import { useLocale } from '@/context/LocaleContext'

interface Props {
  mediaId: number
  mediaType: string
  title: string
  releaseDate?: string | null
  initialSet: boolean
}

export default function ReleaseReminderButton({ mediaId, mediaType, title, releaseDate, initialSet }: Props) {
  const { t } = useLocale()
  const [active, setActive] = useState(initialSet)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const method = active ? 'DELETE' : 'POST'
    await fetch('/api/release-reminder', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, mediaType, title, releaseDate }),
    })
    setActive(!active)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? t('film.removeReminder') : t('film.notifyOnRelease')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
      style={{
        background: active ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? 'rgba(212,168,67,0.35)' : 'rgba(255,255,255,0.12)'}`,
        color: active ? '#D4A843' : 'rgba(255,255,255,0.55)',
      }}>
      {loading ? '...' : active ? `🔔 ${t('film.reminderActive')}` : `🔔 ${t('film.notifyOnReleaseCta')}`}
    </button>
  )
}
