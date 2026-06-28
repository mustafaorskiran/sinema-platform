'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

export default function ConversationSidebar({ conversations, currentUserId }: Props) {
  const pathname = usePathname()
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
        className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder:text-[--text-secondary] outline-none focus:border-[--accent] mb-3"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-2xl mb-2">💬</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Henüz mesajın yok.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(c => {
            const other = c.p1.id === currentUserId ? c.p2 : c.p1
            const lastMsg = c.messages?.[0] ?? null
            const isOwn = lastMsg?.sender_id === currentUserId
            const isActive = pathname === `/mesajlar/${c.id}`
            return (
              <Link key={c.id} href={`/mesajlar/${c.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                style={isActive
                  ? { background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }
                }>
                {other.avatar_url
                  ? <img src={other.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                  : <div className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold shrink-0 text-sm" style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>{other.username[0]?.toUpperCase()}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">@{other.username}</p>
                  {lastMsg && (
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {isOwn && <span style={{ color: 'rgba(255,255,255,0.2)' }}>Sen: </span>}
                      {lastMsg.content}
                    </p>
                  )}
                </div>
                <span className="text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
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
