'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/LocaleContext'

interface UserData {
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  reviewCount: number
  followerCount: number
  is_premium: boolean
}

export default function UserHoverCard({ username, children }: { username: string; children: React.ReactNode }) {
  const { t } = useLocale()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fetchedRef = useRef(false)

  const fetchUser = useCallback(async () => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    setLoading(true)
    try {
      const res = await fetch(`/api/user-card/${username}`)
      if (res.ok) setUserData(await res.json())
    } catch {}
    setLoading(false)
  }, [username])

  function onEnter() {
    timerRef.current = setTimeout(() => {
      setVisible(true)
      fetchUser()
    }, 300)
  }

  function onLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <span className="relative inline-block" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {visible && (
        <div
          className="absolute z-50 bottom-full left-0 mb-2 w-56 pointer-events-none"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
        >
          <div className="rounded-xl p-3"
            style={{ background: 'linear-gradient(160deg, rgba(14,20,36,0.99), rgba(10,14,26,0.99))', border: '1px solid rgba(255,255,255,0.09)' }}>
            {loading && !userData ? (
              <div className="flex items-center gap-2 py-1">
                <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="flex-1">
                  <div className="h-2.5 w-20 rounded animate-pulse mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="h-2 w-14 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            ) : userData ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0"
                    style={{ border: userData.is_premium ? '2px solid #D4A843' : '2px solid rgba(255,255,255,0.1)' }}>
                    {userData.avatar_url
                      ? <img src={userData.avatar_url} alt={username} width={36} height={36} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'rgba(225,29,72,0.3)' }}>
                          {username[0].toUpperCase()}
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-white truncate">{userData.full_name || username}</p>
                      {userData.is_premium && <span className="text-[10px]">⭐</span>}
                    </div>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>@{username}</p>
                  </div>
                </div>

                {userData.bio && (
                  <p className="text-[10px] mb-2 line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{userData.bio}</p>
                )}

                <div className="flex gap-3 text-center">
                  <div>
                    <p className="text-xs font-bold text-white">{userData.reviewCount}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('social.reviewsLabel')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{userData.followerCount}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('profile.followers')}</p>
                  </div>
                </div>
              </>
            ) : null}

            {/* Küçük ok */}
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45"
              style={{ background: 'rgba(14,20,36,0.99)', borderRight: '1px solid rgba(255,255,255,0.09)', borderBottom: '1px solid rgba(255,255,255,0.09)' }} />
          </div>
        </div>
      )}
    </span>
  )
}
