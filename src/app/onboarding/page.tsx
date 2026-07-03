import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { discoverMovies, discoverSeries, getPosterUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb'
import OnboardingClient from './OnboardingClient'
import { getTranslations } from '@/lib/i18n'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return {
    title: t('onboarding.metaTitle'),
    robots: { index: false },
  }
}

export interface RatingItem {
  id: number
  title: string
  poster: string | null
  year: string
  type: 'film' | 'dizi'
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/giris?next=/onboarding')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.onboarding_completed) redirect('/')

  // Popüler içerikler — kullanıcı bunları puanlayacak
  const [popularMovies, topMovies, popularSeries] = await Promise.all([
    discoverMovies({ sortBy: 'popularity.desc' }).catch(() => ({ results: [] })),
    discoverMovies({ sortBy: 'vote_average.desc', minRating: '8' }).catch(() => ({ results: [] })),
    discoverSeries({ sortBy: 'popularity.desc', minRating: '7' }).catch(() => ({ results: [] })),
  ])

  const seenIds = new Set<number>()
  const ratingItems: RatingItem[] = []

  for (const m of [...popularMovies.results.slice(0, 16), ...topMovies.results.slice(0, 6)]) {
    if (!seenIds.has(m.id) && ratingItems.filter(x => x.type === 'film').length < 20) {
      seenIds.add(m.id)
      ratingItems.push({ id: m.id, title: getMediaTitle(m), poster: getPosterUrl(m.poster_path, 'w342'), year: getMediaYear(m), type: 'film' })
    }
  }

  for (const s of popularSeries.results.slice(0, 12)) {
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id)
      ratingItems.push({ id: s.id, title: getMediaTitle(s), poster: getPosterUrl(s.poster_path, 'w342'), year: getMediaYear(s), type: 'dizi' })
    }
  }

  return <OnboardingClient ratingItems={ratingItems} />
}
