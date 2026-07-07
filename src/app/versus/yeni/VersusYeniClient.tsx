'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFilm, IconSwords } from '@/components/icons'

interface TMDbResult {
  id: number
  title: string
  poster: string | null
  year: string | null
}

interface Props {
  userId: string
}

export default function VersusYeniClient({ userId }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDbResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filmA, setFilmA] = useState<TMDbResult | null>(null)
  const [filmB, setFilmB] = useState<TMDbResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A')

  async function search(q: string) {
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=12`)
      const data = await res.json()
      const films = (data.results ?? []).filter((r: { type: string }) => r.type === 'movie')
      setResults(films.slice(0, 6))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function select(film: TMDbResult) {
    if (activeSlot === 'A') { setFilmA(film); setActiveSlot('B') }
    else { setFilmB(film); setActiveSlot('A') }
    setQuery('')
    setResults([])
  }

  async function submit() {
    if (!filmA || !filmB) return
    if (filmA.id === filmB.id) { setError('Aynı filmi iki kez seçemezsin!'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('film_versus').upsert(
      { film_a_id: filmA.id, film_b_id: filmB.id, created_by: userId },
      { onConflict: 'film_a_id,film_b_id', ignoreDuplicates: true }
    )
    if (err) { setError('Bu karşılaştırma zaten var veya bir hata oluştu.'); setSaving(false); return }
    router.push('/versus')
  }

  const card = {
    background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="space-y-6">
      {/* Seçilen filmler */}
      <div className="grid grid-cols-2 gap-3">
        {(['A', 'B'] as const).map(slot => {
          const film = slot === 'A' ? filmA : filmB
          return (
            <button key={slot} onClick={() => setActiveSlot(slot)}
              className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
              style={{
                ...card,
                border: activeSlot === slot ? '1px solid rgba(225,29,72,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {film ? (
                <>
                  <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {film.poster
                      ? <img src={film.poster} alt={film.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><IconFilm size={24} /></div>
                    }
                  </div>
                  <p className="text-xs font-semibold text-white text-center line-clamp-2">{film.title}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {film.year ?? ''}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 aspect-[2/3] rounded-xl flex items-center justify-center text-3xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                    {slot}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Film {slot} seç</p>
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Arama */}
      <div className="relative">
        <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Film {activeSlot} için ara
        </p>
        <input
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          placeholder="Film adı yaz..."
          className="w-full px-4 py-2.5 rounded-xl outline-none text-sm text-white"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
        {(loading || results.length > 0) && (
          <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
            style={{ background: 'rgba(14,20,32,0.99)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {loading && <p className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Aranıyor...</p>}
            {results.map(r => (
              <button key={r.id} onClick={() => select(r)}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5 text-left">
                <div className="w-8 h-12 rounded overflow-hidden shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {r.poster
                    ? <img src={r.poster} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><IconFilm size={16} /></div>
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{r.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {r.year ?? ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Oluştur butonu */}
      <button
        onClick={submit}
        disabled={!filmA || !filmB || saving}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 4px 16px rgba(225,29,72,0.2)' }}>
        {saving ? 'Oluşturuluyor...' : <span className="inline-flex items-center justify-center gap-2"><IconSwords size={16} /> Karşılaştırmayı Oluştur</span>}
      </button>
    </div>
  )
}
