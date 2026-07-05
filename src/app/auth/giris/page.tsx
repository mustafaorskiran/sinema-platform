'use client'

import Link from 'next/link'
import { useState } from 'react'
import Logo from '@/components/Logo'
import { IconEye, IconEyeOff } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import { useLocale } from '@/context/LocaleContext'

export default function GirisPage() {
  const { t } = useLocale()
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(t('auth.invalidCredentials'))
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  const inputBase = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,72,0.13) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '600px', height: '300px', background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.05) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-5">
            <Logo variant="full" size="md" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('auth.welcomeBack')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('auth.loginSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7" style={{
          background: 'linear-gradient(160deg, rgba(20,28,47,0.95) 0%, rgba(14,20,32,0.98) 100%)',
          border: '1px solid rgba(212,168,67,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}>
          <GoogleAuthButton next="/" label={t('auth.googleLogin')} />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'rgba(14,20,32,0.98)', color: 'var(--text-secondary)' }}>
                {t('auth.orEmail')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                {t('auth.email')}
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder={t('auth.emailPlaceholder')}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={inputBase}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                  {t('auth.password')}
                </label>
                <Link href="/auth/sifremi-unuttum" className="text-[11px] font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                  {t('auth.forgotShort')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  autoComplete="current-password" placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                  style={inputBase}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Beni Hatırla */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="sr-only" />
                <div className="w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    background: remember ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${remember ? 'var(--accent)' : 'rgba(255,255,255,0.12)'}`,
                  }}>
                  {remember && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
              </div>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('auth.rememberMe')}</span>
            </label>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
                <Link href="/auth/sifremi-unuttum" className="text-[11px] mt-1 inline-block hover:underline" style={{ color: 'rgba(248,113,113,0.7)' }}>
                  {t('auth.forgotPasswordCta')}
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #be1a3e 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(225,29,72,0.3)' }}>
              {loading ? t('auth.loggingIn') : t('auth.loginTitle')}
            </button>
          </form>

          <p className="mt-5 text-center text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            {t('auth.noAccountQuestion')}{' '}
            <Link href="/auth/kayit" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
              {t('auth.registerTitle')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
