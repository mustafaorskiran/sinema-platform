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

  const films = await fetchQuizFilms()

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
    <>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl font-extrabold text-center" style={{ color: 'var(--text-primary)' }}>
          🎬 Film Quiz
        </h1>
        <p className="text-sm text-center mt-1" style={{ color: 'var(--text-secondary)' }}>
          Posteri gör, filmi bul — 10 soruluk tur
        </p>
      </div>
      <QuizClient films={films} />
    </>
  )
}
