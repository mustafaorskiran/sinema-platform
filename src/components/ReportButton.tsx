'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const REASONS = [
  'Spam / Reklam',
  'Hakaret / Küfür',
  'Yanlış bilgi / Spoiler',
  'Nefret söylemi',
  'Diğer',
]

interface Props {
  targetType: 'review' | 'user' | 'reply'
  targetId: string
  isLoggedIn: boolean
  className?: string
}

export default function ReportButton({ targetType, targetId, isLoggedIn, className }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function handleClick() {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setOpen(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    setSending(true)
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, details }),
    })
    setSending(false)
    setSent(true)
    setTimeout(() => { setSent(false); setOpen(false); setReason(''); setDetails('') }, 2500)
  }

  return (
    <>
      <button onClick={handleClick} className={className ?? 'text-xs text-[--text-secondary] hover:text-red-400 transition-colors'}>
        ⚑ Şikayet
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl rounded-xl p-6 shadow-2xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-white mb-4">Şikayet Et</h2>

            {sent ? (
              <p className="text-green-400 text-sm text-center py-4">✓ Şikayetin alındı. Moderatörler inceleyecek.</p>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-2">
                  {REASONS.map(r => (
                    <label key={r} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)}
                        className="accent-[--accent]" />
                      <span className="text-sm text-white">{r}</span>
                    </label>
                  ))}
                </div>
                <textarea value={details} onChange={e => setDetails(e.target.value)} rows={2} maxLength={300}
                  placeholder="Ek açıklama (opsiyonel)"
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-3 py-2 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors resize-none"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-[--border] text-[--text-secondary] hover:text-white text-sm transition-colors">
                    İptal
                  </button>
                  <button type="submit" disabled={!reason || sending}
                    className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    {sending ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
