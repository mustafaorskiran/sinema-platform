'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Film {
  id: number
  title: string
  original_title: string
  poster_path: string
  release_date: string
  vote_average: number
}

interface Props {
  films: Film[]
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildChoices(films: Film[], correct: Film): string[] {
  const others = films.filter(f => f.id !== correct.id)
  const wrong = shuffleArray(others).slice(0, 3).map(f => f.title)
  return shuffleArray([correct.title, ...wrong])
}

const TOTAL_QUESTIONS = 10
const COUNTDOWN_SECONDS = 3

export default function QuizClient({ films }: Props) {
  const [questions] = useState<Film[]>(() => shuffleArray(films).slice(0, TOTAL_QUESTIONS))
  const [current, setCurrent] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)

  const currentFilm = questions[current]

  // Build choices whenever question changes
  useEffect(() => {
    if (!currentFilm) return
    setChoices(buildChoices(films, currentFilm))
    setSelected(null)
    setRevealed(false)
    setCountdown(COUNTDOWN_SECONDS)
  }, [current, currentFilm, films])

  // Countdown timer — blur reveals after countdown
  useEffect(() => {
    if (revealed) return
    if (countdown <= 0) {
      setRevealed(true)
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, revealed])

  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return
    setSelected(choice)
    setRevealed(true)
    if (choice === currentFilm.title) {
      setScore(s => s + 10)
    }
  }, [selected, currentFilm])

  async function nextQuestion() {
    if (current + 1 >= TOTAL_QUESTIONS) {
      setFinished(true)
      // Skoru kaydet (score state handleAnswer ile zaten güncellenmiş)
      try {
        await fetch('/api/quiz/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, correct: Math.round(score / 10), total: TOTAL_QUESTIONS }),
        })
        setScoreSaved(true)
      } catch {}
    } else {
      setCurrent(c => c + 1)
    }
  }

  function restart() {
    window.location.reload()
  }

  if (finished) {
    const pct = Math.round((score / (TOTAL_QUESTIONS * 10)) * 100)
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
        >
          <div className="text-6xl mb-4">
            {pct >= 80 ? '🏆' : pct >= 50 ? '🎬' : '🎭'}
          </div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
            Quiz Bitti!
          </h2>
          <p className="text-5xl font-black my-4" style={{ color: 'var(--accent)' }}>
            {score / 10}/{TOTAL_QUESTIONS}
          </p>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            doğru cevap · {score} puan
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            {pct >= 80
              ? 'Harika! Gerçek bir sinema tutkunu!'
              : pct >= 50
              ? 'Fena değil, biraz daha pratik yapabilirsin.'
              : 'Daha fazla film izleme vakti!'}
          </p>
          <button
            onClick={restart}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'var(--accent)', color: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
          >
            Yeniden Oyna
          </button>
        </div>
      </div>
    )
  }

  if (!currentFilm) return null

  const posterUrl = currentFilm.poster_path
    ? `https://image.tmdb.org/t/p/w342${currentFilm.poster_path}`
    : null

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Progress */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Soru {current + 1} / {TOTAL_QUESTIONS}
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            {score} puan
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((current) / TOTAL_QUESTIONS) * 100}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
      >
        {/* Poster */}
        <div className="relative flex justify-center py-6" style={{ background: 'var(--bg-secondary)' }}>
          {posterUrl ? (
            <div className="relative" style={{ filter: revealed ? 'none' : 'blur(18px)', transition: 'filter 0.4s ease' }}>
              <Image
                src={posterUrl}
                alt="?"
                width={160}
                height={240}
                className="rounded-xl object-cover shadow-2xl"
                style={{ height: 240, width: 160 }}
                unoptimized
              />
            </div>
          ) : (
            <div
              className="rounded-xl flex items-center justify-center text-3xl"
              style={{ width: 160, height: 240, background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              🎬
            </div>
          )}

          {/* Countdown badge */}
          {!revealed && (
            <div
              className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center text-lg font-extrabold shadow-lg"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {countdown}
            </div>
          )}
        </div>

        {/* Title hint when revealed */}
        <div className="px-5 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
            {revealed ? 'Bu filmin adı ne?' : 'Geri sayım başladı — hazır mısın?'}
          </p>
        </div>

        {/* Choices */}
        <div className="px-5 pb-6 grid grid-cols-1 gap-2">
          {choices.map(choice => {
            const isCorrect = choice === currentFilm.title
            const isSelected = choice === selected

            let borderColor = 'var(--border)'
            let bg = 'var(--bg-secondary)'
            let textColor = 'var(--text-primary)'

            if (selected !== null) {
              if (isCorrect) {
                borderColor = '#22c55e'
                bg = 'rgba(34,197,94,0.12)'
                textColor = '#22c55e'
              } else if (isSelected) {
                borderColor = '#ef4444'
                bg = 'rgba(239,68,68,0.12)'
                textColor = '#ef4444'
              } else {
                textColor = 'var(--text-secondary)'
              }
            }

            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                disabled={selected !== null || !revealed}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  cursor: selected !== null || !revealed ? 'default' : 'pointer',
                  opacity: !revealed && selected === null ? 0.5 : 1,
                }}
              >
                <span className="flex items-center gap-2">
                  {selected !== null && isCorrect && <span>✓</span>}
                  {selected !== null && isSelected && !isCorrect && <span>✗</span>}
                  {choice}
                </span>
              </button>
            )
          })}
        </div>

        {/* Next button */}
        {selected !== null && (
          <div className="px-5 pb-6">
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
            >
              {current + 1 >= TOTAL_QUESTIONS ? 'Sonucu Gör' : 'Sonraki Soru →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
