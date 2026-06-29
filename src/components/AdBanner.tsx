'use client'

import { useEffect, useRef } from 'react'

interface Props {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
  style?: React.CSSProperties
}

declare global {
  interface Window { adsbygoogle: unknown[] }
}

export default function AdBanner({ slot, format = 'auto', className = '', style }: Props) {
  const adRef = useRef<HTMLModElement>(null)
  const initialized = useRef(false)

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID

  useEffect(() => {
    if (!clientId || initialized.current) return
    initialized.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [clientId])

  if (!clientId) return null

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 100, ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
