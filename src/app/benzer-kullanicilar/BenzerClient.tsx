'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconUsers, IconFilm, IconTv, IconUserPlus, IconCheck, IconLoader } from '@/components/icons'

interface SimilarUser {
  user_id: string
  username: string
  avatar_url: string | null
  common_high_ratings: number
  common_watched: number
  common_list_items: number
  similarity_score: number
}

interface Pick {
  media_id: number
  media_type: string
  avg_rating: number
  fan_count: number
  title: string
  year: string | null
  poster: string | null
}

interface Props {
  similarUsers: SimilarUser[]
  picks: Pick[]
  followingIds: string[]
}

type Tab = 'tumu' | 'film' | 'dizi'

export default function BenzerClient({ similarUsers, picks, followingIds: initial }: Props) {
  const [following, setFollowing]     = useState(() => new Set(initial))
  const [loadingFollow, setLoading]   = useState<string | null>(null)
  const [tab, setTab]                 = useState<Tab>('tumu')

  async function toggleFollow(userId: string) {
    const isNow = following.has(userId)
    setLoading(userId)
    await fetch('/api/follow', {
      method: isNow ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ following_id: userId }),
    })
    setFollowing(prev => {
      const next = new Set(prev)
      isNow ? next.delete(userId) : next.add(userId)
      return next
    })
    setLoading(null)
  }

  const filteredPicks = picks.filter(p =>
    tab === 'tumu' ||
    (tab === 'film' && p.media_type === 'film') ||
    (tab === 'dizi' && p.media_type === 'dizi')
  )

  const filmCount = picks.filter(p => p.media_type === 'film').length
  const diziCount = picks.filter(p => p.media_type === 'dizi').length

  return (
    <>
      {/* ── Benzer Kullanıcılar ── */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <IconUsers className="h-5 w-5 text-[--accent]" />
          <h2 className="text-lg font-bold text-white">
            Sana Benzer Kullanıcılar
          </h2>
          <span className="text-xs text-[--text-secondary] ml-1">
            ({similarUsers.length} kullanıcı bulundu)
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {similarUsers.map(u => (
            <UserCard
              key={u.user_id}
              user={u}
              isFollowing={following.has(u.user_id)}
              loading={loadingFollow === u.user_id}
              onFollow={() => toggleFollow(u.user_id)}
            />
          ))}
        </div>
      </section>

      {/* ── İçerik Önerileri ── */}
      <section>
        <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Senin Gibi Kullanıcılar Bunları Sevdi
            </h2>
            <p className="text-xs text-[--text-secondary] mt-1">
              Zevklerin örtüşen kullanıcıların yüksek puan verdiği, henüz izlemediğin içerikler
            </p>
          </div>

          {/* Tab filtresi */}
          <div className="flex items-center gap-1 rounded-xl p-1 shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {([
              ['tumu',  `Tümü (${picks.length})`],
              ['film',  `Film (${filmCount})`],
              ['dizi',  `Dizi (${diziCount})`],
            ] as [Tab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === key
                    ? 'bg-[--accent] text-white'
                    : 'text-[--text-secondary] hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredPicks.length === 0 ? (
          <div className="py-16 text-center text-[--text-secondary] rounded-2xl"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            Bu kategoride öneri bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredPicks.map(pick => (
              <PickCard key={`${pick.media_type}-${pick.media_id}`} pick={pick} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function UserCard({ user, isFollowing, loading, onFollow }: {
  user: SimilarUser
  isFollowing: boolean
  loading: boolean
  onFollow: () => void
}) {

  return (
    <div className="rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:-translate-y-1"
      style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Link href={`/profil/${user.username}`} className="hover:opacity-80 transition-opacity">
        <div className="h-16 w-16 rounded-full bg-[--accent] flex items-center justify-center text-xl font-bold text-white overflow-hidden ring-2 ring-[--border]">
          {user.avatar_url
            ? <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            : user.username[0]?.toUpperCase() ?? '?'
          }
        </div>
      </Link>

      <div className="min-w-0 w-full">
        <Link href={`/profil/${user.username}`}
          className="text-sm font-semibold text-white hover:text-[--accent] transition-colors block truncate">
          @{user.username}
        </Link>
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(user.similarity_score * 10, 100)}%`, background: 'linear-gradient(90deg, #D4A843, #E11D48)' }} />
          </div>
          <span className="text-[10px] font-bold shrink-0" style={{ color: '#D4A843' }}>{Math.round(user.similarity_score * 10)}%</span>
        </div>
        <div className="mt-1.5 space-y-0.5">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="font-medium text-white">{user.common_high_ratings}</span> ortak yüksek puan
          </p>
          {user.common_watched > 0 && (
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span className="font-medium text-white">{user.common_watched}</span> ortak izlenen
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onFollow}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60"
        style={isFollowing
          ? { background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.25)', color: '#E11D48' }
          : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }
        }
      >
        {loading
          ? <IconLoader className="h-3.5 w-3.5 animate-spin" />
          : isFollowing
            ? <><IconCheck className="h-3.5 w-3.5" /> Takip Ediliyor</>
            : <><IconUserPlus className="h-3.5 w-3.5" /> Takip Et</>
        }
      </button>
    </div>
  )
}

function PickCard({ pick }: { pick: Pick }) {
  return (
    <Link href={`/${pick.media_type}/${pick.media_id}`} className="group block">
      <div className="aspect-[2/3] rounded-xl overflow-hidden relative transition-all group-hover:border-[--accent]/50"
        style={{ background: 'rgba(20,28,47,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {pick.poster
          ? <img src={pick.poster} alt={pick.title}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
          : <div className="w-full h-full flex items-center justify-center text-[--text-secondary]">
              {pick.media_type === 'film'
                ? <IconFilm className="h-6 w-6 opacity-30" />
                : <IconTv className="h-6 w-6 opacity-30" />}
            </div>
        }

        {/* Ort. puan */}
        <div className="absolute top-1.5 right-1.5 bg-black/70 text-[--gold] text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
          ★ {pick.avg_rating.toFixed(1)}
        </div>

        {/* Kaç kişi beğendi */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5">
          <span className="bg-[--accent]/80 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
            {pick.fan_count} kişi sevdi
          </span>
        </div>
      </div>

      <p className="mt-1.5 text-xs text-[--text-secondary] line-clamp-1 group-hover:text-white transition-colors">
        {pick.title}
      </p>
      {pick.year && (
        <p className="text-[10px] text-[--text-secondary]/60">{pick.year}</p>
      )}
    </Link>
  )
}
