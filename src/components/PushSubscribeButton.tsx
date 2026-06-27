'use client'

import { useState, useEffect } from 'react'
import { IconBell } from './icons'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        if (sub) setStatus('subscribed')
      })
    })
    if (Notification.permission === 'denied') setStatus('denied')
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setStatus('denied'); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setStatus('subscribed')
    } catch {
      setStatus('denied')
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unsupported') return null

  return (
    <button
      onClick={status === 'subscribed' ? unsubscribe : subscribe}
      disabled={loading || status === 'denied'}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      style={status === 'subscribed'
        ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
        : status === 'denied'
        ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }
        : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }
      }
      title={status === 'denied' ? 'Tarayıcıda bildirim izni reddedildi' : undefined}
    >
      <IconBell className="h-4 w-4" />
      {loading ? 'Bekleniyor...' :
        status === 'subscribed' ? 'Bildirimler Açık' :
        status === 'denied' ? 'İzin Reddedildi' :
        'Bildirimleri Aç'
      }
    </button>
  )
}
