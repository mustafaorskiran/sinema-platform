'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IconEye, IconEyeOff, IconFilm, IconMail } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import GoogleAuthButton from '@/components/GoogleAuthButton'

export default function KayitPage() {
  const [username, setUsername]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmedUser = username.trim()
    if (trimmedUser.length < 3)           { setError('Kullanıcı adı en az 3 karakter olmalı.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUser)) { setError('Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.'); return }
    if (password.length < 6)              { setError('Şifre en az 6 karakter olmalı.'); return }

    setLoading(true)
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('profiles').select('id').eq('username', trimmedUser).maybeSingle()
    if (existing) { setError('Bu kullanıcı adı zaten kullanılıyor.'); setLoading(false); return }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: trimmedUser },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profil`,
      },
    })

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Bu e-posta adresi zaten kayıtlı.'
        : 'Kayıt sırasında bir hata oluştu. Lütfen tekrar dene.')
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 relative" style={{ background: 'var(--bg-primary)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,72,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="w-full max-w-sm text-center rounded-2xl p-10 relative z-10"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.25)' }}
          >
            <IconMail className="h-7 w-7" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>E-postanı Doğrula</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{email}</span> adresine doğrulama bağlantısı gönderdik.
            Bağlantıya tıkladıktan sonra hesabın aktif olacak.
          </p>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
            Mail gelmediyse spam klasörünü kontrol et.
          </p>
          <Link
            href="/auth/giris"
            className="inline-block mt-6 px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
            }}
          >
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    )
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    (e.target as HTMLInputElement).style.borderColor = 'var(--border)'
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,72,0.12) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <IconFilm className="h-7 w-7" style={{ color: 'var(--accent)' }} />
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Sine<span style={{ color: 'var(--accent)' }}>zon</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Hesap Oluştur</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Topluluğa katıl, yorum yap</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          <GoogleAuthButton next="/" label="Google ile kayıt ol" />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                veya e-posta ile kayıt ol
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                required maxLength={30}
                placeholder="sinemadostu"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <p className="mt-1 text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                Harf, rakam ve _ içerebilir.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ornek@email.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="En az 6 karakter"
                  className="w-full rounded-lg px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
                >
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-sm rounded-lg px-4 py-2.5"
                style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Zaten hesabın var mı?{' '}
            <Link href="/auth/giris" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
