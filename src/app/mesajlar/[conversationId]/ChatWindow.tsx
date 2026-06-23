'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles: { username: string; avatar_url: string | null }
}

interface Props {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}

export default function ChatWindow({ conversationId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  async function send() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId, content: trimmed }),
    })
    const data = await res.json()
    if (data?.id) setMessages(prev => [...prev, data])
    setSending(false)
    setTimeout(scrollToBottom, 100)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[--text-secondary] py-8">Henüz mesaj yok. İlk mesajı gönder!</p>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === currentUserId
          return (
            <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                m.profiles.avatar_url
                  ? <img src={m.profiles.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover shrink-0 mt-1" />
                  : <div className="h-7 w-7 rounded-full bg-[--bg-secondary] flex items-center justify-center text-xs text-white shrink-0 mt-1">{m.profiles.username[0]?.toUpperCase()}</div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${isMe ? 'bg-[--accent] text-white rounded-tr-sm' : 'bg-[--bg-card] border border-[--border] text-white rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-[--text-secondary]'}`}>
                  {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-[--border]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesaj yaz... (Enter gönder, Shift+Enter yeni satır)"
          rows={1}
          maxLength={2000}
          className="flex-1 rounded-xl bg-[--bg-card] border border-[--border] px-4 py-2.5 text-sm text-white placeholder:text-[--text-secondary] outline-none focus:border-[--accent] resize-none"
        />
        <button onClick={send} disabled={!text.trim() || sending}
          className="px-4 py-2.5 rounded-xl bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold transition-colors disabled:opacity-40 shrink-0">
          Gönder
        </button>
      </div>
    </div>
  )
}
