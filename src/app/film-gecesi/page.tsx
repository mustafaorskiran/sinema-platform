import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { IconCalendarDays, IconPlus, IconUsers } from '@/components/icons'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Film Gecesi | SineMa' }

export default async function FilmGecesiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: parties } = await supabase
    .from('watch_parties')
    .select('*, profiles(username, avatar_url), watch_party_members(count), watch_party_items(count)')
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(30)

  // Kullanıcının katıldıkları
  let joinedIds = new Set<string>()
  if (user) {
    const { data: joined } = await supabase
      .from('watch_party_members')
      .select('party_id')
      .eq('user_id', user.id)
      .in('party_id', (parties ?? []).map(p => p.id))
    joinedIds = new Set((joined ?? []).map(j => j.party_id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <IconCalendarDays className="h-7 w-7 text-[--accent]" />
            <h1 className="text-2xl font-bold text-white">Film Gecesi</h1>
          </div>
          <p className="text-sm text-[--text-secondary] ml-10">Arkadaşlarınla izleme etkinliği planla</p>
        </div>
        {user && (
          <Link href="/film-gecesi/yeni"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold transition-colors">
            <IconPlus className="h-4 w-4" /> Etkinlik Oluştur
          </Link>
        )}
      </div>

      {(!parties || parties.length === 0) ? (
        <div className="text-center py-24 rounded-2xl bg-[--bg-card] border border-[--border]">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-lg font-medium text-white mb-2">Henüz etkinlik yok</p>
          <p className="text-sm text-[--text-secondary] mb-6">Film gecesi oluştur, arkadaşlarını davet et!</p>
          {user && (
            <Link href="/film-gecesi/yeni" className="inline-block bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
              İlk Etkinliği Oluştur
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {(parties as any[]).map(party => {
            const memberCount = party.watch_party_members?.[0]?.count ?? 0
            const itemCount = party.watch_party_items?.[0]?.count ?? 0
            const isJoined = joinedIds.has(party.id)
            const date = party.scheduled_at ? new Date(party.scheduled_at) : null

            return (
              <div key={party.id} className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: isJoined
                    ? 'linear-gradient(160deg, rgba(20,40,30,0.9), rgba(14,20,32,0.95))'
                    : 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
                  border: `1px solid ${isJoined ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/film-gecesi/${party.id}`}>
                      <h2 className="text-base font-bold text-white hover:text-[--accent] transition-colors">{party.title}</h2>
                    </Link>
                    {party.description && (
                      <p className="text-sm text-[--text-secondary] mt-1 line-clamp-2">{party.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[--text-secondary]">
                      <Link href={`/profil/${party.profiles?.username}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <div className="h-5 w-5 rounded-full bg-[--accent] overflow-hidden flex items-center justify-center text-[10px] font-bold text-white">
                          {party.profiles?.avatar_url
                            ? <img src={party.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                            : party.profiles?.username?.[0]?.toUpperCase()
                          }
                        </div>
                        {party.profiles?.username}
                      </Link>
                      {date && (
                        <span className="flex items-center gap-1">
                          <IconCalendarDays className="h-3 w-3" />
                          {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <IconUsers className="h-3 w-3" /> {memberCount} katılımcı
                      </span>
                      <span>{itemCount} içerik</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isJoined ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
                        ✓ Katılıyorum
                      </span>
                    ) : user ? (
                      <Link href={`/film-gecesi/${party.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-[--accent] hover:bg-[--accent-hover] text-white rounded-full transition-colors">
                        Katıl
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
