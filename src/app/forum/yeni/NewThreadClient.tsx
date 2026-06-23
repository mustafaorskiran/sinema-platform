'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category { id: number; name: string; icon: string }

interface Props {
  categories: Category[]
  defaultCategoryId: number | null
}

export default function NewThreadClient({ categories, defaultCategoryId }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(defaultCategoryId ?? (categories[0]?.id ?? null))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !categoryId) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category_id: categoryId }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Hata oluştu')
        return
      }
      const { id } = await res.json()
      router.push(`/forum/${id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Kategori</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                categoryId === cat.id
                  ? 'border-[--accent] bg-[--accent]/10 text-white'
                  : 'border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-white/30 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Başlık */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Başlık</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Konunun başlığı..."
          maxLength={200}
          required
          className="w-full bg-[--bg-card] border border-[--border] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] focus:outline-none focus:border-[--accent]/60"
        />
        <p className="text-xs text-[--text-secondary] mt-1 text-right">{title.length}/200</p>
      </div>

      {/* İçerik */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">İçerik</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Ne hakkında konuşmak istiyorsun?"
          rows={8}
          required
          className="w-full bg-[--bg-card] border border-[--border] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[--text-secondary] focus:outline-none focus:border-[--accent]/60 resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 justify-end">
        <Link
          href="/forum"
          className="px-5 py-2.5 rounded-full border border-[--border] text-sm text-[--text-secondary] hover:text-white transition-colors"
        >
          İptal
        </Link>
        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim() || !categoryId}
          className="bg-[--accent] hover:bg-[--accent-hover] disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          {submitting ? 'Yayınlanıyor...' : 'Konuyu Aç'}
        </button>
      </div>
    </form>
  )
}
