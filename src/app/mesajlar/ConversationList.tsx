'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Profile { id: string; username: string; avatar_url: string | null }
interface Message { content: string; created_at: string; sender_id: string }
interface Conversation { id: string; updated_at: string; p1: Profile; p2: Profile; messages: Message[] }
interface Props {
  conversations: Conversation[]
  currentUserId: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Az önce'
  if (mins < 60) return `${mins}dk`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}s`
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
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
        className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[--text-secondary] outline-none focus:border-[--accent] mb-4"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
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
            const lastMsg = c.messages?.[0] ?? null
            const isOwn = lastMsg?.sender_id === currentUserId
            return (
              <Link key={c.id} href={`/mesajlar/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                {other.avatar_url
                  ? <img src={other.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" style={{ border: '2px solid rgba(225,29,72,0.25)' }} />
                  : <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0 text-sm" style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>{other.username[0]?.toUpperCase()}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">@{other.username}</p>
                  {lastMsg && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {isOwn && <span style={{ color: 'rgba(255,255,255,0.25)' }}>Sen: </span>}
                      {lastMsg.content}
                    </p>
                  )}
                </div>
                <span className="text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {lastMsg ? timeAgo(lastMsg.created_at) : timeAgo(c.updated_at)}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
