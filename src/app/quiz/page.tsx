import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import type { Metadata } from "next"
import QuizClient from "./QuizClient"
import { getTranslations } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "Film Quiz — Posteri Gör, Filmi Bul | Sinezon",
  description: "10 soruluk film quizinde posterlerden filmleri tahmin et. Kaç doğru yapabilirsin?",
}

interface TMDbFilm {
  id: number
  title: string
  original_title: string
  poster_path: string
  release_date: string
  vote_average: number
}

const DIFFICULTY_LEVELS = [
  { id: "kolay", icon: "🟢", labelKey: "quiz.difficulty.easy.label", descKey: "quiz.difficulty.easy.desc" },
  { id: "orta",  icon: "🟡", labelKey: "quiz.difficulty.medium.label", descKey: "quiz.difficulty.medium.desc" },
  { id: "zor",   icon: "🔴", labelKey: "quiz.difficulty.hard.label", descKey: "quiz.difficulty.hard.desc" },
]

async function fetchQuizFilms(zorluk: string): Promise<TMDbFilm[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return []

  const headers = { Authorization: `Bearer ${apiKey}`, accept: "application/json" }
  const base = "https://api.themoviedb.org/3"

  let url: string
  if (zorluk === "kolay") {
    const page = Math.floor(Math.random() * 2) + 1
    url = `${base}/movie/popular?language=tr-TR&page=${page}`
  } else if (zorluk === "zor") {
    const page = Math.floor(Math.random() * 5) + 4
    url = `${base}/movie/top_rated?language=tr-TR&page=${page}`
  } else {
    const page = Math.floor(Math.random() * 5) + 3
    url = `${base}/movie/popular?language=tr-TR&page=${page}`
  }

  const res = await fetch(url, { headers, next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).filter((f: TMDbFilm) => f.poster_path && f.title)
}

interface PageProps {
  searchParams: Promise<{ zorluk?: string }>
}

export default async function QuizPage({ searchParams }: PageProps) {
  const { t } = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/giris?next=/quiz")
  }

  const params = await searchParams
  const zorluk = DIFFICULTY_LEVELS.find(d => d.id === params.zorluk)?.id ?? "orta"

  const [films, { data: leaderboard }, { data: streakData }] = await Promise.all([
    fetchQuizFilms(zorluk),
    supabase
      .from("quiz_scores")
      .select("score, correct, total, profiles(username, avatar_url)")
      .order("score", { ascending: false })
      .limit(10),
    supabase
      .from("daily_quiz_streaks")
      .select("streak, best_streak, last_played, total_played")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const playedToday = streakData?.last_played === today

  if (films.length < 10) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4"
        style={{ background: "var(--bg-primary)" }}>
        <div className="text-center" style={{ color: "var(--text-secondary)" }}>
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{t('quiz.loadFailedTitle')}</p>
          <p className="text-sm mt-2">{t('quiz.loadFailedDesc')}</p>
        </div>
      </div>
    )
  }

  const currentLevel = DIFFICULTY_LEVELS.find(d => d.id === zorluk)!

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-2xl font-extrabold text-center mb-1" style={{ color: "var(--text-primary)" }}>
        🎬 {t('quiz.title')}
      </h1>
      <p className="text-sm text-center mb-3" style={{ color: "var(--text-secondary)" }}>
        {t('quiz.subtitle')}
      </p>

      {/* Streak göstergesi */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <span className="text-base">🔥</span>
          <span className="text-sm font-black" style={{ color: '#fbbf24' }}>{streakData?.streak ?? 0}</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('quiz.dailyStreak')}</span>
        </div>
        {(streakData?.best_streak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('quiz.best')}</span>
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('quiz.bestDays', { count: streakData?.best_streak ?? 0 })}</span>
          </div>
        )}
        {playedToday && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
            ✓ {t('quiz.playedToday')}
          </span>
        )}
      </div>

      {/* Zorluk seçici */}
      <div className="flex justify-center gap-2 mb-6">
        {DIFFICULTY_LEVELS.map(d => {
          const isActive = d.id === zorluk
          return (
            <Link key={d.id} href={`/quiz?zorluk=${d.id}`}
              className="flex flex-col items-center px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={isActive
                ? { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 14px rgba(225,29,72,0.25)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
              }>
              <span className="text-base mb-0.5">{d.icon}</span>
              <span className="font-bold">{t(d.labelKey)}</span>
              <span className="text-[10px] opacity-70">{t(d.descKey)}</span>
            </Link>
          )
        })}
      </div>

      <div className="mb-4 text-center">
        <span className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
          {currentLevel.icon} {t(currentLevel.labelKey)} {t('quiz.modeSuffix')}
        </span>
      </div>

      <QuizClient films={films} />

      {leaderboard && leaderboard.length > 0 && (
        <div className="mt-10 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))", border: "1px solid rgba(212,168,67,0.1)" }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span className="text-lg">🏆</span>
            <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{t('quiz.leaderboardTitle')}</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {leaderboard.map((entry: any, i: number) => {
              const profile = entry.profiles
              const medals = ["🥇", "🥈", "🥉"]
              return (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-lg w-6 text-center shrink-0">{medals[i] ?? `${i + 1}`}</span>
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                    style={{ background: "var(--accent)" }}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (profile?.username?.[0] ?? "?").toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {profile?.username ?? t('quiz.anonymous')}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#D4A843" }}>{t('quiz.pointsValue', { score: entry.score })}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{t('quiz.correctOutOf', { correct: entry.correct, total: entry.total })}</p>
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
