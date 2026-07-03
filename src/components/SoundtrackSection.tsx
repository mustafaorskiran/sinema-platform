'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/context/LocaleContext'

interface Track {
  id: string
  title: string
  artist: string | null
  spotify_url: string | null
  profiles: { username: string } | null
}

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  isLoggedIn: boolean
}

export default function SoundtrackSection({ mediaId, mediaType, isLoggedIn }: Props) {
  const { t } = useLocale()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch(`/api/soundtracks?media_id=${mediaId}&media_type=${mediaType}`)
      .then(r => r.json())
      .then(d => { setTracks(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mediaId, mediaType])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSending(true)
    await fetch('/api/soundtracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, title, artist, spotify_url: spotifyUrl }),
    })
    setSending(false)
    setSent(true)
    setTitle(''); setArtist(''); setSpotifyUrl('')
    setTimeout(() => { setSent(false); setAdding(false) }, 3000)
  }

  if (loading) return null
  if (tracks.length === 0 && !isLoggedIn) return null

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 100%)' }} />
          <h2 className="text-xl font-bold text-white tracking-tight">🎵 {t('soundtrack.title')}</h2>
          {tracks.length > 0 && (
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>({tracks.length})</span>
          )}
        </div>
        {isLoggedIn && !adding && (
          <button onClick={() => setAdding(true)}
            className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
            + {t('soundtrack.addTrack')}
          </button>
        )}
      </div>

      {tracks.length > 0 && (
        <div className="space-y-2 mb-4">
          {tracks.map(t => (
            <div key={t.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.85), rgba(14,20,32,0.9))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.15)' }}>🎵</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{t.title}</p>
                {t.artist && <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.artist}</p>}
              </div>
              {t.spotify_url && (
                <a href={t.spotify_url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(29,185,84,0.15)', color: '#1db954', border: '1px solid rgba(29,185,84,0.3)' }}>
                  ▶ Spotify
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {tracks.length === 0 && !adding && (
        <div className="rounded-xl p-6 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('soundtrack.empty')}</p>
          {isLoggedIn && (
            <button onClick={() => setAdding(true)}
              className="text-sm px-5 py-2 rounded-lg transition-all hover:scale-105"
              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', fontWeight: 600 }}>
              {t('soundtrack.addTrack')}
            </button>
          )}
        </div>
      )}

      {adding && (
        <form onSubmit={submit} className="rounded-xl p-5 space-y-3"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))', border: '1px solid rgba(74,222,128,0.15)' }}>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-green-400 text-sm">{t('soundtrack.submitted')}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t('soundtrack.trackNameLabel')} <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder={t('soundtrack.trackNamePlaceholder')}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(74,222,128,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('soundtrack.artistLabel')}</label>
                <input value={artist} onChange={e => setArtist(e.target.value)} maxLength={200} placeholder={t('soundtrack.artistPlaceholder')}
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(74,222,128,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('soundtrack.spotifyLinkLabel')}</label>
                <input value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)} maxLength={500} placeholder="https://open.spotify.com/..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(74,222,128,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setAdding(false)}
                  className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('common.cancel')}</button>
                <button type="submit" disabled={sending || !title.trim()}
                  className="px-5 py-2 text-sm rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-40"
                  style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                  {sending ? `⟳ ${t('soundtrack.sending')}` : `🎵 ${t('soundtrack.add')}`}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}
