'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  seriesId: number
  currentSeason: number | null
  currentEpisode: number | null
  totalSeasons: number
  nextSeason: number | null
  nextEpisode: number | null
}

export default function EpisodeUpdater({ seriesId, currentSeason, currentEpisode, totalSeasons, nextSeason, nextEpisode }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [season, setSeason] = useState(currentSeason ?? 1)
  const [episode, setEpisode] = useState(currentEpisode ?? 1)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/episode-watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: seriesId, season_number: season, episode_number: episode }),
    })
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  async function markNext() {
    if (!nextSeason || !nextEpisode) return
    setSaving(true)
    await fetch('/api/episode-watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_id: seriesId, season_number: nextSeason, episode_number: nextEpisode }),
    })
    setSaving(false)
    router.refresh()
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {nextSeason && (
          <button onClick={markNext} disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.15), rgba(190,18,60,0.1))', border: '1px solid rgba(225,29,72,0.25)', color: '#E11D48' }}>
            {saving ? '...' : `▶ S${String(nextSeason).padStart(2,'0')}B${String(nextEpisode).padStart(2,'0')} izledim`}
          </button>
        )}
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
          ✏️ Güncelle
        </button>
      </div>
    )
  }

  return (
    <div className="mt-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex gap-2 mb-2">
        <div>
          <label className="text-[9px] font-semibold uppercase tracking-wide block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Sezon</label>
          <input type="number" value={season} onChange={e => setSeason(Math.max(1, Math.min(totalSeasons, Number(e.target.value))))}
            min={1} max={totalSeasons}
            className="w-16 px-2 py-1 rounded-lg text-xs text-white text-center outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div>
          <label className="text-[9px] font-semibold uppercase tracking-wide block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Bölüm</label>
          <input type="number" value={episode} onChange={e => setEpisode(Math.max(1, Number(e.target.value)))}
            min={1}
            className="w-16 px-2 py-1 rounded-lg text-xs text-white text-center outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)}
          className="flex-1 py-1.5 rounded-lg text-xs transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
          İptal
        </button>
        <button onClick={save} disabled={saving}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'var(--accent)' }}>
          {saving ? '...' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
