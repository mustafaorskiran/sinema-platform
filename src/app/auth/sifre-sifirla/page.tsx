'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { IconEye, IconEyeOff, IconFilm } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6)  score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Çok Zayıf', color: '#f87171' }
  if (score === 2) return { score, label: 'Zayıf', color: '#fb923c' }
  if (score === 3) return { score, label: 'Orta', color: '#facc15' }
  if (score === 4) return { score, label: 'Güçlü', color: '#4ade80' }
  return { score, label: 'Çok Güçlü', color: '#22c55e' }
}

export default function SifreSifirlaPage() {
  const router = useRouter()
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [done, setDone]                 = useState(false)
  const [error, setError]               = useState('')

  const strength = useMemo(() => getPasswordStrength(password), [password])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({ password })
    if (authError) {
      setError('Şifre güncellenemedi. Lütfen tekrar deneyin.')
      setLoading(false); return
    }
    setDone(true)
    setTimeout(() => router.push('/'), 2500)
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <IconFilm className="h-7 w-7" style={{ color: 'var(--accent)' }} />
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Sine<span style={{ color: 'var(--accent)' }}>zon</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Yeni Şifre Belirle</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Hesabın için yeni bir şifre oluştur</p>
        </div>

        <div className="rounded-2xl p-7" style={{
          background: 'linear-gradient(160deg, rgba(20,28,47,0.95) 0%, rgba(14,20,32,0.98) 100%)',
          border: '1px solid rgba(212,168,67,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}>
          {done ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <svg className="h-8 w-8" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(212,168,67,0.5)' }}>Başarılı</p>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Şifren Güncellendi</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ana sayfaya yönlendiriliyorsun...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required placeholder="En az 6 karakter"
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all" style={inputBase}
                    onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </button>
                </div>

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

              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-[0.12em]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                  Şifre Tekrar
                </label>
                <input type={showPassword ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)} required placeholder="Şifreni tekrar gir"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    ...inputBase,
                    ...(confirm.length > 0 && {
                      borderColor: confirm === password ? 'rgba(34,197,94,0.4)' : 'rgba(248,113,113,0.4)',
                    })
                  }}
                  onFocus={e => (e.target.style.borderColor = confirm === password ? 'rgba(34,197,94,0.5)' : 'rgba(212,168,67,0.4)')}
                  onBlur={e => (e.target.style.borderColor = confirm.length > 0 ? (confirm === password ? 'rgba(34,197,94,0.4)' : 'rgba(248,113,113,0.4)') : 'rgba(255,255,255,0.09)')}
                />
                {confirm.length > 0 && (
                  <p className="mt-1 text-[11px]" style={{ color: confirm === password ? '#4ade80' : '#f87171' }}>
                    {confirm === password ? '✓ Şifreler eşleşiyor' : '✗ Şifreler eşleşmiyor'}
                  </p>
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
                {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
