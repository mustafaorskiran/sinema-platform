import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import TriviaAdmin from './TriviaAdmin'

export const metadata = { title: 'Trivia Onay | Admin' }

export default async function AdminTriviaPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: pending } = await supabase
    .from('trivia')
    .select('*, profiles(username)')
    .eq('approved', false)
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Trivia & Goofs Onayı</h1>
      <p className="text-sm text-[--text-secondary] mb-8">{pending?.length ?? 0} bekleyen içerik</p>
      <TriviaAdmin items={pending ?? []} />
    </div>
  )
}
