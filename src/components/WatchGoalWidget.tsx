'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/context/LocaleContext'
import { IconTarget } from '@/components/icons'

interface Goal {
  target_films: number
  target_series: number
  year: number
}

interface Watched {
  films: number
  series: number
}

const CURRENT_YEAR = new Date().getFullYear()

function Ring({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const r = 40
  const circumference = 2 * Math.PI * r
  const dash = (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{value}</span>
          <span className="text-[10px] text-[--text-secondary]">/{max}</span>
        </div>
      </div>
      <span className="text-xs text-[--text-secondary]">{label}</span>
      <span className="text-xs font-semibold" style={{ color }}>%{pct}</span>
    </div>
  )
}

export default function WatchGoalWidget() {
  const { t } = useLocale()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [watched, setWatched] = useState<Watched>({ films: 0, series: 0 })
  const [editing, setEditing] = useState(false)
  const [films, setFilms] = useState(0)
  const [series, setSeries] = useState(0)
  const [saving, setSaving] = useState(false)
  const year = CURRENT_YEAR

  useEffect(() => {
    fetch(`/api/watch-goals?year=${year}`)
      .then(r => r.json())
      .then(({ goal: g, watched: w }) => {
        setGoal(g)
        setWatched(w ?? { films: 0, series: 0 })
        if (g) { setFilms(g.target_films); setSeries(g.target_series) }
      })
  }, [year])

  async function save() {
    setSaving(true)
    const res = await fetch('/api/watch-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, target_films: films, target_series: series }),
    })
    const data = await res.json()
    if (!data.error) setGoal(data)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-white">{t('watchGoal.title', { year })}</h3>
        <button
          onClick={() => { setEditing(e => !e); if (goal) { setFilms(goal.target_films); setSeries(goal.target_series) } }}
          className="text-xs text-[--accent] hover:underline"
        >
          {editing ? t('watchGoal.cancel') : (goal ? t('watchGoal.edit') : t('watchGoal.setGoal'))}
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[--text-secondary] block mb-1">{t('watchGoal.filmGoal')}</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setFilms(f => Math.max(0, f - 10))} className="w-8 h-8 rounded-lg text-white text-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.07)' }}>-</button>
              <input type="number" min={0} max={999} value={films} onChange={e => setFilms(Number(e.target.value))}
                className="flex-1 text-center rounded-lg py-1.5 text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => setFilms(f => Math.min(999, f + 10))} className="w-8 h-8 rounded-lg text-white text-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.07)' }}>+</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-[--text-secondary] block mb-1">{t('watchGoal.seriesGoal')}</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setSeries(s => Math.max(0, s - 5))} className="w-8 h-8 rounded-lg text-white text-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.07)' }}>-</button>
              <input type="number" min={0} max={999} value={series} onChange={e => setSeries(Number(e.target.value))}
                className="flex-1 text-center rounded-lg py-1.5 text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => setSeries(s => Math.min(999, s + 5))} className="w-8 h-8 rounded-lg text-white text-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.07)' }}>+</button>
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #E11D48, #be123c)', boxShadow: '0 2px 8px rgba(225,29,72,0.3)' }}>
            {saving ? t('watchGoal.saving') : t('watchGoal.save')}
          </button>
        </div>
      ) : goal && (goal.target_films > 0 || goal.target_series > 0) ? (
        <div className="flex justify-around">
          {goal.target_films > 0 && (
            <Ring value={watched.films} max={goal.target_films} label={t('watchGoal.filmLabel')} color="var(--accent)" />
          )}
          {goal.target_series > 0 && (
            <Ring value={watched.series} max={goal.target_series} label={t('watchGoal.seriesLabel')} color="var(--gold)" />
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <IconTarget size={40} className="mx-auto mb-2 text-[--text-secondary]" />
          <p className="text-sm text-[--text-secondary]">{t('watchGoal.noGoalYet', { year })}</p>
        </div>
      )}
    </div>
  )
}
