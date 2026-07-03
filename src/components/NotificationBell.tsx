'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useId } from 'react'
import Link from 'next/link'
import { IconBell } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/context/LocaleContext'

interface Notification {
  id: string
  type: 'like' | 'follow' | 'reply'
  read: boolean
  created_at: string
  review_id: string | null
  actor: { username: string; avatar_url: string | null } | null
  review: { media_id: number; media_type: string } | null
}

interface Props { userId: string }

export default function NotificationBell({ userId }: Props) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const instanceId = useId()

  function timeAgo(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60) return t('notifications.justNow')
    if (diff < 3600) return t('notifications.minutesAgo', { minutes: Math.floor(diff / 60) })
    if (diff < 86400) return t('notifications.hoursAgo', { hours: Math.floor(diff / 3600) })
    return t('notifications.daysAgo', { days: Math.floor(diff / 86400) })
  }

  async function fetchNotifications() {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('id, type, read, created_at, review_id, actor:profiles!actor_id(username, avatar_url), review:reviews(media_id, media_type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data as unknown as Notification[])
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  useEffect(() => {
    fetchNotifications()

    // Realtime: yeni bildirim gelince güncelle
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications-${instanceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => fetchNotifications())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // Dropdown açıldığında okundu işaretle
  useEffect(() => {
    if (open) markAllRead()
  }, [open])

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  function notifText(n: Notification) {
    const actor = n.actor?.username ?? t('notifications.someone')
    if (n.type === 'like') return t('notifications.likedReviewWithActor', { actor })
    if (n.type === 'follow') return t('notifications.newFollower', { actor })
    if (n.type === 'reply') return t('notifications.repliedToReviewWithActor', { actor })
    return ''
  }

  function notifHref(n: Notification) {
    if (n.type === 'follow' && n.actor?.username) return `/profil/${n.actor.username}`
    if (n.type === 'like' && n.review) return `/${n.review.media_type}/${n.review.media_id}`
    return '#'
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-white/5 transition-colors"
        aria-label={t('notifications.ariaLabel')}
      >
        <IconBell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[--accent] text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl z-50 overflow-hidden backdrop-blur-xl"
          style={{ background: 'linear-gradient(160deg, rgba(14,20,36,0.98), rgba(10,14,26,0.99))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}>
          {/* Başlık */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-sm font-semibold text-white">{t('notifications.title')}</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[--accent] hover:underline"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-[--text-secondary]">
                {t('notifications.empty')}
              </div>
            ) : (
              notifications.map(n => (
                <a
                  key={n.id}
                  href={notifHref(n)}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors last:border-0 ${
                    !n.read ? '' : ''
                  }`}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: !n.read ? 'rgba(225,29,72,0.04)' : 'transparent' }}
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-[--accent] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                    {n.actor?.avatar_url
                      ? <Image src={n.actor.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                      : (n.actor?.username?.[0] ?? '?').toUpperCase()
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug">{notifText(n)}</p>
                    <p className="text-xs text-[--text-secondary] mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>

                  {!n.read && (
                    <div className="h-2 w-2 rounded-full bg-[--accent] shrink-0 mt-1.5" />
                  )}
                </a>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <Link
              href="/bildirimler"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              {t('notifications.viewAll')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
