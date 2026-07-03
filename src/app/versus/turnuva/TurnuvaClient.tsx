'use client'
import { useState } from 'react'
import { IconTrophy, IconFilm, IconCheck } from '@/components/icons'

interface Film { id: number; title: string; poster: string | null; rating: number }
interface Vote { match_index: number; round_number: number; film_id: number }

interface Props {
  tournament: { id: string; title: string; film_ids: number[]; current_round: number; ends_at?: string }
  filmDetails: Film[]
  userId: string | null
  userVotes: Vote[]
  allVotes: Vote[]
}

export default function TurnuvaClient({ tournament, filmDetails, userId, userVotes, allVotes }: Props) {
  const [localVotes, setLocalVotes] = useState<Vote[]>(userVotes)
  const [voting, setVoting] = useState<string | null>(null)

  const filmMap = new Map(filmDetails.map(f => [f.id, f]))

  const ids = tournament.film_ids
  const round1Matches = [
    [ids[0], ids[1]],
    [ids[2], ids[3]],
    [ids[4], ids[5]],
    [ids[6], ids[7]],
  ]

  function getVoteCount(matchIndex: number, round: number, filmId: number) {
    return allVotes.filter(v => v.match_index === matchIndex && v.round_number === round && v.film_id === filmId).length
  }

  function getUserVote(matchIndex: number, round: number) {
    return localVotes.find(v => v.match_index === matchIndex && v.round_number === round)?.film_id ?? null
  }

  async function vote(matchIndex: number, round: number, filmId: number) {
    if (!userId) { window.location.href = '/auth/giris'; return }
    const key = `${matchIndex}-${round}`
    if (voting === key) return
    setVoting(key)
    try {
      await fetch('/api/tournament-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: tournament.id, matchIndex, roundNumber: round, filmId }),
      })
      setLocalVotes(prev => {
        const filtered = prev.filter(v => !(v.match_index === matchIndex && v.round_number === round))
        return [...filtered, { match_index: matchIndex, round_number: round, film_id: filmId }]
      })
    } finally {
      setVoting(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Film Turnuvası</p>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2"><IconTrophy size={22} style={{ color: '#D4A843' }} /> {tournament.title}</h1>
        {tournament.ends_at && (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Son oy: {new Date(tournament.ends_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Çeyrek Final
      </h2>

      <div className="space-y-4">
        {round1Matches.map(([filmIdA, filmIdB], i) => {
          const filmA = filmMap.get(filmIdA)
          const filmB = filmMap.get(filmIdB)
          if (!filmA || !filmB) return null
          const userVote = getUserVote(i, 1)
          const votesA = getVoteCount(i, 1, filmIdA)
          const votesB = getVoteCount(i, 1, filmIdB)
          const totalVotes = votesA + votesB

          return (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'linear-gradient(160deg,rgba(20,28,47,0.9),rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Maç {i + 1}
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {[{ film: filmA, filmId: filmIdA }, { film: filmB, filmId: filmIdB }].map(({ film, filmId }, side) => {
                  const votes = side === 0 ? votesA : votesB
                  const isVoted = userVote === filmId
                  return (
                    <button
                      key={side}
                      onClick={() => vote(i, 1, filmId)}
                      disabled={voting === `${i}-1`}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-70 ${isVoted ? 'ring-2 ring-[--accent]' : ''}`}
                      style={{
                        background: isVoted ? 'rgba(225,29,72,0.1)' : 'rgba(255,255,255,0.03)',
                        border: isVoted ? '1px solid rgba(225,29,72,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      }}>
                      {film.poster
                        ? <img src={film.poster} alt={film.title} className="w-16 h-24 object-cover rounded-lg" />
                        : <div className="w-16 h-24 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}><IconFilm size={24} /></div>}
                      <p className="text-xs font-semibold text-white text-center line-clamp-2 leading-snug">{film.title}</p>
                      {totalVotes > 0 && (
                        <p className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {Math.round((votes / totalVotes) * 100)}% ({votes})
                        </p>
                      )}
                      {isVoted && <span className="text-[10px] text-[--accent] font-bold inline-flex items-center gap-1"><IconCheck size={12} /> Oyum</span>}
                    </button>
                  )
                })}

                <div className="text-center order-first col-start-2">
                  <span className="text-lg font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>VS</span>
                </div>
              </div>

              {totalVotes > 0 && (
                <div className="flex mt-4 h-1.5 rounded-full overflow-hidden gap-px">
                  <div style={{ width: `${(votesA / totalVotes) * 100}%`, background: '#E11D48', borderRadius: '4px 0 0 4px' }} />
                  <div style={{ width: `${(votesB / totalVotes) * 100}%`, background: '#60a5fa', borderRadius: '0 4px 4px 0' }} />
                </div>
              )}
              {!userId && (
                <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Oy vermek için <a href="/auth/giris" className="text-[--accent] hover:underline">giriş yap</a>
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="text-center mt-8">
        <a href="/versus" className="text-sm hover:underline" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Karşılaştırmalara Dön
        </a>
      </div>
    </div>
  )
}
