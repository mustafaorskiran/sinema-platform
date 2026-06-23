import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import YeniPartiForm from './YeniPartiForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Etkinlik Oluştur | SineMa' }

export default async function YeniFilmGecesiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris')

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">🎬 Film Gecesi Planla</h1>
      <div className="bg-[--bg-card] border border-[--border] rounded-2xl p-8">
        <YeniPartiForm />
      </div>
    </div>
  )
}
