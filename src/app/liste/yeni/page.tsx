'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconGlobe, IconList, IconLoader, IconLock } from '@/components/icons'

export default function YeniListePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Başlık gerekli.'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, public: isPublic }),
    })

    if (res.ok) {
      const list = await res.json()
      router.push(`/liste/${list.id}`)
    } else {
      setError('Liste oluşturulamadı.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <IconList className="h-6 w-6 text-[--accent]" />
          <h1 className="text-2xl font-bold text-white">Yeni Liste Oluştur</h1>
        </div>

        <div className="rounded-xl rounded-2xl p-8" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">Liste Başlığı *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required maxLength={100}
                placeholder="En iyi 2024 filmleri"
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
              />
              <p className="mt-1 text-xs text-[--text-secondary] text-right">{title.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">Açıklama</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500} rows={3}
                placeholder="Bu liste hakkında kısa bir açıklama..."
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-[--text-secondary] text-right">{description.length}/500</p>
            </div>

            {/* Gizlilik */}
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">Gizlilik</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsPublic(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${isPublic ? 'border-[--accent] bg-[--accent]/10 text-white' : 'border-[--border] text-[--text-secondary] hover:border-white/30'}`}>
                  <IconGlobe className="h-4 w-4" /> Herkese Açık
                </button>
                <button type="button" onClick={() => setIsPublic(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${!isPublic ? 'border-[--accent] bg-[--accent]/10 text-white' : 'border-[--border] text-[--text-secondary] hover:border-white/30'}`}>
                  <IconLock className="h-4 w-4" /> Gizli
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

            <div className="flex gap-3">
              <Link href="/listeler" className="flex-1 py-3 rounded-lg border border-[--border] text-[--text-secondary] hover:text-white text-sm font-medium text-center transition-colors">
                Vazgeç
              </Link>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <IconLoader className="h-4 w-4 animate-spin" />}
                {loading ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
