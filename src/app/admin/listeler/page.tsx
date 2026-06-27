import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import EditorialListManager from './EditorialListManager'
import FeaturedListManager from './FeaturedListManager'

export const metadata = { title: 'Listeler | Admin' }

export default async function AdminListelerPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [{ data: editorialLists }, { data: topLists }] = await Promise.all([
    supabase
      .from('lists')
      .select('*, list_items(count)')
      .eq('is_editorial', true)
      .order('created_at', { ascending: true }),

    // Top community lists by likes — candidates for featuring
    supabase
      .from('lists')
      .select('*, profiles(username), list_items(count), list_likes(count)')
      .eq('is_editorial', false)
      .eq('public', true)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  // Sort by likes desc
  const sortedTopLists = (topLists ?? []).sort(
    (a: any, b: any) => (b.list_likes?.[0]?.count ?? 0) - (a.list_likes?.[0]?.count ?? 0)
  )

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-1">Listeler</h1>
        <p className="text-sm text-[--text-secondary]">Editöryal seçkiler ve haftanın listelerini yönet</p>
      </div>

      {/* Haftanın Listeleri */}
      <div className="mb-12 rounded-2xl p-6"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <FeaturedListManager lists={sortedTopLists} />
      </div>

      {/* Editöryal Listeler */}
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">✦ Editöryal Listeler</h2>
          <p className="text-xs text-[--text-secondary] mt-0.5">Sinezon ekibi tarafından hazırlanan özel seçkiler</p>
        </div>
        <EditorialListManager lists={editorialLists ?? []} />
      </div>
    </div>
  )
}
