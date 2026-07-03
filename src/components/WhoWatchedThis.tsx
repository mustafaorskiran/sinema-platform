import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import { IconCheck, IconPlay, IconBookmark } from '@/components/icons'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
}

export default async function WhoWatchedThis({ mediaId, mediaType }: Props) {
  const { t } = await getTranslations()
  const supabase = await createClient()

  const { data } = await supabase
    .from('watchlist')
    .select('status, profiles(username, avatar_url)')
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .in('status', ['izledim', 'izliyorum', 'izlemek-istiyorum'])
    .limit(30)

  if (!data || data.length === 0) return null

  const statusGroups = {
    'izledim': { label: t('whoWatchedThis.watched'), color: '#4ade80', Icon: IconCheck },
    'izliyorum': { label: t('whoWatchedThis.watching'), color: '#38bdf8', Icon: IconPlay },
    'izlemek-istiyorum': { label: t('whoWatchedThis.willWatch'), color: '#a78bfa', Icon: IconBookmark },
  }

  const groups: Record<string, { username: string; avatar_url: string | null }[]> = {
    'izledim': [], 'izliyorum': [], 'izlemek-istiyorum': [],
  }

  for (const row of data) {
    const profile = (row.profiles as unknown) as { username: string; avatar_url: string | null } | null
    if (profile && row.status in groups) groups[row.status].push(profile)
  }

  const totalCount = data.length

  return (
    <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">{t('whoWatchedThis.title')}</h3>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('whoWatchedThis.userCount', { count: totalCount })}</span>
      </div>

      <div className="space-y-3">
        {(Object.entries(groups) as [keyof typeof statusGroups, typeof groups[string]][])
          .filter(([, users]) => users.length > 0)
          .map(([status, users]) => {
            const info = statusGroups[status]
            return (
              <div key={status}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: info.color }}><info.Icon size={12} />{info.label}</span>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>({users.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {users.slice(0, 12).map(user => (
                    <Link key={user.username} href={`/profil/${user.username}`}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      title={user.username}>
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"
                        style={{ background: 'var(--accent)' }}>
                        {user.avatar_url
                          ? <Image src={user.avatar_url} alt={user.username} width={20} height={20} className="w-full h-full object-cover" />
                          : <span className="flex items-center justify-center w-full h-full text-[8px] font-bold text-white">
                              {user.username[0]?.toUpperCase()}
                            </span>
                        }
                      </div>
                      <span className="text-[11px] text-white">{user.username}</span>
                    </Link>
                  ))}
                  {users.length > 12 && (
                    <span className="flex items-center px-2 py-1 rounded-lg text-[11px]"
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}>
                      {t('whoWatchedThis.andMore', { count: users.length - 12 })}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
