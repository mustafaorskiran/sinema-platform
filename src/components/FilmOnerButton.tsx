'use client'
import { useState } from 'react'
import { useLocale } from '@/context/LocaleContext'

interface Props {
  filmId: number
  filmType: 'film' | 'dizi'
  filmTitle: string
  filmPoster: string
}

export default function FilmOnerButton({ filmId, filmType, filmTitle, filmPoster }: Props) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function send() {
    if (!username.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/film-oner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), filmId, filmType, filmTitle, filmPoster })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('social.error'))
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false); setUsername('') }, 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('social.error'))
    } finally {
      setLoading(false)
    }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:scale-105"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
      📤 {t('social.recommendToFriend')}
    </button>
  )

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(20,28,47,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-sm font-semibold text-white">{t('social.recommendToFriend')}</p>
      {sent ? (
        <p className="text-green-400 text-sm">✓ {t('social.sent')}</p>
      ) : (
        <>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={t('social.enterUsername')}
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-[--text-secondary] outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button onClick={send} disabled={loading}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#E11D48,#be123c)' }}>
              {loading ? '...' : t('social.send')}
            </button>
            <button onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {t('social.cancel')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
