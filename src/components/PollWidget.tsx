'use client'

import { useState } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { IconBarChart, IconCheck } from '@/components/icons'

interface Poll {
  id: string
  question: string
  options: string[]
  poll_votes: { option_idx: number; user_id?: string }[]
  profiles: { username: string; avatar_url: string | null }
  created_at: string
  ends_at?: string | null
}

interface Props {
  poll: Poll
  currentUserId?: string
}

export default function PollWidget({ poll, currentUserId }: Props) {
  const { t } = useLocale()
  const totalVotes = poll.poll_votes.length
  const userVote = currentUserId
    ? poll.poll_votes.find(v => v.user_id === currentUserId)?.option_idx ?? null
    : null
  const [myVote, setMyVote] = useState<number | null>(userVote)
  const [votes, setVotes] = useState(poll.poll_votes)
  const [loading, setLoading] = useState(false)

  const isExpired = poll.ends_at ? new Date(poll.ends_at) < new Date() : false
  const canVote = !!currentUserId && !isExpired

  async function vote(idx: number) {
    if (!canVote || loading) return
    const isUnvote = myVote === idx
    setLoading(true)

    if (isUnvote) {
      setMyVote(null)
      setVotes(v => v.filter(v => v.user_id !== currentUserId))
      await fetch('/api/poll/vote', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_id: poll.id }),
      })
    } else {
      const prev = myVote
      setMyVote(idx)
      setVotes(v => [...v.filter(v => v.user_id !== currentUserId), { option_idx: idx, user_id: currentUserId }])
      const res = await fetch('/api/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_id: poll.id, option_idx: idx }),
      })
      if (!res.ok) {
        setMyVote(prev)
        setVotes(v => v.filter(v => v.user_id !== currentUserId))
      }
    }
    setLoading(false)
  }

  const currentTotal = votes.length

  return (
    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2 mb-4">
        <IconBarChart size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('community.pollLabel')}</p>
        {isExpired && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{t('community.pollEnded')}</span>}
      </div>

      <p className="text-sm font-semibold text-white mb-4 leading-snug">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((opt, i) => {
          const count = votes.filter(v => v.option_idx === i).length
          const pct = currentTotal > 0 ? Math.round((count / currentTotal) * 100) : 0
          const isSelected = myVote === i
          const showResults = myVote !== null || isExpired

          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={!canVote || loading}
              className="w-full text-left relative rounded-xl overflow-hidden transition-all"
              style={{
                border: isSelected ? '1px solid rgba(225,29,72,0.4)' : '1px solid rgba(255,255,255,0.07)',
                background: isSelected ? 'rgba(225,29,72,0.06)' : 'rgba(255,255,255,0.025)',
              }}
            >
              {showResults && (
                <div
                  className="absolute inset-y-0 left-0 rounded-xl transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: isSelected ? 'rgba(225,29,72,0.12)' : 'rgba(255,255,255,0.04)',
                  }}
                />
              )}
              <div className="relative flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={isSelected
                      ? { background: 'var(--accent)', border: '1.5px solid var(--accent)' }
                      : { border: '1.5px solid rgba(255,255,255,0.2)' }
                    }>
                    {isSelected && <IconCheck size={8} className="text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)' }}>{opt}</span>
                </div>
                {showResults && (
                  <span className="text-xs font-bold shrink-0 ml-2" style={{ color: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }}>
                    %{pct}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {t('community.voteCount', { count: currentTotal })}
        {poll.ends_at && !isExpired && (
          <> · {t('community.endsOn', { date: new Date(poll.ends_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) })}</>
        )}
      </p>
    </div>
  )
}
