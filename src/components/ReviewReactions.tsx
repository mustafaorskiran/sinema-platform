'use client'

import { useState, useTransition } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { IconClap, IconLaugh, IconCry, IconAngry, IconFire, IconStarFilled } from '@/components/icons'

const REACTIONS = ['👏', '😂', '😢', '😡', '🔥', '💯'] as const
type Reaction = typeof REACTIONS[number]

const REACTION_ICONS: Record<Reaction, typeof IconClap> = {
  '👏': IconClap,
  '😂': IconLaugh,
  '😢': IconCry,
  '😡': IconAngry,
  '🔥': IconFire,
  '💯': IconStarFilled,
}

interface ReactionCount { reaction: Reaction; count: number; userReacted: boolean }

interface Props {
  reviewId: string
  initialReactions: ReactionCount[]
  isLoggedIn: boolean
}

export default function ReviewReactions({ reviewId, initialReactions, isLoggedIn }: Props) {
  const [reactions, setReactions] = useState<ReactionCount[]>(
    REACTIONS.map(r => initialReactions.find(x => x.reaction === r) ?? { reaction: r, count: 0, userReacted: false })
  )
  const [, startTransition] = useTransition()
  const { t } = useLocale()

  async function toggle(reaction: Reaction) {
    if (!isLoggedIn) return

    const current = reactions.find(r => r.reaction === reaction)!
    const wasReacted = current.userReacted

    // Optimistic update
    setReactions(prev => prev.map(r =>
      r.reaction === reaction
        ? { ...r, count: wasReacted ? r.count - 1 : r.count + 1, userReacted: !wasReacted }
        : r
    ))

    startTransition(async () => {
      try {
        await fetch('/api/review-reactions', {
          method: wasReacted ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review_id: reviewId, reaction }),
        })
      } catch {
        // Revert on error
        setReactions(prev => prev.map(r =>
          r.reaction === reaction ? { ...r, count: current.count, userReacted: current.userReacted } : r
        ))
      }
    })
  }

  const visibleReactions = reactions.filter(r => r.count > 0 || r.userReacted)
  const total = reactions.reduce((s, r) => s + r.count, 0)

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {REACTIONS.map(reaction => {
        const r = reactions.find(x => x.reaction === reaction)!
        const Icon = REACTION_ICONS[reaction]
        return (
          <button
            key={reaction}
            onClick={() => toggle(reaction)}
            disabled={!isLoggedIn}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={r.userReacted
              ? { background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.4)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
            }
            title={isLoggedIn ? undefined : t('review.reactionLoginPrompt')}
          >
            <Icon size={14} />
            {r.count > 0 && (
              <span className="font-semibold" style={{ color: r.userReacted ? 'var(--accent)' : 'rgba(255,255,255,0.5)' }}>
                {r.count}
              </span>
            )}
          </button>
        )
      })}
      {total > 0 && (
        <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {t('review.reactionCount', { n: total })}
        </span>
      )}
    </div>
  )
}
