'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo, useEffect } from 'react'
import { IconEye, IconEyeOff, IconMail } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import { useLocale } from '@/context/LocaleContext'

function getPasswordStrength(pw: string, t: (key: string) => string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6)  score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: t('auth.strengthVeryWeak'), color: '#f87171' }
  if (score === 2) return { score, label: t('auth.strengthWeak'), color: '#fb923c' }
  if (score === 3) return { score, label: t('auth.strengthMedium'), color: '#facc15' }
  if (score === 4) return { score, label: t('auth.strengthStrong'), color: '#4ade80' }
  return { score, label: t('auth.strengthVeryStrong'), color: '#22c55e' }
}

export default function KayitPage() {
  const { t } = useLocale()
  const [username, setUsername]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState(false)
  const [refUser, setRefUser]           = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setRefUser(ref)
  }, [])

  const strength = useMemo(() => getPasswordStrength(password, t), [password, t])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const trimmedUser = username.trim()
    if (trimmedUser.length < 3) { setError(t('auth.usernameMinLength')); return }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUser)) { setError(t('auth.usernameInvalidChars')); return }
    if (password.length < 6) { setError(t('auth.passwordMinLength')); return }
    setLoading(true)
    const supabase = createClient()
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', trimmedUser).maybeSingle()
    if (existing) { setError(t('auth.usernameTaken')); setLoading(false); return }
    const nextUrl = refUser ? `/auth/callback?next=/onboarding&ref=${refUser}` : `/auth/callback?next=/onboarding`
    const { error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: trimmedUser }, emailRedirectTo: `${window.location.origin}${nextUrl}` },
    })
    if (authError) {
      setError(authError.message === 'User already registered' ? t('auth.emailAlreadyRegistered') : t('auth.registerError'))
      setLoading(false); return
    }
    setSuccess(true); setLoading(false)
  }

  const inputBase = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'var(--text-primary)',
  }

  if (success) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,72,0.13) 0%, transparent 70%)' }} />
        <div className="w-full max-w-sm text-center rounded-2xl p-10 relative z-10"
          style={{
            background: 'linear-gradient(160deg, rgba(20,28,47,0.95) 0%, rgba(14,20,32,0.98) 100%)',
            border: '1px solid rgba(212,168,67,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <IconMail className="h-7 w-7" style={{ color: '#4ade80' }} />
          </div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(212,168,67,0.5)' }}>{t('auth.almostDone')}</p>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('auth.verifyEmail')}</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{email}</span> {t('auth.verificationSentInfo')}
          </p>
          <p className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {t('auth.checkSpam')}
          </p>
          <Link href="/auth/giris"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,72,0.13) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <Image src="/logo-mark.png" alt="Sinezon" width={32} height={32} className="h-8 w-8" priority />
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Sine<span style={{ color: 'var(--accent)' }}>zon</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('auth.createAccount')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('auth.registerSubtitle')}</p>
        </div>

        <div className="rounded-2xl p-7" style={{
          background: 'linear-gradient(160deg, rgba(20,28,47,0.95) 0%, rgba(14,20,32,0.98) 100%)',
          border: '1px solid rgba(212,168,67,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}>
          {refUser && (
            <div className="mb-4 p-3 rounded-xl text-xs text-center"
              style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.15)', color: 'rgba(255,255,255,0.6)' }}>
              <span className="font-bold text-white">@{refUser}</span> {t('auth.invitedByText')}
            </div>
          )}
          <GoogleAuthButton next="/" label={t('auth.googleRegister')} />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'rgba(14,20,32,0.98)', color: 'var(--text-secondary)' }}>
                {t('auth.orEmailRegister')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                {t('auth.username')}
              </label>
              <input type="text" value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                required maxLength={30} placeholder={t('auth.usernamePlaceholder')}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all" style={inputBase}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
              <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('auth.usernameHint')}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                {t('auth.email')}
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder={t('auth.emailPlaceholder')}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all" style={inputBase}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required placeholder={t('auth.passwordMinPlaceholder')}
                  className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all" style={inputBase}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>

              {/* Şifre güç göstergesi */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <p className="text-[11px]" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #be1a3e 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(225,29,72,0.3)' }}>
              {loading ? t('auth.registering') : t('auth.registerTitle')}
            </button>
          </form>

          <p className="mt-5 text-center text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            {t('auth.hasAccountQuestion')}{' '}
            <Link href="/auth/giris" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
              {t('auth.loginTitle')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
