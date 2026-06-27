'use client'

import { useState } from 'react'

export default function EmbedWidgetCopy({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sinema-platform.vercel.app'
  const code = `<iframe src="${baseUrl}/embed/profil/${username}" width="336" height="260" frameborder="0" style="border-radius:16px;overflow:hidden;" loading="lazy"></iframe>`

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-xl p-4" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-semibold text-white">📎 Profil Widget</p>
        <button
          onClick={copy}
          className="px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
          style={copied
            ? { background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }
            : { background: 'linear-gradient(135deg, #E11D48, #be123c)', color: '#fff', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }
          }
        >
          {copied ? '✓ Kopyalandı' : 'Kodu Kopyala'}
        </button>
      </div>
      <code className="block text-[10px] rounded-lg p-2.5 break-all"
        style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
        {code}
      </code>
    </div>
  )
}
