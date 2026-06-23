import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMovieDetail, getSeriesDetail, getPosterUrl, getMediaTitle } from '@/lib/tmdb'
import ListeDuzenleClient from './ListeDuzenleClient'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('lists').select('title').eq('id', id).single()
  return { title: `Düzenle — ${data?.title ?? 'Liste'}` }
}

export default async function ListeDuzenle({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { data: list } = await supabase.from('lists').select('*').eq('id', id).eq('user_id', user.id).single()
  if (!list) notFound()

  const { data: items } = await supabase.from('list_items').select('*').eq('list_id', id).order('position', { ascending: true })

  const itemsWithMedia = await Promise.all(
    (items ?? []).map(async (item) => {
      try {
        const media = item.media_type === 'film'
          ? await getMovieDetail(item.media_id)
          : await getSeriesDetail(item.media_id)
        return {
          ...item,
          title: getMediaTitle(media),
          poster: getPosterUrl(media.poster_path, 'w342'),
        }
      } catch {
        return { ...item, title: `#${item.media_id}`, poster: null }
      }
    })
  )

  return <ListeDuzenleClient list={{ ...list, cover_url: list.cover_url ?? null }} items={itemsWithMedia} />
}
