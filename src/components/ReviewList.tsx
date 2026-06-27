'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { IconStar, IconStarFilled, IconChevronDown, IconChevronUp } from '@/components/icons'
import type { Review } from '@/lib/types'
import DeleteReviewButton from './DeleteReviewButton'
import LikeButton from './LikeButton'
import ReviewReplySection from './ReviewReplySection'
import ReportButton from './ReportButton'
import HelpfulButton from './HelpfulButton'

interface ReviewListProps {
  reviews: Review[]
  currentUserId?: string
  likeData?: Record<string, { count: number; liked: boolean }>
  replyCount?: Record<string, number>
  helpfulData?: Record<string, { count: number; marked: boolean }>
}

type SortKey = 'yeni' | 'begenilen' | 'faydali'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr))
}

function SpoilerContent({ content }: { content: string }) {
  const [revealed, setRevealed] = useState(false)
  if (revealed) return (
    <div className="mt-3 relative">
      <div className="absolute -left-3 top-0 bottom-0 w-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.4)' }} />
      <p className="text-[15px] leading-[1.75] whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{content}</p>
    </div>
  )
  return (
    <div className="mt-3 relative overflow-hidden rounded-xl"
      style={{ border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.03)' }}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap px-4 py-3 blur-[5px] select-none pointer-events-none"
        style={{ color: 'var(--text-secondary)' }}>{content}</p>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
        style={{ background: 'rgba(10,12,20,0.75)', backdropFilter: 'blur(2px)' }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(248,113,113,0.6)' }}>
          Spoiler İçerik
        </span>
        <button onClick={() => setRevealed(true)}
          className="text-[12px] font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
          ⚠️ Görmek için tıkla
        </button>
      </div>
    </div>
  )
}

function ReviewContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = content.length > 400
  return (
    <div className="mt-3">
      <p className={`text-[15px] leading-[1.75] whitespace-pre-wrap ${isLong && !expanded ? 'line-clamp-5' : ''}`} style={{ color: 'var(--text-secondary)' }}>
        {content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 flex items-center gap-1 text-xs font-semibold hover:underline transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          {expanded ? (
            <><IconChevronUp className="h-3 w-3" />Daha az göster</>
          ) : (
            <><IconChevronDown className="h-3 w-3" />Devamını oku</>
          )}
        </button>
      )}
    </div>
  )
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'yeni',      label: 'En Yeni'          },
  { key: 'begenilen', label: 'En Çok Beğenilen' },
  { key: 'faydali',   label: 'En Faydalı'       },
]

export default function ReviewList({ reviews, currentUserId, likeData = {}, replyCount = {}, helpfulData = {} }: ReviewListProps) {
  const [sort, setSort] = useState<SortKey>('yeni')

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-[--text-secondary]">
        <IconStar className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>Henüz yorum yok. İlk yorumu sen yap!</p>
      </div>
    )
  }

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'begenilen') return (likeData[b.id]?.count ?? 0) - (likeData[a.id]?.count ?? 0)
    if (sort === 'faydali')   return (helpfulData[b.id]?.count ?? 0) - (helpfulData[a.id]?.count ?? 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div>
      {/* Sıralama */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={sort === opt.key
              ? { background: 'var(--accent)', color: '#fff' }
              : { color: 'var(--text-secondary)' }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Yorum listesi */}
      <div className="space-y-4">
        {sorted.map((review) => {
          const likes   = likeData[review.id]   ?? { count: 0, liked: false }
          const helpful = helpfulData[review.id] ?? { count: 0, marked: false }
          const replies = replyCount[review.id]  ?? 0
          const username  = review.profiles?.username || 'Anonim'
          const avatarUrl = review.profiles?.avatar_url ?? null
          const isAdmin   = (review.profiles as any)?.is_admin ?? false
          const initial   = username[0].toUpperCase()

          return (
            <div
              key={review.id}
              className="rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: '3px solid rgba(225,29,72,0.5)',
              }}
            >
              {/* Header: avatar + kullanıcı + puan */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link href={`/profil/${username}`} className="shrink-0">
                    <div className="h-9 w-9 rounded-full bg-[--accent] flex items-center justify-center text-sm font-bold text-white overflow-hidden ring-2 ring-[--accent]/20">
                      {avatarUrl
                        ? <Image src={avatarUrl} alt={username} width={36} height={36} className="w-full h-full object-cover" />
                        : initial
                      }
                    </div>
                  </Link>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/profil/${username}`} className="font-semibold text-white text-sm hover:text-[--accent] transition-colors">
                        {username}
                      </Link>
                      {isAdmin && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(225,29,72,0.12)', color: 'var(--accent)', border: '1px solid rgba(225,29,72,0.25)' }}>
                          STAFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[--text-secondary]">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Spoiler badge */}
                  {review.has_spoiler && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                      ⚠️ Spoiler
                    </span>
                  )}
                  {/* Puan */}
                  <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'var(--bg-secondary)' }}>
                    <IconStarFilled className="h-3.5 w-3.5 text-[--gold]" />
                    <span className="text-sm font-bold text-[--gold]">{review.rating}/10</span>
                  </div>
                  {currentUserId === review.user_id && (
                    <DeleteReviewButton reviewId={review.id} />
                  )}
                </div>
              </div>

              {/* İçerik */}
              {review.has_spoiler
                ? <SpoilerContent content={review.content} />
                : <ReviewContent content={review.content} />
              }

              {/* Etiketler */}
              {review.tags && review.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {review.tags.map(t => (
                    <span key={t} className="text-[10px] rounded-full px-2 py-0.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Aksiyon bar */}
              <div className="mt-4 pt-3 flex items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
                <LikeButton
                  reviewId={review.id}
                  initialCount={likes.count}
                  initialLiked={likes.liked}
                  isLoggedIn={!!currentUserId}
                />
                {currentUserId !== review.user_id && (
                  <HelpfulButton
                    reviewId={review.id}
                    initialCount={helpful.count}
                    initialMarked={helpful.marked}
                    isLoggedIn={!!currentUserId}
                  />
                )}
                {currentUserId && currentUserId !== review.user_id && (
                  <ReportButton targetType="review" targetId={review.id} isLoggedIn={true} />
                )}
              </div>

              <ReviewReplySection
                reviewId={review.id}
                initialCount={replies}
                currentUserId={currentUserId}
                isLoggedIn={!!currentUserId}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
