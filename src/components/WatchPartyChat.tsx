'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string; avatar_url: string | null } | null
}

interface Props {
  partyId: string
  currentUserId: string | null
  isMember: boolean
}

export default function WatchPartyChat({ partyId, currentUserId, isMember }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // İlk mesajları yükle
    supabase
      .from('watch_party_messages')
      .select('*, profiles(username, avatar_url)')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data as Message[])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50)
      })

    // Real-time subscription
    const channel = supabase
      .channel(`party-chat-${partyId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'watch_party_messages',
        filter: `party_id=eq.${partyId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('watch_party_messages')
          .select('*, profiles(username, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) {
          setMessages(prev => [...prev, data as Message])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [partyId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending || !currentUserId) return
    setSending(true)
    await supabase.from('watch_party_messages').insert({ party_id: partyId, user_id: currentUserId, content: input.trim() })
    setInput('')
    setSending(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)', height: 420 }}>
      {/* Başlık */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <p className="text-sm font-semibold text-white">Canlı Sohbet</p>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[--text-secondary] mt-8">Henüz mesaj yok. İlk sen yaz!</p>
        )}
        {messages.map(m => {
          const isMe = m.user_id === currentUserId
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="h-6 w-6 rounded-full overflow-hidden bg-[--accent] shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                {m.profiles?.avatar_url
                  ? <Image src={m.profiles.avatar_url} alt="" width={24} height={24} className="object-cover" />
                  : (m.profiles?.username?.[0] ?? '?').toUpperCase()
                }
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMe && <span className="text-[10px] text-[--text-secondary] px-1">@{m.profiles?.username}</span>}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-[--accent] text-white rounded-br-sm' : 'text-white rounded-bl-sm'}`}
                  style={isMe ? {} : { background: 'rgba(255,255,255,0.08)' }}>
                  {m.content}
                </div>
                <span className="text-[9px] text-[--text-secondary] px-1">
                  {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isMember && currentUserId ? (
        <form onSubmit={send} className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            maxLength={500}
            placeholder="Mesaj yaz..."
            className="flex-1 bg-white/5 text-white text-sm px-3 py-2 rounded-xl outline-none placeholder-[--text-secondary]"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            Gönder
          </button>
        </form>
      ) : (
        <div className="px-4 py-3 text-center text-xs text-[--text-secondary]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {currentUserId ? 'Sohbete katılmak için etkinliğe katıl.' : 'Sohbet için giriş yap.'}
        </div>
      )}
    </div>
  )
}
