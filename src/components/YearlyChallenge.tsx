'use client'

import { useEffect, useState } from 'react'

interface Data {
  challenge: { film_goal: number; series_goal: number } | null
  watched: { films: number; series: number }
  year: number
}

export default function YearlyChallenge() {
  const [data, setData] = useState<Data | null>(null)
  const [editing, setEditing] = useState(false)
  const [filmGoal, setFilmGoal] = useState(0)
  const [seriesGoal, setSeriesGoal] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/yearly-challenge').then(r => r.json()).then(d => {
      if (d) {
        setData(d)
        setFilmGoal(d.challenge?.film_goal ?? 52)
        setSeriesGoal(d.challenge?.series_goal ?? 12)
      }
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/yearly-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ film_goal: filmGoal, series_goal: seriesGoal }),
    })
    setData(prev => prev ? { ...prev, challenge: { film_goal: filmGoal, series_goal: seriesGoal } } : prev)
    setSaving(false)
    setEditing(false)
  }

  if (!data) return null

  const year = data.year
  const filmGoalVal = data.challenge?.film_goal ?? 0
  const seriesGoalVal = data.challenge?.series_goal ?? 0
  const filmWatched = data.watched.films
  const seriesWatched = data.watched.series
  const filmPct = filmGoalVal > 0 ? Math.min(100, Math.round((filmWatched / filmGoalVal) * 100)) : 0
  const seriesPct = seriesGoalVal > 0 ? Math.min(100, Math.round((seriesWatched / seriesGoalVal) * 100)) : 0

  if (!data.challenge && !editing) {
    return (
      <div className="rounded-2xl bg-[--bg-card] border border-[--border] p-5 text-center">
        <p className="text-2xl mb-2">🏆</p>
        <p className="text-sm font-semibold text-white mb-1">{year} Meydan Okuma</p>
        <p className="text-xs text-[--text-secondary] mb-4">Bu yıl kaç film izlemek istiyorsun?</p>
        <button onClick={() => setEditing(true)}
          className="inline-block px-4 py-2 bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold rounded-full transition-colors">
          Hedef Belirle
        </button>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="rounded-2xl bg-[--bg-card] border border-[--border] p-5">
        <p className="text-sm font-bold text-white mb-4">🏆 {year} Hedefini Belirle</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[--text-secondary] mb-1 block">Film hedefi</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setFilmGoal(Math.max(0, filmGoal - 1))} className="w-8 h-8 rounded-lg bg-[--bg-secondary] border border-[--border] text-white font-bold hover:border-[--accent]/50 transition-colors">-</button>
              <input type="number" value={filmGoal} onChange={e => setFilmGoal(Number(e.target.value))} min={0} max={1000}
                className="w-20 text-center rounded-lg bg-[--bg-secondary] border border-[--border] py-1.5 text-sm text-white outline-none focus:border-[--accent]" />
              <button onClick={() => setFilmGoal(filmGoal + 1)} className="w-8 h-8 rounded-lg bg-[--bg-secondary] border border-[--border] text-white font-bold hover:border-[--accent]/50 transition-colors">+</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-[--text-secondary] mb-1 block">Dizi hedefi</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setSeriesGoal(Math.max(0, seriesGoal - 1))} className="w-8 h-8 rounded-lg bg-[--bg-secondary] border border-[--border] text-white font-bold hover:border-[--accent]/50 transition-colors">-</button>
              <input type="number" value={seriesGoal} onChange={e => setSeriesGoal(Number(e.target.value))} min={0} max={500}
                className="w-20 text-center rounded-lg bg-[--bg-secondary] border border-[--border] py-1.5 text-sm text-white outline-none focus:border-[--accent]" />
              <button onClick={() => setSeriesGoal(seriesGoal + 1)} className="w-8 h-8 rounded-lg bg-[--bg-secondary] border border-[--border] text-white font-bold hover:border-[--accent]/50 transition-colors">+</button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg border border-[--border] text-[--text-secondary] text-sm hover:text-white transition-colors">İptal</button>
            <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg bg-[--accent] hover:bg-[--accent-hover] text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[--bg-card] border border-[--border] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-white">🏆 {year} Meydan Okuma</p>
        <button onClick={() => setEditing(true)} className="text-xs text-[--text-secondary] hover:text-white transition-colors">Düzenle</button>
      </div>

      {filmGoalVal > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[--text-secondary]">🎬 Film</span>
            <span className="text-xs font-semibold text-white">{filmWatched} / {filmGoalVal}</span>
          </div>
          <div className="h-2 bg-[--bg-secondary] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${filmPct >= 100 ? 'bg-green-400' : 'bg-[--accent]'}`} style={{ width: `${filmPct}%` }} />
          </div>
          <p className="text-[10px] text-[--text-secondary] mt-0.5">%{filmPct} tamamlandı{filmPct >= 100 ? ' ✓' : ''}</p>
        </div>
      )}

      {seriesGoalVal > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[--text-secondary]">📺 Dizi</span>
            <span className="text-xs font-semibold text-white">{seriesWatched} / {seriesGoalVal}</span>
          </div>
          <div className="h-2 bg-[--bg-secondary] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${seriesPct >= 100 ? 'bg-green-400' : 'bg-purple-500'}`} style={{ width: `${seriesPct}%` }} />
          </div>
          <p className="text-[10px] text-[--text-secondary] mt-0.5">%{seriesPct} tamamlandı{seriesPct >= 100 ? ' ✓' : ''}</p>
        </div>
      )}
    </div>
  )
}
