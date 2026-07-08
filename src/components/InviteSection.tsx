'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/LocaleContext'
import { IconUsers } from '@/components/icons'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinezon.com'

export default function InviteSection() {
  const { t } = useLocale()
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/referral')
      .then(res => res.json())
      .then(data => { if (data.code) setCode(data.code) })
      .catch(() => {})
  }, [])

  if (!code) return null

  const link = `${SITE_URL}/davet/${code}`

  function copy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-8 p-4 rounded-xl" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider flex items-center gap-1.5">
          <IconUsers size={14} /> {t('invite.myLinkTitle')}
        </p>
        <Link href="/davet" className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>
          {t('invite.leaderboardTitle')}
        </Link>
      </div>
      <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('invite.myLinkDesc')}</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          onFocus={e => e.target.select()}
          aria-label={t('invite.myLinkTitle')}
          className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.7)' }}
        />
        <button
          onClick={copy}
          className="shrink-0 text-xs px-3 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={copied
            ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }
            : { background: 'var(--accent)', color: '#fff' }
          }
        >
          {copied ? `✓ ${t('profile.copied')}` : t('invite.copyLink')}
        </button>
      </div>
    </div>
  )
}
