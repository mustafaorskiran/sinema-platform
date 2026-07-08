import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import VersusClient from './VersusClient'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'
import { IconSwords } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Film vs Film | Sinezon',
  description: 'İki film arasında tercihini belirt — hangisi daha iyi?',
}

const VERSUS_PAIRS = [
  { filmAId: 550, filmBId: 27205 },
  { filmAId: 238, filmBId: 240 },
  { filmAId: 155, filmBId: 157336 },
  { filmAId: 13, filmBId: 11 },
  { filmAId: 497, filmBId: 77338 },
  { filmAId: 278, filmBId: 372058 },
  { filmAId: 424, filmBId: 98 },
  { filmAId: 680, filmBId: 769 },
]

export default async function VersusPage() {
  const { t } = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sabit çiftleri seed et
  for (const pair of VERSUS_PAIRS) {
    await supabase.from('film_versus').upsert(
      { film_a_id: pair.filmAId, film_b_id: pair.filmBId },
      { onConflict: 'film_a_id,film_b_id', ignoreDuplicates: true }
    )
  }

  // Sabit + kullanıcı oluşturulan tüm çiftler
  const { data: versusRows } = await supabase
    .from('film_versus')
    .select('id, film_a_id, film_b_id, created_by')
    .order('created_at', { ascending: false })
    .limit(50)

  if (!versusRows || versusRows.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <IconSwords size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-white/60">{t('versus.empty')}</p>
      </div>
    )
  }

  const versusIds = versusRows.map(r => r.id)

  const [{ data: votes }, myVotesRes] = await Promise.all([
    supabase.from('film_versus_votes').select('versus_id, voted_for').in('versus_id', versusIds),
    user
      ? supabase.from('film_versus_votes').select('versus_id, voted_for').in('versus_id', versusIds).eq('user_id', user.id)
      : Promise.resolve({ data: [] as { versus_id: string; voted_for: number }[] }),
  ])

  const myVoteMap = new Map((myVotesRes.data ?? []).map(v => [v.versus_id, v.voted_for]))
  const voteCount = (versusId: string, filmId: number) =>
    (votes ?? []).filter(v => v.versus_id === versusId && v.voted_for === filmId).length

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
        isUserCreated: !!row.created_by,
      }
    })
  )

  const presetItems = items.filter(i => !i.isUserCreated)
  const userItems = items.filter(i => i.isUserCreated)

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-white mb-1 flex items-center justify-center gap-2"><IconSwords size={28} /> {t('versus.pageTitle')}</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('versus.pageDesc')}
        </p>
        {!user && (
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {t('versus.voteLoginPrompt')} <a href="/auth/giris" className="underline" style={{ color: '#E11D48' }}>{t('versus.loginLink')}</a>
          </p>
        )}
      </div>

      <VersusClient items={presetItems} userId={user?.id ?? null} />

      {userItems.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <p className="text-xs font-semibold px-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {t('versus.communityComparisons')}
            </p>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <VersusClient items={userItems} userId={user?.id ?? null} />
        </div>
      )}

      {user && (
        <div className="mt-8 text-center">
          <Link href="/versus/yeni"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            + {t('versus.createOwn')}
          </Link>
        </div>
      )}
    </div>
  )
}
