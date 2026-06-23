import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/giris')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile?.username) redirect(`/profil/${profile.username}`)

  redirect('/auth/giris')
}
