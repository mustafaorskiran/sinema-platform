'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { RatingItem } from './page'

// ─── Sabit veriler ───────────────────────────────────────────────────────────

const GENRES = [
  { id: 28,    slug: 'aksiyon',    name: 'Aksiyon',     emoji: '💥' },
  { id: 35,    slug: 'komedi',     name: 'Komedi',      emoji: '😂' },
  { id: 18,    slug: 'drama',      name: 'Drama',       emoji: '🎭' },
  { id: 27,    slug: 'korku',      name: 'Korku',       emoji: '👻' },
  { id: 878,   slug: 'bilim-kurgu', name: 'Bilim Kurgu', emoji: '🚀' },
  { id: 10749, slug: 'romantik',   name: 'Romantik',    emoji: '❤️' },
  { id: 53,    slug: 'gerilim',    name: 'Gerilim',     emoji: '😱' },
  { id: 16,    slug: 'animasyon',  name: 'Animasyon',   emoji: '🎨' },
  { id: 99,    slug: 'belgesel',   name: 'Belgesel',    emoji: '📷' },
  { id: 14,    slug: 'fantezi',    name: 'Fantezi',     emoji: '🧙' },
  { id: 80,    slug: 'suc',        name: 'Suç',         emoji: '🔫' },
  { id: 12,    slug: 'macera',     name: 'Macera',      emoji: '🗺️' },
  { id: 36,    slug: 'tarih',      name: 'Tarih',       emoji: '📜' },
  { id: 10402, slug: 'muzik',      name: 'Müzik',       emoji: '🎵' },
  { id: 10751, slug: 'aile',       name: 'Aile',        emoji: '👨‍👩‍👧' },
  { id: 9648,  slug: 'gizem',      name: 'Gizem',       emoji: '🔍' },
  { id: 10752, slug: 'savas',      name: 'Savaş',       emoji: '⚔️' },
  { id: 37,    slug: 'western',    name: 'Western',     emoji: '🤠' },
]

const PLATFORMS = [
  { id: 8,    name: 'Netflix',            bg: 'bg-red-900/60',    border: 'border-red-500/60',   text: 'text-red-300' },
  { id: 9,    name: 'Amazon Prime',       bg: 'bg-sky-900/60',    border: 'border-sky-500/60',   text: 'text-sky-300' },
  { id: 337,  name: 'Disney+',           bg: 'bg-blue-900/60',   border: 'border-blue-500/60',  text: 'text-blue-300' },
  { id: 350,  name: 'Apple TV+',         bg: 'bg-zinc-800/60',   border: 'border-zinc-400/60',  text: 'text-zinc-200' },
  { id: 1899, name: 'Max',               bg: 'bg-indigo-900/60', border: 'border-indigo-500/60',text: 'text-indigo-300' },
  { id: 341,  name: 'Blu TV',            bg: 'bg-blue-800/60',   border: 'border-blue-400/60',  text: 'text-blue-200' },
  { id: 11,   name: 'MUBI',              bg: 'bg-teal-900/60',   border: 'border-teal-500/60',  text: 'text-teal-300' },
  { id: 531,  name: 'Paramount+',        bg: 'bg-cyan-900/60',   border: 'border-cyan-500/60',  text: 'text-cyan-300' },
  { id: 1770, name: 'Gain',              bg: 'bg-purple-900/60', border: 'border-purple-500/60',text: 'text-purple-300' },
  { id: 188,  name: 'YouTube Premium',   bg: 'bg-rose-900/60',   border: 'border-rose-500/60',  text: 'text-rose-300' },
]

const STEP_LABELS = ['Türler', 'Platformlar', 'Puanlar', 'Oyuncular', 'Hakkında']
const MIN_GENRES = 5
const MIN_RATINGS = 10

// ─── Tip ─────────────────────────────────────────────────────────────────────

