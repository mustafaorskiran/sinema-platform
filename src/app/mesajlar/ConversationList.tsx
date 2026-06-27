'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Profile { id: string; username: string; avatar_url: string | null }
interface Conversation { id: string; updated_at: string; p1: Profile; p2: Profile }
interface Props {
  conversations: Conversation[]
  currentUserId: string
}

export default function ConversationList({ conversations, currentUserId }: Props) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter(c => {
    const other = c.p1.id === currentUserId ? c.p2 : c.p1
    return other.username.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Konuşma ara..."
        className="w-full rounded-xl rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[--text-secondary] outline-none focus:border-[--accent] mb-4" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm text-[--text-secondary]">Henüz mesajın yok. Birisinin profiline git ve mesaj gönder.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(c => {
            const other = c.p1.id === currentUserId ? c.p2 : c.p1
            const timeAgo = new Date(c.updated_at).toLocaleDateString('tr-TR')
            return (
              <Link key={c.id} href={`/mesajlar/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                {other.avatar_url
                  ? <img src={other.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover shrink-0 ring-2 ring-[--accent]/20" />
                  : <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0" style={{ background: 'var(--accent)' }}>{other.username[0]?.toUpperCase()}</div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">@{other.username}</p>
                </div>
                <span className="text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{timeAgo}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
