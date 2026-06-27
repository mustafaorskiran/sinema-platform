'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EditorialList {
  id: string
  title: string
  subtitle: string | null
  emoji: string | null
  category: string | null
  slug: string | null
  list_type: string
  public: boolean
  list_items: { count: number }[]
}

interface Props { lists: EditorialList[] }

const CATEGORIES = ['Puanlama', 'Ödüller', 'Tematik', 'Yönetmen', 'Dönem', 'Ülke', 'Tür', 'Platform']
const LIST_TYPES = [
  { value: 'manual',         label: 'Manuel' },
  { value: 'dynamic_top250', label: 'Dinamik — Site Top 250' },
  { value: 'dynamic_imdb',   label: 'Dinamik — TMDb Top 250' },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Puanlama': 'bg-yellow-500/20 text-yellow-300',
  'Ödüller':  'bg-amber-500/20 text-amber-300',
  'Tematik':  'bg-blue-500/20 text-blue-300',
  'Yönetmen': 'bg-purple-500/20 text-purple-300',
  'Dönem':    'bg-green-500/20 text-green-300',
  'Ülke':     'bg-red-500/20 text-red-300',
  'Tür':      'bg-pink-500/20 text-pink-300',
  'Platform': 'bg-cyan-500/20 text-cyan-300',
}

export default function EditorialListManager({ lists }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', subtitle: '', emoji: '📋', category: 'Tematik',
    slug: '', list_type: 'manual', public: true,
  })
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleSave() {
    if (!form.title || !form.slug) return
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/admin/editorial-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setMsg({ type: 'ok', text: 'Liste oluşturuldu' })
      setShowForm(false)
      setForm({ title: '', subtitle: '', emoji: '📋', category: 'Tematik', slug: '', list_type: 'manual', public: true })
      router.refresh()
    } else {
      const d = await res.json()
      setMsg({ type: 'err', text: d.error ?? 'Hata' })
    }
  }

  async function togglePublic(id: string, current: boolean) {
    await fetch('/api/admin/editorial-lists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, public: !current }),
    })
    router.refresh()
  }

  return (
    <div>
      {msg && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
          msg.type === 'ok' ? 'bg-green-500/20 text-green-300 border border-green-500/30'
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Yeni liste formu */}
      {showForm ? (
        <div className="rounded-xl rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-bold text-white mb-4">Yeni Editöryal Liste</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Başlık *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white outline-none focus:border-[--accent]"
                placeholder="Ölmeden İzlenmesi Gereken Filmler" />
            </div>
            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Slug * (URL'de görünür)</label>
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white outline-none focus:border-[--accent] font-mono"
                placeholder="olmeden-izlenmesi-gerekenler" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[--text-secondary] mb-1">Alt başlık</label>
              <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white outline-none focus:border-[--accent]"
                placeholder="Sinema meraklılarının mutlaka görmesi gereken filmler..." />
            </div>
            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Emoji</label>
              <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white outline-none focus:border-[--accent]"
                placeholder="🎬" maxLength={4} />
            </div>
            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Kategori</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white outline-none focus:border-[--accent]">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[--text-secondary] mb-1">Liste Tipi</label>
              <select value={form.list_type} onChange={e => setForm(p => ({ ...p, list_type: e.target.value }))}
                className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white outline-none focus:border-[--accent]">
                {LIST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 self-end">
              <input type="checkbox" id="pub" checked={form.public}
                onChange={e => setForm(p => ({ ...p, public: e.target.checked }))}
                className="rounded" />
              <label htmlFor="pub" className="text-sm text-[--text-secondary]">Herkese açık</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !form.title || !form.slug}
              className="px-5 py-2 bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-[--bg-secondary] border border-[--border] text-[--text-secondary] text-sm rounded-lg hover:text-white transition-colors">
              İptal
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold rounded-lg transition-colors">
          + Yeni Editöryal Liste
        </button>
      )}

      {/* Liste tablosu */}
      <div className="rounded-xl rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full text-sm">
          <thead className="border-b border-[--border] bg-[--bg-secondary]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Liste</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider hidden sm:table-cell">Kategori</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider hidden md:table-cell">Tip</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">İçerik</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">Durum</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {lists.map(list => (
              <tr key={list.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{list.emoji ?? '📋'}</span>
                    <div>
                      <p className="text-white font-medium">{list.title}</p>
                      {list.slug && (
                        <p className="text-xs text-[--text-secondary] font-mono">/liste/editorial/{list.slug}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {list.category && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[list.category] ?? 'bg-[--bg-secondary] text-[--text-secondary]'}`}>
                      {list.category}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    list.list_type?.startsWith('dynamic')
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-[--bg-secondary] text-[--text-secondary]'
                  }`}>
                    {LIST_TYPES.find(t => t.value === list.list_type)?.label ?? list.list_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[--text-secondary]">
                    {list.list_type?.startsWith('dynamic') ? '~250' : (list.list_items?.[0]?.count ?? 0)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => togglePublic(list.id, list.public)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                      list.public
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        : 'bg-[--bg-secondary] text-[--text-secondary] hover:text-white'
                    }`}
                  >
                    {list.public ? 'Yayında' : 'Gizli'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={list.slug ? `/liste/editorial/${list.slug}` : `/liste/${list.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[--accent] hover:underline"
                  >
                    Görüntüle →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
