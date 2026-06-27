import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IconBell, IconHeart, IconUserPlus, IconReply, IconMail } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import BildirimlerClient from './BildirimlerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bildirimler | Sinezon' }

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60)       return 'az önce'
  if (diff < 3600)     return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400)    return `${Math.floor(diff / 3600)} sa önce`
  if (diff < 604800)   return `${Math.floor(diff / 86400)} gün önce`
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

function getDetails(n: any) {
  const username = n.actor?.username ?? 'Biri'
  if (n.type === 'like')         return { label: 'yorumunu beğendi',           href: n.review ? `/${n.review.media_type}/${n.review.media_id}` : '#', badgeColor: '#f87171',     Icon: IconHeart   }
  if (n.type === 'follow')       return { label: 'seni takip etmeye başladı',  href: `/profil/${username}`,                                           badgeColor: 'var(--accent)', Icon: IconUserPlus }
  if (n.type === 'reply')        return { label: 'yorumuna yanıt verdi',        href: n.review ? `/${n.review.media_type}/${n.review.media_id}` : '#', badgeColor: '#60a5fa',    Icon: IconReply   }
  if (n.type === 'forum_reply')  return { label: n.content ?? 'Konuna yanıt geldi', href: n.link ?? '/forum',   badgeColor: '#a78bfa',             Icon: IconReply }
  if (n.type === 'message')      return { label: n.content ?? 'Sana mesaj gönderdi', href: n.link ?? '/mesajlar', badgeColor: '#34d399',            Icon: IconMail  }
  return                                { label: n.content ?? '',               href: n.link ?? '#',                                                   badgeColor: 'rgba(212,168,67,0.7)', Icon: IconBell }
}

export default async function BildirimlerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, type, read, created_at, review_id, content, link, actor:profiles!actor_id(username, avatar_url), review:reviews(media_id, media_type)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const items = (notifications ?? []) as any[]
  const unreadCount = items.filter(n => !n.read).length

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Başlık */}
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <IconBell className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bildirimler</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {unreadCount > 0 ? `${unreadCount} okunmamış` : 'Hepsi okundu'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && <BildirimlerClient />}
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <IconBell className="h-10 w-10 mx-auto mb-3 text-white opacity-20" />
          <p className="text-white font-medium mb-1">Henüz bildirim yok</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Yorumunuz beğenildiğinde veya biri sizi takip ettiğinde buraya düşer.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map(n => {
            const { label, href, badgeColor, Icon } = getDetails(n)

            return (
              <Link
                key={n.id}
                href={href}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-colors hover:bg-white/5"
                style={{
                  background: n.read ? 'transparent' : 'rgba(225,29,72,0.05)',
                  border: `1px solid ${n.read ? 'transparent' : 'rgba(225,29,72,0.12)'}`,
                }}
              >
                {/* Avatar + type badge */}
                <div className="relative shrink-0">
                  <div
                    className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'var(--accent)' }}
                  >
                    {n.actor?.avatar_url
                      ? <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (n.actor?.username?.[0] ?? '?').toUpperCase()
                    }
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
                    style={{ background: badgeColor, border: '2px solid var(--bg-primary)' }}
                  >
                    <Icon className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug">
                    <span className="font-semibold">{n.actor?.username ?? 'Biri'}</span>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>

                {/* Okunmamış nokta */}
                {!n.read && (
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
