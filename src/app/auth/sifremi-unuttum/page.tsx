'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IconArrowLeft, IconCheckCircle, IconFilm } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (authError) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <IconFilm className="h-8 w-8 text-[--accent]" />
            <span className="text-2xl font-bold text-white">Sine<span className="text-[--accent]">Ma</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Şifremi Unuttum</h1>
          <p className="text-[--text-secondary] text-sm mt-1">
            E-postana sıfırlama bağlantısı gönderelim
          </p>
        </div>

        <div className="bg-[--bg-card] border border-[--border] rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <IconCheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">E-posta Gönderildi</h2>
              <p className="text-sm text-[--text-secondary] mb-6">
                <span className="text-white font-medium">{email}</span> adresine şifre sıfırlama bağlantısı gönderdik. Gelen kutunu kontrol et.
              </p>
              <Link
                href="/auth/giris"
                className="inline-flex items-center gap-2 text-sm text-[--accent] hover:underline"
              >
                <IconArrowLeft className="h-4 w-4" />
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ornek@email.com"
                  className="w-full rounded-lg bg-[--bg-secondary] border border-[--border] px-4 py-3 text-sm text-white placeholder-[--text-secondary] outline-none focus:border-[--accent] transition-colors"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </button>

              <div className="text-center">
                <Link
                  href="/auth/giris"
                  className="inline-flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-white transition-colors"
                >
                  <IconArrowLeft className="h-3.5 w-3.5" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
