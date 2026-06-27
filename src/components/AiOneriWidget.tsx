'use client'

import { useState } from 'react'

interface Oneri {
  baslik: string
  neden: string
  genre: string
}

export default function AiOneriWidget() {
  const [mood, setMood] = useState('')
  const [type, setType] = useState<'film' | 'dizi'>('film')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Oneri[] | null>(null)
  const [error, setError] = useState('')

  async function getOneri() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai-oneri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, type }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data.öneriler ?? [])
    } catch {
      setError('Bağlantı hatası.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'linear-gradient(160deg, rgba(14,10,30,0.98), rgba(10,6,22,0.99))', border: '1px solid rgba(139,92,246,0.15)', boxShadow: '0 0 40px rgba(139,92,246,0.05)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #a78bfa, #E11D48)' }} />
        <p className="text-sm font-bold text-white">🤖 Yapay Zeka Önerisi</p>
      </div>

      {/* Tip seçimi */}
      <div className="flex gap-2 mb-3">
        {(['film', 'dizi'] as const).map(t => (
          <button key={t} onClick={() => setType(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={type === t
              ? { background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
            }>
            {t === 'film' ? '🎬 Film' : '📺 Dizi'}
          </button>
        ))}
      </div>

      {/* Ruh hali input */}
      <input
        type="text"
        value={mood}
        onChange={e => setMood(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !loading && getOneri()}
        placeholder="Ruh halini yaz... (ör. hüzünlü, aksiyon dolu)"
        maxLength={100}
        className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none mb-3"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      />

      <button
        onClick={getOneri}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
      >
        {loading ? '✨ Düşünüyor...' : '✨ Öneri Al'}
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
      )}

      {result && result.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.map((o, i) => (
            <div key={i} className="rounded-xl p-3"
              style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <div className="flex items-start gap-2">
                <span className="text-[11px] font-black mt-0.5" style={{ color: '#a78bfa', minWidth: '16px' }}>{i + 1}.</span>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{o.baslik}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{o.neden}</p>
                  {o.genre && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>{o.genre}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
