'use client'

import { useState } from 'react'

interface Suggestion {
  title: string
  reason: string
}

interface OneriResponse {
  suggestions: Suggestion[]
  basedOn: string[]
  error?: string
}

export default function OneriClient() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OneriResponse | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setData(null)

    try {
      const res = await fetch('/api/ai/oneri')
      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? 'Öneri alınamadı. Lütfen tekrar dene.')
      } else {
        setData(json)
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar dene.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Açıklama kartı */}
      <div className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            ✨
          </div>
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: 'rgba(139,92,246,0.6)' }}>
              Nasıl Çalışır?
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              7 puan ve üzeri değerlendirdiğin filmler ve diziler analiz edilerek{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Claude AI</span> ile
              kişiselleştirilmiş 5 öneri oluşturulur.
            </p>
          </div>
        </div>
      </div>

      {/* Öneri Butonu */}
      <button onClick={handleGenerate} disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            AI Analiz Ediyor...
          </span>
        ) : '🤖 Öneri Al'}
      </button>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      {/* Sonuçlar */}
      {data && (
        <div className="space-y-4">
          {/* Neye göre */}
          {data.basedOn && data.basedOn.length > 0 && (
            <div className="rounded-xl px-4 py-3"
              style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: 'rgba(139,92,246,0.5)' }}>
                Şunlara Göre Önerildi
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.basedOn.map((b, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded"
                    style={{ background: 'rgba(139,92,246,0.1)', color: 'rgba(139,92,246,0.8)' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Öneriler */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.08)', background: 'rgba(139,92,246,0.03)' }}>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(139,92,246,0.5)' }}>
                Senin İçin 5 Öneri
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {(data.suggestions ?? []).map((s, i) => (
                <div key={i} className="px-5 py-4 flex gap-4">
                  <div className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-[12px] font-black"
                    style={{ background: 'rgba(139,92,246,0.12)', color: 'rgba(139,92,246,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(139,92,246,0.8)' }}>
            🔄 Farklı Öneriler Al
          </button>
        </div>
      )}
    </div>
  )
}
