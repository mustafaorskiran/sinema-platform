import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import PushForm from './PushForm'
import { IconBell } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Push Bildirimleri' }

export default async function AdminPushPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { count } = await supabase
    .from('push_subscriptions')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.25)' }}>
          <IconBell className="h-5 w-5 text-[--accent]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Push Bildirimleri</h1>
          <p className="text-sm text-[--text-secondary]">
            {count ?? 0} aktif abonelik
          </p>
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-semibold text-white mb-1">Bildirim Gönder</p>
        <p className="text-xs text-[--text-secondary] mb-5">Kullanıcı ID boş bırakılırsa tüm abonelere gönderilir.</p>
        <PushForm />
      </div>
    </div>
  )
}
