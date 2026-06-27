'use client'

import { useEffect, useState } from 'react'

export default function InviteSection() {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(d => {
        if (d.code) setCode(d.code)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://sinezon.com'

  const inviteLink = code ? `${siteUrl}/davet/${code}` : ''

  async function handleCopy() {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div
      className="mb-8 p-5 rounded-2xl"
      style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔗</span>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Arkadaşlarını Davet Et
        </p>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
        Özel davet linkini paylaşarak arkadaşlarını Sinezon&apos;a davet et.
      </p>

      {loading ? (
        <div className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
      ) : code ? (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="flex-1 rounded-lg px-3 py-2 text-xs outline-none truncate"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
          />
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: copied ? 'rgba(34,197,94,0.15)' : 'var(--accent)',
              color: copied ? '#22c55e' : '#fff',
              border: copied ? '1px solid rgba(34,197,94,0.4)' : '1px solid transparent',
            }}
          >
            {copied ? '✓ Kopyalandı' : 'Kopyala'}
          </button>
        </div>
      ) : (
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Davet linki oluşturulamadı. Lütfen tekrar dene.
        </p>
      )}
    </div>
  )
}
