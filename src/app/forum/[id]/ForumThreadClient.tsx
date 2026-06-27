'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile { username: string; avatar_url: string | null }

interface Thread {
  id: string
  title: string
  content: string
  pinned: boolean
  locked: boolean
  reply_count: number
  created_at: string
  user_id: string
  profiles: Profile | null
}

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: Profile | null
}

interface CurrentUser {
  id: string
  username?: string | null
  avatar_url?: string | null
}

interface Props {
  thread: Thread
  initialPosts: Post[]
  currentUser: CurrentUser | null
  isAdmin: boolean
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'az önce'
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Avatar({ profile, size = 9 }: { profile: Profile | null; size?: number }) {
  const initial = (profile?.username?.[0] ?? '?').toUpperCase()
  const s = `h-${size} w-${size}`
  return (
    <div className={`${s} rounded-full bg-[--accent] flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0`}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
        : initial
      }
    </div>
  )
}

export default function ForumThreadClient({ thread, initialPosts, currentUser, isAdmin }: Props) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canDelete = (authorId: string) =>
    currentUser && (currentUser.id === authorId || isAdmin)

  async function submitReply() {
    if (!replyText.trim() || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: thread.id, content: replyText.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Hata oluştu')
        return
      }
      const newPost = await res.json()
      newPost.profiles = { username: currentUser?.username, avatar_url: currentUser?.avatar_url }
      setPosts(prev => [...prev, newPost])
      setReplyText('')
    } finally {
      setSubmitting(false)
    }
  }

  async function deletePost(postId: string) {
    if (!confirm('Bu yanıtı silmek istediğine emin misin?')) return
    await fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  async function deleteThread() {
    if (!confirm('Bu konuyu silmek istediğine emin misin? Tüm yanıtlar da silinecek.')) return
    await fetch(`/api/forum/threads/${thread.id}`, { method: 'DELETE' })
    router.push('/forum')
  }

  return (
    <div>
      {/* Konu başlığı */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))', border: '1px solid rgba(212,168,67,0.1)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-white leading-snug">
            {thread.pinned && <span className="mr-2">📌</span>}
            {thread.locked && <span className="mr-2">🔒</span>}
            {thread.title}
          </h1>
          {canDelete(thread.user_id) && (
            <button
              onClick={deleteThread}
              className="text-xs text-red-400 hover:text-red-300 shrink-0 transition-colors"
            >
              Sil
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <Link href={`/profil/${thread.profiles?.username}`}>
            <Avatar profile={thread.profiles} />
          </Link>
          <div>
            <Link href={`/profil/${thread.profiles?.username}`} className="text-sm font-semibold text-white hover:text-[--accent] transition-colors">
              {thread.profiles?.username}
            </Link>
            <p className="text-xs text-[--text-secondary]">{timeAgo(thread.created_at)}</p>
          </div>
        </div>

        <p className="text-[--text-secondary] leading-relaxed whitespace-pre-wrap">{thread.content}</p>
      </div>

      {/* Yanıtlar */}
      {posts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[--text-secondary] mb-3">
            {posts.length} Yanıt
          </p>
          <div className="space-y-3">
            {posts.map((post, i) => (
              <div key={post.id} className="rounded-xl p-4 transition-all duration-200"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Link href={`/profil/${post.profiles?.username}`}>
                      <Avatar profile={post.profiles} size={8} />
                    </Link>
                    <div>
                      <Link href={`/profil/${post.profiles?.username}`} className="text-sm font-semibold text-white hover:text-[--accent] transition-colors">
                        {post.profiles?.username}
                      </Link>
                      <p className="text-xs text-[--text-secondary]">{timeAgo(post.created_at)}</p>
                    </div>
                    <span className="text-xs text-[--text-secondary] ml-1">#{i + 1}</span>
                  </div>
                  {canDelete(post.user_id) && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Sil
                    </button>
                  )}
                </div>
                <p className="text-sm text-[--text-secondary] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yanıt formu */}
      {currentUser && !thread.locked ? (
        <div className="rounded-xl p-4" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-semibold text-white mb-3">Yanıtla</p>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Yanıtını yaz..."
            rows={4}
            className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] focus:outline-none focus:border-[--accent]/60 resize-none"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              onClick={submitReply}
              disabled={submitting || !replyText.trim()}
              className="bg-[--accent] hover:bg-[--accent-hover] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              {submitting ? 'Gönderiliyor...' : 'Yanıtla'}
            </button>
          </div>
        </div>
      ) : currentUser && thread.locked ? (
        <div className="rounded-xl p-4 text-center text-sm text-[--text-secondary]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          🔒 Bu konu kilitlenmiş, yeni yanıt eklenemez.
        </div>
      ) : (
        <div className="rounded-xl p-4 text-center text-sm text-[--text-secondary]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          Yanıt yazmak için{' '}
          <Link href="/auth/giris" className="text-[--accent] hover:underline">giriş yap</Link>.
        </div>
      )}
    </div>
  )
}
