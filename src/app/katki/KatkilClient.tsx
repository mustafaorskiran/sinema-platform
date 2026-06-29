'use client'
import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

type Tip = 'film' | 'dizi'

interface Result {
  id: number
  title: string
  originalTitle: string
  overview: string
  posterPath: string | null
  year: string
  voteAverage: number
  exists: boolean
}

export default function KatkilClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [tip, setTip] = useState<Tip>('film')
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState<Set<number>>(new Set())
  const [addingId, setAddingId] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const search = useCallback((val: string, t: Tip) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/katki/arama?q=${encodeURIComponent(val)}&tip=${t}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 400)
  }, [])

  async function handleAdd(item: Result) {
    if (!isLoggedIn) return
    setAddingId(item.id)
    try {
      const res = await fetch('/api/katki/ekle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: item.id, mediaType: tip }),
      })
      if (res.ok) {
        setAdded(prev => new Set([...prev, item.id]))
        setResults(prev => prev.map(r => r.id === item.id ? { ...r, exists: true } : r))
      }
    } finally {
      setAddingId(null)
    }
  }

  const POSTER = 'https://image.tmdb.org/t/p/w92'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Başlık */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', color: 'rgba(212,168,67,0.7)' }}>
          Katkıda Bulun
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Eksik İçerik Ekle</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Siteye eklemek istediğin film veya diziyi ara — TMDb&apos;den otomatik alınır, anında erişime açılır.
        </p>
      </div>

      {/* Film / Dizi Seçici */}
      <div className="flex rounded-xl overflow-hidden mb-5"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        {(['film', 'dizi'] as Tip[]).map((t) => (
          <button key={t} onClick={() => { setTip(t); search(q, t); setResults([]) }}
            className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all"
            style={{
              background: tip === t ? 'rgba(212,168,67,0.12)' : 'transparent',
              color: tip === t ? '#D4A843' : 'rgba(255,255,255,0.4)',
              borderRight: t === 'film' ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
            {t === 'film' ? '🎬 Film' : '📺 Dizi'}
          </button>
        ))}
      </div>

      {/* Arama Kutusu */}
      <div className="relative mb-6">
        <input
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); search(e.target.value, tip) }}
          placeholder={`${tip === 'film' ? 'Film' : 'Dizi'} adı gir...`}
          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Giriş uyarısı */}
      {!isLoggedIn && q.length > 1 && (
        <div className="rounded-xl px-4 py-3 mb-4"
          style={{ background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.2)' }}>
          <p className="text-sm" style={{ color: 'rgba(212,168,67,0.8)' }}>
            İçerik eklemek için{' '}
            <Link href="/auth/giris" className="font-bold underline">giriş yapmalısın</Link>.
          </p>
        </div>
      )}

      {/* Sonuçlar */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map(item => {
            const isAdded = added.has(item.id)
            const isAdding = addingId === item.id
            const alreadyIn = item.exists && !isAdded

            return (
              <div key={item.id} className="flex items-start gap-4 rounded-2xl p-4 transition-all"
                style={{
                  background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))',
                  border: `1px solid ${isAdded ? 'rgba(74,222,128,0.2)' : alreadyIn ? 'rgba(255,255,255,0.05)' : 'rgba(212,168,67,0.1)'}`,
                }}>
                {/* Poster */}
                <div className="shrink-0 rounded-lg overflow-hidden w-12 h-16"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {item.posterPath
                    ? <img src={`${POSTER}${item.posterPath}`} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      {item.originalTitle !== item.title && (
                        <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.originalTitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.year && <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.year}</span>}
                        {item.voteAverage > 0 && (
                          <span className="text-[11px] font-medium" style={{ color: '#D4A843' }}>★ {item.voteAverage.toFixed(1)}</span>
                        )}
                      </div>
                    </div>

                    {/* Buton */}
                    <div className="shrink-0">
                      {alreadyIn ? (
                        <Link href={`/${tip}/${item.id}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                          Zaten Var →
                        </Link>
                      ) : isAdded ? (
                        <Link href={`/${tip}/${item.id}`}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}>
                          ✓ Eklendi →
                        </Link>
                      ) : isLoggedIn ? (
                        <button onClick={() => handleAdd(item)} disabled={isAdding}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                          style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' }}>
                          {isAdding ? '...' : '+ Ekle'}
                        </button>
                      ) : (
                        <Link href="/auth/giris"
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.15)', color: 'rgba(212,168,67,0.5)' }}>
                          Giriş Yap
                        </Link>
                      )}
                    </div>
                  </div>

                  {item.overview && (
                    <p className="text-[11px] mt-1.5 line-clamp-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {item.overview}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Boş sonuç */}
      {!loading && q.length >= 2 && results.length === 0 && (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">Sonuç bulunamadı</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>TMDb&apos;de bu isimde içerik yok olabilir</p>
        </div>
      )}

      {/* Boş başlangıç hali */}
      {q.length < 2 && (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-sm">Aramak istediğin {tip === 'film' ? 'filmi' : 'diziyi'} yaz</p>
        </div>
      )}
    </div>
  )
}
