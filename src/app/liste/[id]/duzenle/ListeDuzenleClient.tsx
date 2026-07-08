'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconTrash, IconGlobe, IconLock, IconLoader, IconFilm, IconTv, IconAlertTriangle, IconCamera, IconClose } from '@/components/icons'
import { useLocale } from '@/context/LocaleContext'

interface ListItem {
  id: string; list_id: string; media_id: number; media_type: string
  note: string | null; position: number; title: string; poster: string | null
}
interface ListData {
  id: string; title: string; description: string | null; public: boolean; cover_url?: string | null
  is_editorial?: boolean
}

export default function ListeDuzenleClient({ list, items: initial }: { list: ListData; items: ListItem[] }) {
  const { t } = useLocale()
  const router = useRouter()
  const [title, setTitle]             = useState(list.title)
  const [description, setDescription] = useState(list.description ?? '')
  const [isPublic, setIsPublic]       = useState(list.public)
  const [coverUrl, setCoverUrl]       = useState(list.cover_url ?? '')
  const [items, setItems]             = useState(initial)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCoverPicker, setShowCoverPicker]     = useState(false)
  const [error, setError]             = useState('')

  async function saveInfo() {
    if (!title.trim()) { setError(t('list.titleRequired')); return }
    setSaving(true)
    setError('')
    const res = await fetch(`/api/lists/${list.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, public: isPublic, cover_url: coverUrl }),
    })
    setSaving(false)
    if (res.ok) router.push(`/liste/${list.id}`)
    else setError(t('list.saveFailed'))
  }

  async function removeItem(itemId: string) {
    setDeleting(itemId)
    await fetch(`/api/lists/${list.id}/items/${itemId}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== itemId))
    setDeleting(null)
  }

  async function deleteList() {
    await fetch(`/api/lists/${list.id}`, { method: 'DELETE' })
    router.push('/listeler')
  }

  function selectPoster(poster: string) {
    setCoverUrl(poster)
    setShowCoverPicker(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">{t('list.editTitle')}</h1>
        <Link href={`/liste/${list.id}`} className="text-sm text-[--text-secondary] hover:text-white transition-colors">
          ← {t('list.backToList')}
        </Link>
      </div>

      {/* Liste bilgileri */}
      <div className="rounded-xl rounded-2xl p-6 mb-6 space-y-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">{t('list.titleLabel')} *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
            className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <p className="mt-1 text-xs text-[--text-secondary] text-right">{title.length}/100</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">{t('list.descriptionLabel')}</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={3}
            className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors resize-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <p className="mt-1 text-xs text-[--text-secondary] text-right">{description.length}/500</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[--text-secondary] mb-2">{t('list.visibilityLabel')}</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsPublic(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${isPublic ? 'border-[--accent] bg-[--accent]/10 text-white' : 'border-[--border] text-[--text-secondary] hover:border-white/30'}`}>
              <IconGlobe className="h-4 w-4" /> {t('list.public')}
            </button>
            <button type="button" onClick={() => setIsPublic(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${!isPublic ? 'border-[--accent] bg-[--accent]/10 text-white' : 'border-[--border] text-[--text-secondary] hover:border-white/30'}`}>
              <IconLock className="h-4 w-4" /> {t('list.private')}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}
        <button onClick={saveInfo} disabled={saving}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }}>
          {saving && <IconLoader className="h-4 w-4 animate-spin" />}
          {saving ? t('list.saving') : t('common.save')}
        </button>
      </div>

      {/* Kapak Görseli */}
      <div className="rounded-xl rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <IconCamera className="h-4 w-4 text-[--accent]" /> {t('list.coverImage')}
        </h2>

        {/* Preview */}
        {coverUrl && (
          <div className="mb-4 rounded-xl overflow-hidden aspect-video relative group">
            <img src={coverUrl} alt="Kapak" className="w-full h-full object-cover" />
            <button
              onClick={() => setCoverUrl('')}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <IconClose className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* URL girişi */}
        <div className="mb-4">
          <label className="block text-xs text-[--text-secondary] mb-2">{t('list.imageUrlLabel')}</label>
          <input
            value={coverUrl}
            onChange={e => setCoverUrl(e.target.value)}
            placeholder="https://image.tmdb.org/t/p/w780/..."
            className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Listeden seç */}
        {items.length > 0 && (
          <>
            <button
              onClick={() => setShowCoverPicker(p => !p)}
              className="text-xs text-[--accent] hover:underline mb-3 block"
            >
              {showCoverPicker ? `▲ ${t('common.close')}` : `▼ ${t('list.pickFromList')}`}
            </button>
            {showCoverPicker && (
              <div className="grid grid-cols-5 gap-2">
                {items.filter(i => i.poster).map(item => (
                  <button
                    key={item.id}
                    onClick={() => selectPoster(item.poster!)}
                    className={`aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all hover:opacity-80 ${
                      coverUrl === item.poster ? 'border-[--accent] scale-105' : 'border-transparent'
                    }`}
                    title={item.title}
                  >
                    <img src={item.poster!} alt={item.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* İçerikler */}
      <div className="rounded-xl rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="font-semibold text-white mb-4">{t('list.contents')} ({items.length})</h2>
        {list.is_editorial && (
          <p className="text-xs text-[--text-secondary] mb-4 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            Film/dizi eklemek için ilgili film/dizi sayfasına gidip &quot;Listeye Ekle&quot; menüsünden bu listeyi seçin.
          </p>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-[--text-secondary] text-center py-8">{t('list.empty')}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="h-12 w-8 rounded-md overflow-hidden bg-[--bg-card] shrink-0">
                  {item.poster
                    ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[--text-secondary]">
                        {item.media_type === 'film' ? <IconFilm className="h-3 w-3" /> : <IconTv className="h-3 w-3" />}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{item.title}</p>
                  <p className="text-xs text-[--text-secondary]">{item.media_type === 'film' ? t('film.badge') : t('series.badge')}</p>
                </div>
                <button onClick={() => removeItem(item.id)} disabled={deleting === item.id}
                  className="p-1.5 rounded-lg text-[--text-secondary] hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40">
                  {deleting === item.id ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconTrash className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listeyi sil */}
      <div className="bg-[--bg-card] border border-red-900/30 rounded-2xl p-6">
        <h2 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
          <IconAlertTriangle className="h-4 w-4" /> {t('list.dangerZone')}
        </h2>
        <p className="text-sm text-[--text-secondary] mb-4">{t('list.deleteConfirm')}</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/20 text-sm font-medium transition-colors">
            {t('list.deleteBtn')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={deleteList}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
              {t('list.confirmDeleteYes')}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg border border-[--border] text-[--text-secondary] hover:text-white text-sm transition-colors">
              {t('common.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
