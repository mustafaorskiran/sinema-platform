'use client'

import { useState, useEffect } from 'react'

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
        <h2 className="text-xl font-bold text-white">🎵 Soundtrack</h2>
        {isLoggedIn && !adding && (
          <button onClick={() => setAdding(true)} className="text-sm text-[--accent] hover:underline">+ Şarkı Ekle</button>
        )}
      </div>

      {tracks.length > 0 && (
        <div className="space-y-2 mb-4">
          {tracks.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-[--bg-card] border border-[--border] hover:border-[--accent]/30 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-[--bg-secondary] flex items-center justify-center text-xl shrink-0">🎵</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{t.title}</p>
                {t.artist && <p className="text-xs text-[--text-secondary] truncate">{t.artist}</p>}
              </div>
              {t.spotify_url && (
                <a href={t.spotify_url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors">
                  ▶ Spotify
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {tracks.length === 0 && !adding && (
        <div className="rounded-xl bg-[--bg-card] border border-[--border] p-6 text-center">
          <p className="text-[--text-secondary] text-sm mb-3">Henüz soundtrack eklenmemiş.</p>
          {isLoggedIn && (
            <button onClick={() => setAdding(true)}
              className="text-sm bg-[--accent] hover:bg-[--accent-hover] text-white px-4 py-2 rounded-lg transition-colors">
              Şarkı Ekle
            </button>
          )}
        </div>
      )}

      {adding && (
        <form onSubmit={submit} className="rounded-xl bg-[--bg-card] border border-[--border] p-5 space-y-3">
          {sent ? (
            <p className="text-green-400 text-sm text-center py-4">✓ Şarkı incelemeye alındı.</p>
          ) : (
            <>
              <div>
                <label className="text-xs text-[--text-secondary] mb-1 block">Şarkı Adı <span className="text-red-400">*</span></label>
                <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Şarkı adı"
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[--text-secondary] mb-1 block">Sanatçı</label>
                <input value={artist} onChange={e => setArtist(e.target.value)} maxLength={200} placeholder="Sanatçı adı"
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[--text-secondary] mb-1 block">Spotify Linki</label>
                <input value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)} maxLength={500} placeholder="https://open.spotify.com/..."
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-[--text-secondary] hover:text-white transition-colors">İptal</button>
                <button type="submit" disabled={sending || !title.trim()}
                  className="px-4 py-2 text-sm bg-[--accent] hover:bg-[--accent-hover] text-white rounded-lg transition-colors disabled:opacity-50">
                  {sending ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}
