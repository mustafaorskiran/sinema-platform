import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OneriClient from './OneriClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Film Önerisi | Sinezon',
  description: 'İzleme geçmişine göre yapay zeka destekli film ve dizi önerisi al.',
}

export default async function OneriPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/giris?next=/oneri')

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <span className="text-2xl">🤖</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>AI Film Önerisi</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          İzleme geçmişine göre yapay zeka ile kişisel öneriler al
        </p>
      </div>
      <OneriClient />
    </div>
  )
}
