'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  watchlistId: string
  initialNote?: string | null
}

export default function WatchlistNoteButton({ watchlistId, initialNote }: Props) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(initialNote ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [open])

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('watchlist').update({ note: note.trim() || null }).eq('id', watchlistId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 800)
  }

  const hasNote = (initialNote ?? '').length > 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title={hasNote ? 'Notu düzenle' : 'Not ekle'}
        className="p-1.5 rounded-lg transition-colors hover:bg-white/8"
        style={{ color: hasNote ? '#D4A843' : 'rgba(255,255,255,0.25)' }}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-56 sm:w-64 rounded-xl p-3 shadow-xl"
            style={{
              maxWidth: 'calc(100vw - 32px)',
              background: 'linear-gradient(160deg, rgba(20,28,47,0.98), rgba(14,20,32,0.99))',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
            <p className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Kişisel Not</p>
            <textarea
              ref={textareaRef}
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Bu filmi neden izlemek istiyorsun?"
              className="w-full resize-none rounded-lg px-3 py-2 text-xs outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{note.length}/500</span>
              <button
                onClick={save}
                disabled={saving || saved}
                className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: saved ? 'rgba(74,222,128,0.15)' : 'linear-gradient(135deg, #E11D48, #be123c)',
                  color: saved ? '#4ade80' : 'white',
                  opacity: saving ? 0.7 : 1,
                }}>
                {saved ? '✓ Kaydedildi' : saving ? '...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
