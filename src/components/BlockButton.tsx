'use client'
import { useState } from 'react'
import { useLocale } from '@/context/LocaleContext'

export default function BlockButton({ blockedId, initialBlocked }: { blockedId: string; initialBlocked: boolean }) {
  const { t } = useLocale()
  const [blocked, setBlocked] = useState(initialBlocked)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function toggle() {
    if (!blocked && !confirm) { setConfirm(true); return }
    setLoading(true)
    setConfirm(false)
    const method = blocked ? 'DELETE' : 'POST'
    await fetch('/api/block', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blockedId }) })
    setBlocked(!blocked)
    setLoading(false)
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('social.blockConfirm')}</span>
        <button onClick={toggle} disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: '#ef4444', color: 'white' }}>
          {t('social.blockConfirmYes')}
        </button>
        <button onClick={() => setConfirm(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
          {t('social.cancel')}
        </button>
      </div>
    )
  }

  return (
    <button onClick={toggle} disabled={loading}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: blocked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${blocked ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
        color: blocked ? '#f87171' : 'rgba(255,255,255,0.5)',
      }}>
      {loading ? '...' : blocked ? `🚫 ${t('social.blocked')}` : `🚫 ${t('social.block')}`}
    </button>
  )
}
