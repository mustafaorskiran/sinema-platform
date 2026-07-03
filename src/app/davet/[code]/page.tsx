import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from '@/lib/i18n'
import { IconFilm } from '@/components/icons'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: 'Sinezon\'a Davet Edildiniz!',
    description: 'Arkadaşınız sizi Sinezon\'a davet etti. Film ve dizi dünyasına katılın!',
  }
}

export default async function DavetPage({ params }: Props) {
  const { code } = await params
  const { t } = await getTranslations()
  const supabase = await createClient()

  // Bu referral_code'a sahip profili bul
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('referral_code', code)
    .maybeSingle()

  return (
    <div
      className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,72,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10 text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
          <IconFilm className="h-7 w-7" style={{ color: 'var(--accent)' }} />
          <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Sine<span style={{ color: 'var(--accent)' }}>zon</span>
          </span>
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.25)', color: 'var(--accent)' }}
          >
            <IconFilm size={28} />
          </div>

          {inviterProfile ? (
            <>
              <div className="mb-2">
                <div
                  className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold text-white overflow-hidden"
                  style={{ background: 'var(--accent)' }}
                >
                  {inviterProfile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={inviterProfile.avatar_url}
                      alt={inviterProfile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    inviterProfile.username[0]?.toUpperCase()
                  )}
                </div>
              </div>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent)' }}>{inviterProfile.username}</span> {t('invite.invitedBySuffix')}
              </h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {t('invite.pitch')}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('invite.genericTitle')}
              </h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {t('invite.pitch')}
              </p>
            </>
          )}

          <Link
            href={`/auth/kayit?ref=${code}`}
            className="block w-full py-3 rounded-xl font-bold text-sm text-center mb-3 transition-all"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {t('invite.registerFree')}
          </Link>

          <Link
            href="/auth/giris"
            className="block w-full py-2.5 rounded-xl text-sm text-center transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {t('invite.alreadyHaveAccount')}
          </Link>

          <p className="mt-5 text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
            {t('invite.afterRegisterNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
