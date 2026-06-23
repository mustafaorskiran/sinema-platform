'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconCheckCircle, IconEye, IconEyeOff, IconFilm } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

export default function SifreSifirlaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({ password })

    if (authError) {
      setError('Şifre güncellenemedi. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/'), 2500)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <IconFilm className="h-8 w-8 text-[--accent]" />
            <span className="text-2xl font-bold text-white">Sine<span className="text-[--accent]">Ma</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Yeni Şifre Belirle</h1>
          <p className="text-[--text-secondary] text-sm mt-1">Hesabın için yeni bir şifre oluştur</p>
        </div>

        <div className="bg-[--bg-card] border border-[--border] rounded-2xl p-8">
          {done ? (
            <div className="text-center py-4">
              <IconCheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Şifren Güncellendi</h2>
              <p className="text-sm text-[--text-secondary]">Ana sayfaya yönlendiriliyorsun...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">Yeni Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="En az 6 karakter"
                    className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 pr-10 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-secondary] hover:text-white"
                  >
                    {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">Şifre Tekrar</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Şifreni tekrar gir"
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
