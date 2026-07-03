'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { IconFilm, IconCheck } from '@/components/icons'

interface VersusItem {
  id: string
  filmAId: number
  filmBId: number
  filmATitle: string
  filmBTitle: string
  filmAPoster: string | null
  filmBPoster: string | null
  votesA: number
  votesB: number
  myVote: number | null
}

interface Props {
  items: VersusItem[]
  userId: string | null
}

export default function VersusClient({ items: initialItems, userId }: Props) {
  const [items, setItems] = useState(initialItems)
  const [voting, setVoting] = useState<string | null>(null)

  async function vote(versusId: string, filmId: number, currentMyVote: number | null, filmAId: number, filmBId: number) {
    if (!userId) return
    setVoting(versusId)
    const supabase = createClient()

    await supabase.from('film_versus_votes').upsert(
      { versus_id: versusId, user_id: userId, voted_for: filmId },
      { onConflict: 'versus_id,user_id' }
    )

    setItems(prev => prev.map(item => {
      if (item.id !== versusId) return item
      const wasA = currentMyVote === filmAId
      const wasB = currentMyVote === filmBId
      const nowA = filmId === filmAId
      return {
        ...item,
        myVote: filmId,
        votesA: item.votesA + (nowA ? 1 : wasA ? -1 : 0),
        votesB: item.votesB + (!nowA ? 1 : wasB ? -1 : 0),
      }
    }))
    setVoting(null)
  }

  return (
    <div className="space-y-6">
      {items.map(item => {
        const totalVotes = item.votesA + item.votesB
        const pctA = totalVotes > 0 ? Math.round((item.votesA / totalVotes) * 100) : 50
        const pctB = 100 - pctA
        const isVoting = voting === item.id

        return (
          <div key={item.id} className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
            <div className="grid grid-cols-[1fr_auto_1fr]">
              {/* Film A */}
              <button
                onClick={() => !isVoting && userId && vote(item.id, item.filmAId, item.myVote, item.filmAId, item.filmBId)}
                disabled={!userId || isVoting}
                className={`flex flex-col items-center gap-2 p-3 sm:p-5 transition-all active:scale-95 group ${item.myVote === item.filmAId ? 'ring-2 ring-[#E11D48]/50' : 'hover:bg-white/3'}`}
                style={{ borderRadius: '16px 0 0 16px' }}>
                <div className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)', border: item.myVote === item.filmAId ? '2px solid #E11D48' : '2px solid transparent' }}>
                  {item.filmAPoster
                    ? <img src={item.filmAPoster} alt={item.filmATitle} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><IconFilm size={24} /></div>
                  }
                  {item.myVote === item.filmAId && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(225,29,72,0.3)' }}>
                      <IconCheck size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-white text-center line-clamp-2 max-w-[120px]">{item.filmATitle}</p>
                {totalVotes > 0 && (
                  <span className="text-sm font-black" style={{ color: pctA >= pctB ? '#E11D48' : 'rgba(255,255,255,0.4)' }}>
                    {pctA}%
                  </span>
                )}
              </button>

              {/* VS */}
              <div className="flex flex-col items-center justify-center px-2 gap-2">
                <span className="text-lg font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>VS</span>
                {totalVotes > 0 && (
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{totalVotes} oy</span>
                )}
                {!userId && (
                  <Link href="/auth/giris" className="text-[10px] text-center hover:underline"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Oy ver
                  </Link>
                )}
              </div>

              {/* Film B */}
              <button
                onClick={() => !isVoting && userId && vote(item.id, item.filmBId, item.myVote, item.filmAId, item.filmBId)}
                disabled={!userId || isVoting}
                className={`flex flex-col items-center gap-2 p-3 sm:p-5 transition-all active:scale-95 group ${item.myVote === item.filmBId ? 'ring-2 ring-[#E11D48]/50' : 'hover:bg-white/3'}`}
                style={{ borderRadius: '0 16px 16px 0' }}>
                <div className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)', border: item.myVote === item.filmBId ? '2px solid #E11D48' : '2px solid transparent' }}>
                  {item.filmBPoster
                    ? <img src={item.filmBPoster} alt={item.filmBTitle} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><IconFilm size={24} /></div>
                  }
                  {item.myVote === item.filmBId && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(225,29,72,0.3)' }}>
                      <IconCheck size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-white text-center line-clamp-2 max-w-[120px]">{item.filmBTitle}</p>
                {totalVotes > 0 && (
                  <span className="text-sm font-black" style={{ color: pctB > pctA ? '#E11D48' : 'rgba(255,255,255,0.4)' }}>
                    {pctB}%
                  </span>
                )}
              </button>
            </div>

            {/* Oy barı */}
            {totalVotes > 0 && (
              <div className="h-1 flex">
                <div className="h-full transition-all duration-500" style={{ width: `${pctA}%`, background: '#E11D48' }} />
                <div className="h-full flex-1" style={{ background: '#be123c' }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
