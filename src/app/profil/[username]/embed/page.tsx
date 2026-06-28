import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmbedPage from './EmbedPage'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `@${username} — Widget | Sinezon` }
}

export default async function ProfileEmbedPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('username').eq('username', username).single()

  if (!profile) notFound()
  if (!user) redirect(`/auth/giris?next=/profil/${username}/embed`)

  const { data: me } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  const isOwn = me?.username === username

  return <EmbedPage username={username} isOwn={isOwn} />
}
