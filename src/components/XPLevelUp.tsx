'use client'

import { useEffect, useState } from 'react'

interface Props {
  level: number
  xp: number
}

function Confetti() {
  const colors = ['#E11D48', '#D4A843', '#a78bfa', '#4ade80', '#38bdf8', '#fb923c']
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 0.8 + Math.random() * 0.6,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const XP_PER_LEVEL = 50

export default function XPLevelUp({ level, xp }: Props) {
  const [prevLevel, setPrevLevel] = useState(level)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (level > prevLevel) {
      setShowCelebration(true)
      setPrevLevel(level)
      setTimeout(() => setShowCelebration(false), 4000)
    }
  }, [level, prevLevel])

  const nextLevelXP = level * level * XP_PER_LEVEL
  const prevLevelXP = (level - 1) * (level - 1) * XP_PER_LEVEL
  const progress = Math.min(100, ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100)

  return (
    <>
      {showCelebration && (
        <>
          <Confetti />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] text-center pointer-events-none"
            style={{ animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}>
            <div className="text-6xl mb-2">🎉</div>
            <p className="text-2xl font-black text-white">Seviye {level}!</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Tebrikler!</p>
            <style>{`
              @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        </>
      )}

      {/* XP Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), #f97316)' }}>
          {level}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-white">Seviye {level}</span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{xp} / {nextLevelXP} XP</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), #f97316)' }} />
          </div>
        </div>
      </div>
    </>
  )
}
