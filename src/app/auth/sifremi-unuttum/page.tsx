'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IconArrowLeft, IconFilm, IconMail } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/context/LocaleContext'

export default function SifremiUnuttumPage() {
  const { t } = useLocale()
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (authError) {
      setError(t('auth.genericError'))
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
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
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,72,0.1) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <IconFilm className="h-7 w-7" style={{ color: 'var(--accent)' }} />
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Sine<span style={{ color: 'var(--accent)' }}>zon</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('auth.forgotPassword')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        <div className="rounded-2xl p-7" style={{
          background: 'linear-gradient(160deg, rgba(20,28,47,0.95) 0%, rgba(14,20,32,0.98) 100%)',
          border: '1px solid rgba(212,168,67,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <IconMail className="h-7 w-7" style={{ color: '#4ade80' }} />
              </div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(212,168,67,0.5)' }}>
                {t('auth.emailSent')}
              </p>
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('auth.checkInbox')}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{email}</span> {t('auth.resetLinkSentInfo')}
              </p>
              <p className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{t('auth.checkSpam')}</p>
              <Link href="/auth/giris"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium hover:underline"
                style={{ color: 'var(--accent)' }}>
                <IconArrowLeft className="h-4 w-4" />
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {error && (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #be1a3e 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(225,29,72,0.3)' }}>
                {loading ? t('auth.sending') : t('auth.sendResetLink')}
              </button>

              <div className="text-center">
                <Link href="/auth/giris"
                  className="inline-flex items-center gap-1.5 text-[12px] hover:underline"
                  style={{ color: 'var(--text-secondary)' }}>
                  <IconArrowLeft className="h-3.5 w-3.5" />
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
