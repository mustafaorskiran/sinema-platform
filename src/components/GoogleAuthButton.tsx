'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  next?: string
  label?: string
}

export default function GoogleAuthButton({ next = '/', label = 'Google ile devam et' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleGoogle() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (oauthError) {
      setError('Google ile giriş başlatılamadı. Lütfen tekrar dene.')
      setLoading(false)
    }
    // Başarıda tarayıcı Google'a yönlendiriyor — setLoading(false) gerekmez
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 hover:brightness-110"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'var(--text-primary)',
        }}
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin shrink-0" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        <span>{loading ? 'Yönlendiriliyor...' : label}</span>
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
