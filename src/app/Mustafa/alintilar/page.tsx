import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import ApproveQuoteButton from './ApproveQuoteButton'
import { IconFilm, IconTv } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Alıntılar' }

export default async function AdminAlıntilarPage() {
  await requireAdmin()
  const supabase = await createClient()
  const { t } = await getTranslations()

  const { data: pending } = await supabase
    .from('quotes')
    .select('id, content, character_name, media_id, media_type, profiles(username), created_at')
    .eq('approved', false)
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t('admin.quotes.title')}</h1>
      {(!pending || pending.length === 0) ? (
        <p className="text-[--text-secondary] rounded-xl p-8 text-center"
          style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>{t('admin.quotes.empty')}</p>
      ) : (
        <div className="space-y-3">
          {pending.map((q: any) => (
            <div key={q.id} className="rounded-xl p-5 transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-white italic">"{q.content}"</p>
                  {q.character_name && <p className="text-xs text-[--accent] mt-1">— {q.character_name}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-[--text-secondary]">
                    <span className="inline-flex items-center gap-1">{q.media_type === 'film' ? <IconFilm size={12} /> : <IconTv size={12} />} #{q.media_id}</span>
                    <span>@{q.profiles?.username}</span>
                  </div>
                </div>
                <ApproveQuoteButton id={q.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
