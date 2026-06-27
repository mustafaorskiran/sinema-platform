import { redirect } from 'next/navigation'
import { IconSettings } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'
import ProfilDuzenleForm from './ProfilDuzenleForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profili Düzenle' }

export default async function ProfilDuzenle() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/giris')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, banner_url, bio, location, website, theme_color, email_notifications, email_on_follow, email_on_like, email_on_reply, twitter_url, letterboxd_url, imdb_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <IconSettings className="h-6 w-6 text-[--accent]" />
          <h1 className="text-2xl font-bold text-white">Profili Düzenle</h1>
        </div>

        <div className="bg-[--bg-card] border border-[--border] rounded-2xl p-8">
          <ProfilDuzenleForm
            userId={user.id}
            initialUsername={profile.username}
            initialAvatarUrl={profile.avatar_url ?? null}
            initialBannerUrl={profile.banner_url ?? null}
            initialBio={profile.bio ?? null}
            initialLocation={profile.location ?? null}
            initialWebsite={profile.website ?? null}
            initialThemeColor={profile.theme_color ?? null}
            initialEmailNotifications={profile.email_notifications ?? true}
            initialEmailOnFollow={profile.email_on_follow ?? true}
            initialEmailOnLike={profile.email_on_like ?? false}
            initialEmailOnReply={profile.email_on_reply ?? true}
            initialTwitterUrl={(profile as any).twitter_url ?? null}
            initialLetterboxdUrl={(profile as any).letterboxd_url ?? null}
            initialImdbUrl={(profile as any).imdb_url ?? null}
          />
        </div>
      </div>
    </div>
  )
}
