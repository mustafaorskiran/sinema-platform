'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { IconBell, IconBellOff } from '@/components/icons'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushSubscribeButton() {
  const { t } = useLocale()
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('loading')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied'); return
    }
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  async function subscribe() {
    if (!VAPID_PUBLIC_KEY) return
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); setBusy(false); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setStatus('subscribed')
    } catch { setStatus('unsubscribed') }
    setBusy(false)
  }

  async function unsubscribe() {
    setBusy(true)
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
      setStatus('unsubscribed')
    } catch {}
    setBusy(false)
  }

  if (status === 'loading') return null
  if (status === 'unsupported') return null

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
        <IconBellOff size={14} /> {t('settings.pushBlocked')}
      </div>
    )
  }

  if (status === 'subscribed') {
    return (
      <button onClick={unsubscribe} disabled={busy}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:brightness-110"
        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
        <IconBell size={14} /> {t('settings.pushActive')}
      </button>
    )
  }

  return (
    <button onClick={subscribe} disabled={busy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(212,168,67,0.08))', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' }}>
      <IconBell size={14} /> {busy ? t('settings.pushEnabling') : t('settings.pushEnable')}
    </button>
  )
}
