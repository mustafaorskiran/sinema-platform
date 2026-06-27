import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import ResolveButton from './ResolveButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Raporlar' }

const TYPE_STYLE: Record<string, string> = {
  review:  'bg-blue-500/20 text-blue-400',
  list:    'bg-purple-500/20 text-purple-400',
  profile: 'bg-orange-500/20 text-orange-400',
}

const TYPE_LABEL: Record<string, string> = {
  review:  'Yorum',
  list:    'Liste',
  profile: 'Profil',
}

const REASON_LABEL: Record<string, string> = {
  spam:          'Spam',
  harassment:    'Taciz',
  inappropriate: 'Uygunsuz',
  spoiler:       'Spoiler',
  misinformation:'Yanlış bilgi',
  other:         'Diğer',
}

function targetLink(type: string, id: string) {
  if (type === 'list')    return `/listeler/${id}`
  if (type === 'profile') return `/profil/${id}`
  return null
}

export default async function AdminRaporlarPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('reports')
    .select('*, profiles!reporter_id(username)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(100)

  // Group by target to show repeat reports as higher priority
  const countMap: Record<string, number> = {}
  for (const r of reports ?? []) {
    const key = `${r.target_type}:${r.target_id}`
    countMap[key] = (countMap[key] ?? 0) + 1
  }

  // Deduplicate by target, keep most recent, sort by report count desc
  const seen = new Set<string>()
  const deduped = (reports ?? []).filter((r: any) => {
    const key = `${r.target_type}:${r.target_id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a: any, b: any) => {
    const ca = countMap[`${a.target_type}:${a.target_id}`]
    const cb = countMap[`${b.target_type}:${b.target_id}`]
    return cb - ca
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Raporlar</h1>
        <span className="text-sm text-[--text-secondary]">{(reports ?? []).length} rapor, {deduped.length} benzersiz hedef</span>
      </div>

      {deduped.length === 0 ? (
        <p className="text-[--text-secondary] rounded-xl p-8 text-center"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>Bekleyen rapor yok.</p>
      ) : (
        <div className="space-y-3">
          {deduped.map((r: any) => {
            const count = countMap[`${r.target_type}:${r.target_id}`]
            const link = targetLink(r.target_type, r.target_id)
            return (
              <div key={r.id} className="rounded-xl p-5 transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${TYPE_STYLE[r.target_type] ?? 'bg-zinc-500/20 text-zinc-400'}`}>
                        {TYPE_LABEL[r.target_type] ?? r.target_type}
                      </span>
                      <span className="text-xs font-semibold text-red-400">
                        {REASON_LABEL[r.reason] ?? r.reason}
                      </span>
                      {count > 1 && (
                        <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          {count}× rapor edildi
                        </span>
                      )}
                    </div>

                    {r.details && (
                      <p className="text-xs text-[--text-secondary] mb-2 italic">"{r.details}"</p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-[10px] text-[--text-secondary] font-mono">
                        ID: {r.target_id}
                      </p>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[--accent] hover:underline"
                        >
                          Görüntüle →
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-[--text-secondary] mt-1">
                      Son rapor: @{r.profiles?.username} • {new Date(r.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <ResolveButton id={r.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
