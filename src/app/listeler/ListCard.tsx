'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IconHeart, IconHeartFilled, IconCopy, IconRss } from '@/components/icons'

interface Props {
  list: {
    id: string
    title: string
    description: string | null
    cover_url?: string | null
    profiles: { username: string; avatar_url: string | null } | null
    list_items: { count: number }[]
    list_likes: { count: number }[]
    list_follows?: { count: number }[]
  }
  posters: string[]
  isLoggedIn: boolean
  isLiked: boolean
  isFollowing?: boolean
}

export default function ListCard({ list, posters, isLoggedIn, isLiked: initialLiked, isFollowing: initialFollowing = false }: Props) {
  const router = useRouter()
  const [liked, setLiked]             = useState(initialLiked)
  const [likeCount, setLikeCount]     = useState(list.list_likes?.[0]?.count ?? 0)
  const [following, setFollowing]     = useState(initialFollowing)
  const [followCount, setFollowCount] = useState(list.list_follows?.[0]?.count ?? 0)
  const [copying, setCopying]         = useState(false)

  const itemCount = list.list_items?.[0]?.count ?? 0

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault()
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setLiked(!liked)
    setLikeCount(c => liked ? c - 1 : c + 1)
    await fetch('/api/list-likes', {
      method: liked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list_id: list.id }),
    })
  }

  async function toggleFollow(e: React.MouseEvent) {
    e.preventDefault()
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setFollowing(!following)
    setFollowCount(c => following ? c - 1 : c + 1)
    await fetch(`/api/lists/${list.id}/follow`, { method: following ? 'DELETE' : 'POST' })
  }

  async function copyList(e: React.MouseEvent) {
    e.preventDefault()
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setCopying(true)
    const res  = await fetch('/api/lists/copy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ list_id: list.id }) })
    const data = await res.json()
    setCopying(false)
    if (data.list_id) router.push(`/liste/${data.list_id}`)
  }

  const hasCover = !!list.cover_url

  // Asimetrik kolaj: büyük | orta | ufak
  const p0 = posters[0] ?? null
  const p1 = posters[1] ?? null
  const p2 = posters[2] ?? null
  const p3 = posters[3] ?? null

  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-6px)'
        el.style.boxShadow = '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(225,29,72,0.3), 0 0 40px rgba(225,29,72,0.06)'
        el.style.borderColor = 'rgba(225,29,72,0.35)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = ''
        el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)'
        el.style.borderColor = 'var(--border)'
      }}
    >
      {/* ── Görsel alanı ── */}
      <Link href={`/liste/${list.id}`} className="block relative overflow-hidden flex-shrink-0">
        {hasCover ? (
          <div className="h-52 overflow-hidden">
            <img
              src={list.cover_url!}
              alt={list.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          // Asimetrik 3+1 kolaj: 45% | 30% | 25%
          <div className="flex h-52 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>

            {/* Sol — büyük poster */}
            <div className="relative overflow-hidden" style={{ width: '45%', flexShrink: 0 }}>
              {p0 ? (
                <img
                  src={`https://image.tmdb.org/t/p/w342${p0}`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(160deg, var(--bg-elevated), var(--bg-secondary))' }} />
              )}
              {/* dikey ayırıcı */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px]" style={{ background: 'var(--bg-primary)' }} />
            </div>

            {/* Orta — iki üst üste */}
            <div
              className="flex flex-col overflow-hidden relative"
              style={{ width: '30%', flexShrink: 0, borderLeft: '2px solid var(--bg-primary)', borderRight: '2px solid var(--bg-primary)' }}
            >
              <div className="relative overflow-hidden" style={{ height: '50%' }}>
                {p1 ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${p1}`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: 'var(--bg-elevated)' }} />
                )}
              </div>
              <div className="h-[2px] shrink-0" style={{ background: 'var(--bg-primary)' }} />
              <div className="relative overflow-hidden flex-1">
                {p2 ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${p2}`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: 'var(--bg-secondary)' }} />
                )}
              </div>
            </div>

            {/* Sağ — ince şerit (4. poster peek) */}
            <div className="relative overflow-hidden flex-1">
              {p3 ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${p3}`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ objectPosition: 'center top' }}
                />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))' }} />
              )}
              {/* Sağ kenar fade */}
              <div
                className="absolute inset-y-0 right-0 w-8"
                style={{ background: 'linear-gradient(to right, transparent, var(--bg-card))' }}
              />
            </div>
          </div>
        )}

        {/* Alt gradient overlay */}
        <div
          className="absolute inset-x-0 bottom-0 h-20"
          style={{ background: 'linear-gradient(to top, var(--bg-card) 15%, rgba(17,24,39,0.5) 60%, transparent)' }}
        />

        {/* İçerik sayısı badge — sol alt */}
        <span
          className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
          style={{
            background: 'rgba(11,15,25,0.85)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.03em',
          }}
        >
          {itemCount} içerik
        </span>
      </Link>

      {/* ── İçerik ── */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
        <Link href={`/liste/${list.id}`} className="flex-1 mb-3 block">
          <h2
            className="font-bold text-[15px] leading-snug line-clamp-2 mb-1.5 transition-colors duration-200 group-hover:text-white"
            style={{ color: 'var(--text-primary)' }}
          >
            {list.title}
          </h2>
          {list.description && (
            <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {list.description}
            </p>
          )}
        </Link>

        {/* Alt bar */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Link
            href={`/profil/${list.profiles?.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
          >
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              {list.profiles?.avatar_url
                ? <img src={list.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                : (list.profiles?.username?.[0] ?? '?').toUpperCase()}
            </div>
            <span className="text-[11px] truncate font-medium" style={{ color: 'var(--text-secondary)' }}>
              {list.profiles?.username}
            </span>
          </Link>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={copyList} disabled={copying} title="Kopyala"
              className="transition-opacity disabled:opacity-40 hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              <IconCopy className="h-3.5 w-3.5" />
            </button>

            {followCount > 0 && (
              <button
                onClick={toggleFollow}
                className="flex items-center gap-1 transition-colors"
                title={following ? 'Takibi bırak' : 'Takip et'}
              >
                <IconRss
                  className="h-3.5 w-3.5"
                  style={{ color: following ? 'var(--accent)' : 'var(--text-secondary)' }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: following ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {followCount}
                </span>
              </button>
            )}

            <button
              onClick={toggleLike}
              className="flex items-center gap-1 transition-colors"
              title={liked ? 'Beğeniyi kaldır' : 'Beğen'}
            >
              {liked
                ? <IconHeartFilled className="h-3.5 w-3.5" style={{ color: '#f87171' }} />
                : <IconHeart className="h-3.5 w-3.5" style={{ color: 'var(--text-secondary)' }} />
              }
              <span
                className="text-[11px] font-medium"
                style={{ color: liked ? '#f87171' : 'var(--text-secondary)' }}
              >
                {likeCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
