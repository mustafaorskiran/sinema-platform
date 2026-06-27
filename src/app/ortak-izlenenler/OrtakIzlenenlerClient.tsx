'use client'

import { useState, useEffect } from 'react'

interface Profile {
  id: string
  username: string
  avatar_url: string | null
}

interface CommonItem {
  media_id: number
  media_type: string
  title?: string
  poster_path?: string | null
}

interface Props {
  myProfile: Profile
  following: Profile[]
  defaultUser?: string
}

export default function OrtakIzlenenlerClient({ myProfile, following, defaultUser }: Props) {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(
    defaultUser ? (following.find(f => f.username === defaultUser) ?? null) : null
  )
  const [items, setItems] = useState<CommonItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedUser) return
    setLoading(true)
    fetch(`/api/common-watched?user_id=${selectedUser.id}`)
      .then(r => r.json())
      .then(data => { setItems(data ?? []); setLoading(false) })
  }, [selectedUser])

  return (
    <div>
      {/* Kullanıcı seç */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider mb-3">
          Takip ettiğin kullanıcılar
        </p>
        {following.length === 0 ? (
          <p className="text-[--text-secondary] text-sm">Henüz kimseyi takip etmiyorsun.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {following.map(u => (
              <button key={u.id} onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all
                  ${selectedUser?.id === u.id
                    ? 'bg-[--accent] border-[--accent] text-white'
                    : 'border-[--border] text-[--text-secondary] hover:text-white hover:border-[--accent]/50'}`}>
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                  : <span className="h-5 w-5 rounded-full bg-[--bg-secondary] text-[10px] flex items-center justify-center text-white">{u.username[0]?.toUpperCase()}</span>}
                @{u.username}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sonuçlar */}
      {selectedUser && (
        <div>
          <p className="text-sm font-semibold text-white mb-4">
            @{myProfile.username} ve @{selectedUser.username} ortak izledi
          </p>
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg bg-[--bg-card] animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center rounded-2xl rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">🎬</p>
              <p className="text-sm text-[--text-secondary]">Henüz ortak izlenen içerik yok.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[--text-secondary] mb-4">{items.length} ortak içerik</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {items.map(item => (
                  <a key={`${item.media_type}-${item.media_id}`}
                    href={`/${item.media_type}/${item.media_id}`}
                    className="group relative aspect-[2/3] rounded-lg overflow-hidden rounded-xl hover:border-[--accent]/50 transition-colors" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {item.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt={item.title ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center">{item.title}</div>
                    )}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!selectedUser && following.length > 0 && (
        <div className="py-16 text-center rounded-2xl rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-4xl mb-3">👆</p>
          <p className="text-sm text-[--text-secondary]">Ortak izlenenleri görmek için bir kullanıcı seç.</p>
        </div>
      )}
    </div>
  )
}
