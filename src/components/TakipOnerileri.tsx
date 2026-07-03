'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/LocaleContext'

interface Suggestion {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export default function TakipOnerileri() {
  const { t } = useLocale()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [type, setType] = useState<'mutual' | 'popular'>('popular')
  const [followed, setFollowed] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/takip-onerileri')
      .then(r => r.json())
      .then(d => { setSuggestions(d.suggestions ?? []); setType(d.type ?? 'popular') })
      .catch(() => {})
  }, [])

  if (suggestions.length === 0) return null

  async function follow(id: string) {
    await fetch('/api/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: id }) })
    setFollowed(prev => new Set([...prev, id]))
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,168,67,0.6)' }}>
          {type === 'mutual' ? t('social.followingYou') : t('social.mayKnow')}
        </p>
      </div>
      <div className="divide-y divide-white/5">
        {suggestions.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3">
            <Link href={`/profil/${s.username}`} className="shrink-0">
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden"
                style={{ background: 'var(--accent)' }}>
                {s.avatar_url ? <img src={s.avatar_url} alt={s.username} className="w-full h-full object-cover" /> : s.username[0].toUpperCase()}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profil/${s.username}`} className="text-[13px] font-semibold text-white hover:text-[--accent] transition-colors truncate block">
                {s.full_name || s.username}
              </Link>
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>@{s.username}</p>
            </div>
            {followed.has(s.id) ? (
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                {t('social.followed')}
              </span>
            ) : (
              <button onClick={() => follow(s.id)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)', color: '#D4A843' }}>
                {t('profile.follow')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
