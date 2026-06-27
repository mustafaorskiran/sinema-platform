import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import VersusClient from './VersusClient'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Film vs Film | Sinezon',
  description: 'İki film arasında tercihini belirt — hangisi daha iyi?',
}

// Sabit karşılaştırmalar — popüler film çiftleri
const VERSUS_PAIRS = [
  { filmAId: 550, filmBId: 27205 },   // Fight Club vs Inception
  { filmAId: 238, filmBId: 240 },     // Godfather vs Godfather II
  { filmAId: 155, filmBId: 157336 },  // Dark Knight vs Interstellar
  { filmAId: 13, filmBId: 11 },       // Forrest Gump vs Star Wars
  { filmAId: 497, filmBId: 77338 },   // The Green Mile vs The Intouchables
  { filmAId: 278, filmBId: 372058 },  // Shawshank vs Your Name
  { filmAId: 424, filmBId: 98 },      // Schindler's List vs Gladiator
  { filmAId: 680, filmBId: 769 },     // Pulp Fiction vs GoodFellas
]

export default async function VersusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Veritabanında versus kayıtları oluştur / al
  for (const pair of VERSUS_PAIRS) {
    await supabase.from('film_versus').upsert(
      { film_a_id: pair.filmAId, film_b_id: pair.filmBId },
      { onConflict: 'film_a_id,film_b_id', ignoreDuplicates: true }
    )
  }

  const { data: versusRows } = await supabase
    .from('film_versus')
    .select('id, film_a_id, film_b_id')
    .in('film_a_id', VERSUS_PAIRS.map(p => p.filmAId))
    .limit(VERSUS_PAIRS.length)

  if (!versusRows || versusRows.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-white">Yükleniyor...</p>
      </div>
    )
  }

  // Oy sayıları
  const versusIds = versusRows.map(r => r.id)
  const { data: votes } = await supabase
    .from('film_versus_votes')
    .select('versus_id, voted_for')
    .in('versus_id', versusIds)

  // Kendi oylarım
  const { data: myVotes } = user
    ? await supabase.from('film_versus_votes').select('versus_id, voted_for').in('versus_id', versusIds).eq('user_id', user.id)
    : { data: [] }

  const myVoteMap = new Map((myVotes ?? []).map(v => [v.versus_id, v.voted_for]))

  const voteCount = (versusId: string, filmId: number) =>
    (votes ?? []).filter(v => v.versus_id === versusId && v.voted_for === filmId).length

  // TMDB verileri
  const items = await Promise.all(
    versusRows.map(async row => {
      const [movieA, movieB] = await Promise.all([
        getMovieDetail(row.film_a_id).catch(() => null),
        getMovieDetail(row.film_b_id).catch(() => null),
      ])
      return {
        id: row.id,
        filmAId: row.film_a_id,
        filmBId: row.film_b_id,
        filmATitle: movieA ? getMediaTitle(movieA) : `Film #${row.film_a_id}`,
        filmBTitle: movieB ? getMediaTitle(movieB) : `Film #${row.film_b_id}`,
        filmAPoster: movieA?.poster_path ? getPosterUrl(movieA.poster_path, 'w342') : null,
        filmBPoster: movieB?.poster_path ? getPosterUrl(movieB.poster_path, 'w342') : null,
        votesA: voteCount(row.id, row.film_a_id),
        votesB: voteCount(row.id, row.film_b_id),
        myVote: myVoteMap.get(row.id) ?? null,
      }
    })
  )

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-white mb-1">⚔️ Film vs Film</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          İkisi arasında tercihini yap — topluluk ne diyor?
        </p>
        {!user && (
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Oy vermek için <a href="/auth/giris" className="underline" style={{ color: '#E11D48' }}>giriş yap</a>
          </p>
        )}
      </div>

      <VersusClient items={items} userId={user?.id ?? null} />

      {user && (
        <div className="mt-8 text-center">
          <Link href="/versus/yeni"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            + Kendi karşılaştırmanı oluştur
          </Link>
        </div>
      )}
    </div>
  )
}
