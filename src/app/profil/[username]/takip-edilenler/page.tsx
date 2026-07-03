import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from '@/lib/i18n'

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} — Takip Edilenler` }
}

export default async function TakipEdilenlerPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()
  const { t } = await getTranslations()

  const { data: profile } = await supabase.from('profiles').select('id, username').eq('username', username).single()
  if (!profile) notFound()

  const { data: follows } = await supabase
    .from('follows')
    .select('following:profiles!following_id(id, username, avatar_url, bio)')
    .eq('follower_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const following = (follows ?? []).map(f => (f.following as any))

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profil/${username}`} className="text-sm hover:underline" style={{ color: 'rgba(255,255,255,0.4)' }}>← {username}</Link>
        <h1 className="text-xl font-bold text-white">{t('profile.followingPageTitle')} <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.35)' }}>({following.length})</span></h1>
      </div>

      {following.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-2xl mb-2">👤</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('profile.noFollowing')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {following.map((f: { id: string; username: string; avatar_url: string | null; bio: string | null }) => (
            <Link key={f.id} href={`/profil/${f.username}`}
              className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              {f.avatar_url
                ? <img src={f.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm" style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)' }}>{f.username[0]?.toUpperCase()}</div>
              }
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm">@{f.username}</p>
                {f.bio && <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
