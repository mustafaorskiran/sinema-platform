'use client'

import Image from 'next/image'
import { useState } from 'react'
import { IconMessageSquare, IconSend, IconTrash, IconChevronDown, IconChevronUp } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

interface Reply {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string; avatar_url: string | null } | null
}

interface Props {
  reviewId: string
  initialCount: number
  currentUserId?: string
  isLoggedIn: boolean
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

export default function ReviewReplySection({ reviewId, initialCount, currentUserId, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loaded, setLoaded] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function loadReplies() {
    if (loaded) { setOpen(o => !o); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('review_replies')
      .select('*, profiles(username, avatar_url)')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true })
    setReplies((data ?? []) as Reply[])
    setLoaded(true)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)

    const res = await fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, content }),
    })

    if (res.ok) {
      const newReply = await res.json()
      setReplies(prev => [...prev, newReply])
      setCount(c => c + 1)
      setContent('')
      setShowForm(false)
      setOpen(true)
      setLoaded(true)
    }
    setSending(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/replies/${id}`, { method: 'DELETE' })
    setReplies(prev => prev.filter(r => r.id !== id))
    setCount(c => c - 1)
  }

  return (
    <div className="mt-3 pt-3 border-t border-[--border]/60">
      <div className="flex items-center gap-3">
        {/* Yanıtları göster/gizle */}
        <button
          onClick={loadReplies}
          className="flex items-center gap-1.5 text-xs text-[--text-secondary] hover:text-white transition-colors"
        >
          <IconMessageSquare className="h-3.5 w-3.5" />
          {count > 0 ? `${count} yanıt` : 'Yanıtlar'}
          {count > 0 && (open ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />)}
        </button>

        {isLoggedIn && (
          <button
            onClick={() => { setShowForm(f => !f); if (!loaded) loadReplies() }}
            className="text-xs text-[--accent] hover:underline transition-colors"
          >
            Yanıtla
          </button>
        )}
      </div>

      {/* Yanıt formu */}
      {showForm && isLoggedIn && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Yanıtınızı yazın..."
            maxLength={1000}
            rows={2}
            required
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{content.length} / 1000</span>
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-colors"
              style={{ background: 'var(--accent)' }}
            >
              <IconSend className="h-3.5 w-3.5" />
              Gönder
            </button>
          </div>
        </form>
      )}

      {/* Yanıt listesi */}
      {open && loaded && (
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-[--border]">
          {replies.length === 0 ? (
            <p className="text-xs text-[--text-secondary]">Henüz yanıt yok.</p>
          ) : (
            replies.map(reply => (
              <div key={reply.id} className="flex gap-2.5 group">
                <a href={`/profil/${reply.profiles?.username}`} className="shrink-0">
                  <div className="h-6 w-6 rounded-full bg-[--accent] flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                    {reply.profiles?.avatar_url
                      ? <Image src={reply.profiles.avatar_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                      : (reply.profiles?.username?.[0] ?? '?').toUpperCase()
                    }
                  </div>
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <a
                      href={`/profil/${reply.profiles?.username}`}
                      className="text-xs font-semibold text-white hover:text-[--accent] transition-colors"
                    >
                      {reply.profiles?.username}
                    </a>
                    <span className="text-[10px] text-[--text-secondary]">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="text-sm text-[--text-secondary] leading-relaxed mt-0.5">{reply.content}</p>
                </div>
                {currentUserId === reply.user_id && (
                  <button
                    onClick={() => handleDelete(reply.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[--text-secondary] hover:text-red-400 shrink-0"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
