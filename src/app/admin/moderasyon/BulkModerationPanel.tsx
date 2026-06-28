'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconStar, IconEye, IconEyeOff, IconTrash } from '@/components/icons'

interface Review {
  id: string
  content: string
  rating: number
  flagged_spam: boolean
  moderation_note: string | null
  created_at: string
  media_id: number
  media_type: string
  profiles: { username: string } | null
}

interface Props {
  flagged: Review[]
  hidden: Review[]
}

export default function BulkModerationPanel({ flagged, hidden }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'flagged' | 'hidden'>('flagged')

  const list = activeTab === 'flagged' ? flagged : hidden

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === list.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(list.map(r => r.id)))
    }
  }

  async function singleAction(id: string, action: 'hide' | 'unhide' | 'delete') {
    setLoading(true)
    if (action === 'delete') {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    } else {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    }
    setLoading(false)
    setSelected(new Set())
    router.refresh()
  }

  async function bulkAction(action: 'hide' | 'unhide' | 'delete') {
    if (selected.size === 0) return
    if (action === 'delete' && !confirm(`${selected.size} yorumu kalıcı olarak silmek istediğinden emin misin?`)) return
    setLoading(true)
    await Promise.all([...selected].map(id =>
      action === 'delete'
        ? fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
        : fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    ))
    setLoading(false)
    setSelected(new Set())
    router.refresh()
  }

  return (
    <div>
      {/* Sekmeler */}
      <div className="flex gap-1 border-b border-[--border] mb-6">
        {([['flagged', 'İnceleme Bekleyen', flagged.length], ['hidden', 'Gizlenenler', hidden.length]] as const).map(([key, label, count]) => (
          <button key={key} onClick={() => { setActiveTab(key); setSelected(new Set()) }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === key ? 'border-[--accent] text-white' : 'border-transparent text-[--text-secondary] hover:text-white'}`}>
            {label}
            {count > 0 && <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${key === 'flagged' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-500/20 text-zinc-400'}`}>{count}</span>}
          </button>
        ))}
      </div>

      {/* Toplu işlem araç çubuğu */}
      {list.length > 0 && (
        <div className="flex items-center gap-3 mb-4 px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={selected.size === list.length && list.length > 0}
              onChange={toggleAll}
              className="w-4 h-4 rounded accent-[--accent]" />
            <span className="text-xs text-[--text-secondary]">
              {selected.size > 0 ? `${selected.size} seçili` : 'Tümünü seç'}
            </span>
          </label>

          {selected.size > 0 && (
            <div className="flex gap-2 ml-auto">
              {activeTab === 'flagged' && (
                <button onClick={() => bulkAction('hide')} disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50">
                  <IconEyeOff className="h-3.5 w-3.5" /> Seçilenleri Gizle
                </button>
              )}
              {activeTab === 'hidden' && (
                <button onClick={() => bulkAction('unhide')} disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50">
                  <IconEye className="h-3.5 w-3.5" /> Seçilenleri Göster
                </button>
              )}
              <button onClick={() => bulkAction('delete')} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                <IconTrash className="h-3.5 w-3.5" /> Seçilenleri Sil ({selected.size})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Liste */}
      {list.length === 0 ? (
        <p className="text-[--text-secondary] rounded-xl p-6 text-center text-sm"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          {activeTab === 'flagged' ? 'İnceleme bekleyen yorum yok.' : 'Gizlenmiş yorum yok.'}
        </p>
      ) : (
        <div className="space-y-3">
          {list.map(review => (
            <div key={review.id}
              onClick={() => toggle(review.id)}
              className={`rounded-xl border p-4 flex gap-3 items-start cursor-pointer transition-all ${
                selected.has(review.id)
                  ? 'border-[--accent]/40 bg-[--accent]/5'
                  : activeTab === 'hidden'
                    ? 'bg-zinc-900/50 border-[--border] opacity-70'
                    : 'bg-[--bg-card] border-yellow-500/30'
              }`}>
              <input type="checkbox" checked={selected.has(review.id)} onChange={() => toggle(review.id)}
                onClick={e => e.stopPropagation()}
                className="mt-1 w-4 h-4 shrink-0 rounded accent-[--accent]" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <a href={`/profil/${review.profiles?.username}`} onClick={e => e.stopPropagation()}
                    className="text-sm font-semibold text-white hover:text-[--accent] transition-colors">
                    @{review.profiles?.username}
                  </a>
                  <a href={`/${review.media_type}/${review.media_id}`} onClick={e => e.stopPropagation()}
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${review.media_type === 'film' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {review.media_type} #{review.media_id}
                  </a>
                  {review.flagged_spam && (
                    <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">link içeriyor</span>
                  )}
                  <div className="flex items-center gap-0.5 text-[--gold]">
                    <IconStar className="h-3 w-3" />
                    <span className="text-xs font-semibold text-white">{review.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-[--text-secondary] line-clamp-2 mb-2">{review.content}</p>
                <p className="text-[10px] text-[--text-secondary]">
                  {new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Tekil aksiyon butonları */}
              <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                {activeTab === 'hidden' ? (
                  <button onClick={() => singleAction(review.id, 'unhide')} disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50">
                    <IconEye className="h-3.5 w-3.5" /> Göster
                  </button>
                ) : (
                  <button onClick={() => singleAction(review.id, 'hide')} disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50">
                    <IconEyeOff className="h-3.5 w-3.5" /> Gizle
                  </button>
                )}
                <button onClick={() => singleAction(review.id, 'delete')} disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                  <IconTrash className="h-3.5 w-3.5" /> Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