interface Actor {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export default function OnboardingClient({ ratingItems }: { ratingItems: RatingItem[] }) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])

  // Step 2
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([])

  // Step 3
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({})

  // Step 4
  const [actors, setActors] = useState<Actor[]>([])
  const [actorsLoading, setActorsLoading] = useState(false)
  const [selectedActors, setSelectedActors] = useState<number[]>([])

  // Step 5
  const [birthYear, setBirthYear] = useState('')
  const [country, setCountry] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 4'e gelince oyuncuları çek
  useEffect(() => {
    if (step === 4 && actors.length === 0) {
      setActorsLoading(true)
      fetch('/api/onboarding/actors')
        .then(r => r.json())
        .then(data => setActors(Array.isArray(data) ? data : []))
        .catch(() => setActors([]))
        .finally(() => setActorsLoading(false))
    }
  }, [step, actors.length])

  const rateItem = useCallback((id: number, type: 'film' | 'dizi', stars: number) => {
    const k = `${type}-${id}`
    setItemRatings(prev => {
      if (prev[k] === stars * 2) {
        const next = { ...prev }
        delete next[k]
        return next
      }
      return { ...prev, [k]: stars * 2 }
    })
  }, [])

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const togglePlatform = (id: number) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleActor = (id: number) => {
    setSelectedActors(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const ratedCount = Object.keys(itemRatings).length

  const handleComplete = async () => {
    setSaving(true)
    setError('')
    try {
      const ratings = ratingItems
        .filter(item => itemRatings[`${item.type}-${item.id}`])
        .map(item => ({
          media_id: item.id,
          media_type: item.type,
          rating: itemRatings[`${item.type}-${item.id}`],
        }))

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre_preferences: selectedGenres,
          platform_preferences: selectedPlatforms,
          favorite_actors: selectedActors,
          ratings,
          birth_year: birthYear ? Number(birthYear) : null,
          country: country.trim() || null,
        }),
      })

      if (!res.ok) throw new Error('Kayıt başarısız')
      router.push('/?welcome=1')
      router.refresh()
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar dene.')
      setSaving(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[--bg-primary]">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 bg-[--bg-primary]/95 backdrop-blur border-b border-[--border]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[--text-secondary] font-medium">
              Adım {step} / {STEP_LABELS.length}
            </span>
            <span className="text-xs text-[--text-secondary]">{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="flex gap-1.5">
            {STEP_LABELS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-[--accent]' : 'bg-white/8'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">

        {/* ── STEP 1: TÜRLER ── */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Hangi türleri seversin?</h1>
              <p className="text-[--text-secondary] text-sm">
                En az <span className="text-white font-semibold">{MIN_GENRES} tür</span> seç — öneriler buna göre kişiselleşir.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {GENRES.map(g => {
                const sel = selectedGenres.includes(g.id)
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      sel
                        ? 'border-[--accent] bg-[--accent]/10 scale-[1.03]'
                        : 'border-[--border] bg-[--bg-card] hover:border-[--accent]/40'
                    }`}
                  >
                    {sel && (
                      <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[--accent] text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                    )}
                    <span className="text-2xl leading-none">{g.emoji}</span>
                    <span className={`text-[11px] font-medium leading-tight ${sel ? 'text-white' : 'text-[--text-secondary]'}`}>{g.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: PLATFORMLAR ── */}
        {step === 2 && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Hangi platformlara üyesin?</h1>
              <p className="text-[--text-secondary] text-sm">
                Seçtiğin platformlardaki içerikleri öncelikli göstereceğiz. <span className="text-[--text-secondary]/70">(İsteğe bağlı)</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PLATFORMS.map(p => {
                const sel = selectedPlatforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      sel
                        ? `${p.bg} ${p.border} ${p.text} scale-[1.02]`
                        : 'border-[--border] bg-[--bg-card] text-[--text-secondary] hover:border-white/20'
                    }`}
                  >
                    <span className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      sel ? 'bg-[--accent] border-[--accent] text-white' : 'border-[--border]'
                    }`}>
                      {sel && <span className="text-[10px] leading-none">✓</span>}
                    </span>
                    <span className="text-sm font-medium">{p.name}</span>
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-[--text-secondary] mt-5 text-center">
              Üyeliğin olmayan platformları da seçebilirsin. Dilediğin zaman değiştirebilirsin.
            </p>
          </div>
        )}

        {/* ── STEP 3: PUANLA ── */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Bunları izledin mi?</h1>
              <p className="text-[--text-secondary] text-sm mb-3">
                Tanıdığın filmlere ve dizilere puan ver. En az <span className="text-white font-semibold">{MIN_RATINGS}</span> puan gerekiyor.
              </p>
              {/* İlerleme */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="h-full rounded-full bg-[--accent] transition-all duration-300"
                    style={{ width: `${Math.min(100, (ratedCount / MIN_RATINGS) * 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold shrink-0 ${ratedCount >= MIN_RATINGS ? 'text-green-400' : 'text-[--accent]'}`}>
                  {ratedCount}/{MIN_RATINGS}
                </span>
                {ratedCount >= MIN_RATINGS && (
                  <span className="text-green-400 text-xs font-medium">✓ Hazır!</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {ratingItems.map(item => {
                const k = `${item.type}-${item.id}`
                const currentStars = itemRatings[k] ? itemRatings[k] / 2 : 0
                return (
                  <div key={k} className="flex flex-col">
                    {/* Poster */}
                    <div className={`relative aspect-[2/3] rounded-lg overflow-hidden bg-[--bg-card] border-2 transition-all ${
                      currentStars > 0 ? 'border-[--accent]/60' : 'border-[--border]'
                    }`}>
                      {item.poster ? (
                        <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-1 text-[9px] text-[--text-secondary] text-center">{item.title}</div>
                      )}
                      {/* Tür badge */}
                      <div className={`absolute top-1 left-1 text-[9px] px-1 py-0.5 rounded font-medium ${
                        item.type === 'film' ? 'bg-[--accent]/80 text-white' : 'bg-blue-600/80 text-white'
                      }`}>
                        {item.type === 'film' ? 'F' : 'D'}
                      </div>
                    </div>

                    {/* Başlık */}
                    <p className="text-[10px] text-[--text-secondary] mt-1 line-clamp-1 leading-tight">{item.title}</p>

                    {/* 5 Yıldız */}
                    <div className="flex justify-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => rateItem(item.id, item.type, star)}
                          className={`text-lg leading-none transition-colors hover:scale-110 ${
                            currentStars >= star ? 'text-[--gold]' : 'text-[--border] hover:text-[--gold]/60'
                          }`}
                          title={`${star * 2}/10`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {currentStars > 0 && (
                      <p className="text-[9px] text-[--text-secondary] text-center mt-0.5">{currentStars * 2}/10</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 4: OYUNCULAR ── */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Favori oyuncuların kimler?</h1>
              <p className="text-[--text-secondary] text-sm">
                Bu adım isteğe bağlı. İstersen atlayabilirsin.
              </p>
            </div>

            {actorsLoading ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[2/3] rounded-xl bg-[--bg-card]" />
                    <div className="h-2.5 mt-1.5 bg-[--bg-card] rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {actors.map(actor => {
                  const sel = selectedActors.includes(actor.id)
                  return (
                    <button
                      key={actor.id}
                      onClick={() => toggleActor(actor.id)}
                      className={`flex flex-col items-center text-center transition-all ${
                        sel ? 'scale-[1.04]' : ''
                      }`}
                    >
                      <div className={`relative aspect-[2/3] w-full rounded-xl overflow-hidden border-2 transition-all ${
                        sel ? 'border-[--accent]' : 'border-[--border]'
                      }`}>
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[--bg-card] flex items-center justify-center text-2xl text-[--text-secondary]">
                            {actor.name[0]}
                          </div>
                        )}
                        {sel && (
                          <div className="absolute inset-0 bg-[--accent]/20 flex items-center justify-center">
                            <span className="text-white text-xl font-bold bg-[--accent] rounded-full w-7 h-7 flex items-center justify-center text-sm">✓</span>
                          </div>
                        )}
                      </div>
                      <p className={`text-[10px] mt-1 leading-tight line-clamp-2 ${sel ? 'text-white font-medium' : 'text-[--text-secondary]'}`}>
                        {actor.name}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}

            {selectedActors.length > 0 && (
              <p className="text-xs text-center text-[--accent] mt-4 font-medium">
                {selectedActors.length} oyuncu seçildi
              </p>
            )}
          </div>
        )}

        {/* ── STEP 5: DEMOGRAFİK ── */}
        {step === 5 && (
          <div className="max-w-sm mx-auto">
            <div className="mb-8 text-center">
              <div className="text-5xl mb-4">🎂</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Seni biraz tanıyalım</h1>
              <p className="text-[--text-secondary] text-sm">
                Bu bilgiler film puanlarında yaş grubu istatistiklerini göstermek için kullanılır. Kimseyle paylaşılmaz.
                <br /><span className="text-[--text-secondary]/60 text-xs mt-1 block">İsteğe bağlı — atlayabilirsin.</span>
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">Doğum Yılın</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={e => setBirthYear(e.target.value)}
                  min={1920}
                  max={new Date().getFullYear() - 13}
                  placeholder="örn. 1995"
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">Ülken</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors"
                  style={{ background: 'rgba(20,28,47,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="">Seç (isteğe bağlı)</option>
                  <option value="TR">🇹🇷 Türkiye</option>
                  <option value="DE">🇩🇪 Almanya</option>
                  <option value="US">🇺🇸 Amerika</option>
                  <option value="GB">🇬🇧 İngiltere</option>
                  <option value="FR">🇫🇷 Fransa</option>
                  <option value="NL">🇳🇱 Hollanda</option>
                  <option value="BE">🇧🇪 Belçika</option>
                  <option value="AT">🇦🇹 Avusturya</option>
                  <option value="CH">🇨🇭 İsviçre</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Sabit alt navigasyon ── */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-[--bg-primary]/95 backdrop-blur border-t border-[--border]">
        <div className="max-w-3xl mx-auto px-4 py-4 pb-20 md:pb-4 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => (s - 1) as typeof step)}
              className="px-5 py-2.5 rounded-xl border border-[--border] text-[--text-secondary] hover:text-white hover:border-white/30 text-sm font-medium transition-colors"
            >
              ← Geri
            </button>
          ) : (
            <div />
          )}

          <div className="flex-1 flex items-center justify-end gap-3">
            {/* Step bilgisi */}
            {step === 1 && (
              <span className={`text-xs font-medium ${selectedGenres.length >= MIN_GENRES ? 'text-green-400' : 'text-[--text-secondary]'}`}>
                {selectedGenres.length}/{MIN_GENRES} seçildi
              </span>
            )}
            {step === 3 && (
              <span className={`text-xs font-medium ${ratedCount >= MIN_RATINGS ? 'text-green-400' : 'text-[--text-secondary]'}`}>
                {ratedCount}/{MIN_RATINGS} puan
              </span>
            )}

            {/* Atla (step 2, 4, 5 için) */}
            {(step === 2 || step === 4 || step === 5) && (
              <button
                onClick={() => {
                  if (step === 5) handleComplete()
                  else setStep(s => (s + 1) as typeof step)
                }}
                className="text-sm text-[--text-secondary] hover:text-white transition-colors"
              >
                {step === 5 ? 'Atla ve Tamamla' : 'Atla'}
              </button>
            )}

            {/* İleri / Tamamla */}
            {step < 5 ? (
              <button
                onClick={() => setStep(s => (s + 1) as typeof step)}
                disabled={
                  (step === 1 && selectedGenres.length < MIN_GENRES) ||
                  (step === 3 && ratedCount < MIN_RATINGS)
                }
                className="px-6 py-2.5 rounded-xl bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Devam →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[--accent] hover:bg-[--accent-hover] text-white font-semibold text-sm transition-colors disabled:opacity-40"
              >
                {saving ? 'Kaydediliyor…' : '🎉 Tamamla'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-center text-xs text-red-400 pb-3 -mt-1">{error}</p>
        )}
      </div>
    </div>
  )
}
