'use client'

import { useState } from 'react'
import { IconBell } from '@/components/icons'

export default function PushForm() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/')
  const [userId, setUserId] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent?: number; error?: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url, userId: userId || undefined }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'İstek başarısız' })
    } finally {
      setSending(false)
    }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Başlık *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required
          className="w-full rounded-lg px-3 py-2.5 text-sm placeholder-white/20 outline-none"
          style={inputStyle} placeholder="Bildirim başlığı" />
      </div>
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Mesaj *</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} required rows={3}
          className="w-full rounded-lg px-3 py-2.5 text-sm placeholder-white/20 outline-none resize-none"
          style={inputStyle} placeholder="Bildirim mesajı..." />
      </div>
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Yönlendir URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)}
          className="w-full rounded-lg px-3 py-2.5 text-sm placeholder-white/20 outline-none"
          style={inputStyle} placeholder="/" />
      </div>
      <div>
        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Kullanıcı ID (boş = herkese)</label>
        <input value={userId} onChange={e => setUserId(e.target.value)}
          className="w-full rounded-lg px-3 py-2.5 text-sm placeholder-white/20 outline-none"
          style={inputStyle} placeholder="UUID..." />
      </div>

      <button type="submit" disabled={sending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 20px rgba(225,29,72,0.3)' }}>
        <IconBell className="h-4 w-4" />
        {sending ? 'Gönderiliyor...' : 'Push Gönder'}
      </button>

      {result && (
        <div className="rounded-lg px-4 py-3 text-sm"
          style={result.error
            ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
            : { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
          }>
          {result.error ? `Hata: ${result.error}` : `✓ ${result.sent} aboneye gönderildi`}
        </div>
      )}
    </form>
  )
}
