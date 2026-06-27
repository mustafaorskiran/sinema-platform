'use client'

import { useState } from 'react'

interface Props {
  mediaId: number
  mediaType: string
  initialNote: string
}

export default function PrivateNoteWidget({ mediaId, mediaType, initialNote }: Props) {
  const [note, setNote] = useState(initialNote)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/private-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId, media_type: mediaType, note }),
    })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-xl p-4" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">🔒 Özel Notum</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-[--accent] hover:underline"
          >
            {note ? 'Düzenle' : 'Not ekle'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Sadece sen görebilirsin..."
            className="w-full bg-[--bg-secondary] border border-[--border] rounded-lg px-3 py-2 text-sm text-white placeholder-[--text-secondary] focus:outline-none focus:border-[--accent]/60 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-1.5 text-xs border border-[--border] rounded-lg text-[--text-secondary] hover:text-white transition-colors"
            >
              İptal
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-1.5 text-xs bg-[--accent] hover:bg-[--accent-hover] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {note
            ? <p className="text-sm text-[--text-secondary] leading-relaxed">{note}</p>
            : <p className="text-xs text-[--text-secondary] italic">Henüz not eklemedin.</p>
          }
          {saved && <p className="text-xs text-green-400 mt-1">✓ Kaydedildi</p>}
        </div>
      )}
    </div>
  )
}
