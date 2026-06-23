import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrtakIzlenenlerClient from './OrtakIzlenenlerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ortak İzlenenler' }

export default async function OrtakIzlenenlerPage({
  searchParams,
}: {
  searchParams: Promise<{ kullanici?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  const { kullanici } = await searchParams

  const { data: myProfile } = await supabase.from('profiles').select('id, username, avatar_url').eq('id', user.id).single()
  const { data: following } = await supabase
    .from('follows')
    .select('profiles!following_id(id, username, avatar_url)')
    .eq('follower_id', user.id)
    .limit(50)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Ortak İzlenenler</h1>
      <p className="text-[--text-secondary] text-sm mb-8">Takip ettiğin biriyle hangi filmleri ortak izlediğini gör.</p>
      <OrtakIzlenenlerClient
        myProfile={myProfile!}
        following={(following ?? []).map((f: any) => f.profiles).filter(Boolean)}
        defaultUser={kullanici}
      />
    </div>
  )
}
