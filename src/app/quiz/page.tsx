import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import QuizClient from './QuizClient'

export const metadata: Metadata = {
  title: 'Film Quiz — Posteri Gör, Filmi Bul | Sinezon',
  description: '10 soruluk film quizinde posterlerden filmleri tahmin et. Kaç doğru yapabilirsin?',
}

interface TMDbFilm {
  id: number
  title: string
  original_title: string
  poster_path: string
  release_date: string
  vote_average: number
}

async function fetchQuizFilms(): Promise<TMDbFilm[]> {
  const page = Math.floor(Math.random() * 5) + 1
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return []

  const url = `https://api.themoviedb.org/3/movie/popular?language=tr-TR&page=${page}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).filter((f: TMDbFilm) => f.poster_path && f.title)
}

export default async function QuizPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/giris?next=/quiz')
  }

  const [films, { data: leaderboard }] = await Promise.all([
    fetchQuizFilms(),
    supabase
      .from('quiz_scores')
      .select('score, correct, total, profiles(username, avatar_url)')
      .order('score', { ascending: false })
      .limit(10),
  ])

  if (films.length < 10) {
    return (
      <div
        className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Quiz yüklenemedi</p>
          <p className="text-sm mt-2">Lütfen daha sonra tekrar dene.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-2xl font-extrabold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
        🎬 Film Quiz
      </h1>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
        Posteri gör, filmi bul — 10 soruluk tur
      </p>
      <QuizClient films={films} />

      {leaderboard && leaderboard.length > 0 && (
        <div className="mt-10 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(212,168,67,0.1)' }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-lg">🏆</span>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Liderlik Tablosu</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {leaderboard.map((entry: any, i) => {
              const profile = entry.profiles
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-lg w-6 text-center shrink-0">{medals[i] ?? `${i + 1}`}</span>
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                    style={{ background: 'var(--accent)' }}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (profile?.username?.[0] ?? '?').toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {profile?.username ?? 'Anonim'}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#D4A843' }}>{entry.score} puan</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{entry.correct}/{entry.total} doğru</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
