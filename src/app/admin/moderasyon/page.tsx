import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import BulkModerationPanel from './BulkModerationPanel'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Moderasyon' }

export default async function AdminModerasyonPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [{ data: flagged }, { data: hidden }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*, profiles(username)')
      .eq('flagged_spam', true)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('reviews')
      .select('*, profiles(username)')
      .eq('is_hidden', true)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Moderasyon</h1>
      <BulkModerationPanel flagged={(flagged ?? []) as any} hidden={(hidden ?? []) as any} />
    </div>
  )
}
