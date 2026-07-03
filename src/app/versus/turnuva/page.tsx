import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import TurnuvaClient from './TurnuvaClient'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconTrophy } from '@/components/icons'

export const metadata: Metadata = { title: 'Film Turnuvası | Sinezon' }

export default async function TurnuvaPage() {
  const { t } = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tournament } = await supabase
    .from('versus_tournaments')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (!tournament) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <IconTrophy size={48} strokeWidth={1.5} className="mb-5 mx-auto text-[--gold]" />
        <h1 className="text-2xl font-bold text-white mb-3">{t('versus.tournamentTitle')}</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('versus.noActiveTournament')}
        </p>
        <a href="/versus"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#E11D48,#be123c)', boxShadow: '0 4px 14px rgba(225,29,72,0.25)' }}>
          ← {t('versus.backToComparisons')}
        </a>
      </div>
    )
  }

  const filmDetails = await Promise.all(
    ((tournament as any).film_ids as number[]).map(async (id: number) => {
      try {
        const d = await getMovieDetail(id)
        return { id, title: getMediaTitle(d), poster: d.poster_path ? getPosterUrl(d.poster_path, 'w342') : null, rating: d.vote_average ?? 0 }
      } catch {
        return { id, title: `Film #${id}`, poster: null, rating: 0 }
      }
    })
  )

  let userVotes: any[] = []
  if (user) {
    const { data: votes } = await supabase
      .from('tournament_votes')
      .select('match_index, round_number, film_id')
      .eq('tournament_id', (tournament as any).id)
      .eq('user_id', user.id)
    userVotes = votes ?? []
  }

  const { data: allVotes } = await supabase
    .from('tournament_votes')
    .select('match_index, round_number, film_id')
    .eq('tournament_id', (tournament as any).id)

  return (
    <TurnuvaClient
      tournament={tournament as any}
      filmDetails={filmDetails}
      userId={user?.id ?? null}
      userVotes={userVotes}
      allVotes={allVotes ?? []}
    />
  )
}
