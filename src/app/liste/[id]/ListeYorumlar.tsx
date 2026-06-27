'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconTrash } from '@/components/icons'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string; avatar_url: string | null } | null
}

interface Props {
  listId: string
  initialComments: Comment[]
  currentUserId: string | null
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

export default function ListeYorumlar({ listId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/list-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list_id: listId, content: text.trim() }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (data.id) { setComments(c => [...c, data]); setText('') }
  }

  async function deleteComment(id: string) {
    await fetch('/api/list-comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id: id }),
    })
    setComments(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-white mb-6" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
        Yorumlar
        {comments.length > 0 && (
          <span className="text-base font-normal ml-2" style={{ color: 'var(--text-secondary)' }}>({comments.length})</span>
        )}
      </h2>

      {comments.length === 0 && (
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
      )}

      <div className="space-y-3 mb-6">
        {comments.map(c => (
          <div
            key={c.id}
            className="flex gap-3 group p-4 rounded-xl transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Link href={`/profil/${c.profiles?.username}`} className="shrink-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                style={{ background: 'var(--accent)' }}
              >
                {c.profiles?.avatar_url
                  ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  : (c.profiles?.username?.[0] ?? '?').toUpperCase()}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Link href={`/profil/${c.profiles?.username}`}
                  className="text-xs font-semibold text-white hover:text-[--accent] transition-colors">
                  @{c.profiles?.username}
                </Link>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{timeAgo(c.created_at)}</span>
                {c.user_id === currentUserId && (
                  <button onClick={() => deleteComment(c.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-all hover:text-red-400"
                    style={{ color: 'var(--text-secondary)' }}>
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {currentUserId ? (
        <form onSubmit={submitComment} className="flex gap-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            rows={2}
            maxLength={1000}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
          />
          <button type="submit" disabled={submitting || !text.trim()}
            className="px-5 py-2.5 rounded-xl bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold transition-colors disabled:opacity-40 self-end">
            {submitting ? '...' : 'Gönder'}
          </button>
        </form>
      ) : (
        <Link href="/auth/giris"
          className="inline-block text-sm text-[--accent] hover:underline">
          Yorum yapmak için giriş yap
        </Link>
      )}
    </div>
  )
}
