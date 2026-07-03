"use client"

import { useEffect, useState } from "react"
import type { ComponentType } from "react"
import { useLocale } from "@/context/LocaleContext"
import { IconTrophy, IconFilm, IconTv, IconMedal, IconCheck } from "@/components/icons"

interface Data {
  challenge: { film_goal: number; series_goal: number } | null
  watched: { films: number; series: number }
  year: number
}

function ProgressRing({ pct, size = 80, color }: { pct: number; size?: number; color: string }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  )
}

function MilestoneBadge({ pct, threshold, Icon, iconColor }: { pct: number; threshold: number; Icon: ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; iconColor?: string }) {
  const reached = pct >= threshold
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{
          background: reached ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.04)",
          border: reached ? "1px solid rgba(212,168,67,0.4)" : "1px solid rgba(255,255,255,0.08)",
          filter: reached ? "none" : "grayscale(1) opacity(0.3)",
        }}>
        <Icon size={16} style={{ color: iconColor ?? '#D4A843' }} />
      </div>
      <span className="text-[9px]" style={{ color: reached ? "#D4A843" : "rgba(255,255,255,0.2)" }}>
        %{threshold}
      </span>
    </div>
  )
}

export default function YearlyChallenge() {
  const { t } = useLocale()
  const [data, setData] = useState<Data | null>(null)
  const [editing, setEditing] = useState(false)
  const [filmGoal, setFilmGoal] = useState(0)
  const [seriesGoal, setSeriesGoal] = useState(0)
  const [saving, setSaving] = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    fetch("/api/yearly-challenge").then(r => r.json()).then(d => {
      if (d) {
        setData(d)
        setFilmGoal(d.challenge?.film_goal ?? 52)
        setSeriesGoal(d.challenge?.series_goal ?? 12)
      }
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch("/api/yearly-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ film_goal: filmGoal, series_goal: seriesGoal }),
    })
    setData(prev => prev ? { ...prev, challenge: { film_goal: filmGoal, series_goal: seriesGoal } } : prev)
    setSaving(false)
    setEditing(false)
  }

  function share() {
    if (!data) return
    const filmPct = filmGoalVal > 0 ? Math.min(100, Math.round((filmWatched / filmGoalVal) * 100)) : 0
    const seriesPct = seriesGoalVal > 0 ? Math.min(100, Math.round((seriesWatched / seriesGoalVal) * 100)) : 0
    const text = `🎬 ${t('yearlyChallenge.challengeTitle', { year: data.year })}\n` +
      (filmGoalVal > 0 ? `${t('yearlyChallenge.shareFilmLine', { watched: filmWatched, goal: filmGoalVal, pct: filmPct })}\n` : "") +
      (seriesGoalVal > 0 ? `${t('yearlyChallenge.shareSeriesLine', { watched: seriesWatched, goal: seriesGoalVal, pct: seriesPct })}\n` : "") +
      `\n${t('yearlyChallenge.shareHashtags')}`
    if (navigator.share) {
      navigator.share({ title: t('yearlyChallenge.shareTitle'), text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      })
    }
  }

  if (!data) return null

  const year = data.year
  const filmGoalVal = data.challenge?.film_goal ?? 0
  const seriesGoalVal = data.challenge?.series_goal ?? 0
  const filmWatched = data.watched.films
  const seriesWatched = data.watched.series
  const filmPct = filmGoalVal > 0 ? Math.min(100, Math.round((filmWatched / filmGoalVal) * 100)) : 0
  const seriesPct = seriesGoalVal > 0 ? Math.min(100, Math.round((seriesWatched / seriesGoalVal) * 100)) : 0
  const combinedPct = Math.round((filmPct + seriesPct) / 2)

  const glassCard = { background: "linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))", border: "1px solid rgba(255,255,255,0.06)" }
  const goldBorder = { background: "linear-gradient(160deg, rgba(20,28,47,0.95), rgba(14,20,32,0.98))", border: "1px solid rgba(212,168,67,0.15)" }

  if (!data.challenge && !editing) {
    return (
      <div className="rounded-2xl p-6 text-center" style={goldBorder}>
        <IconTrophy size={32} className="mx-auto mb-3 text-[--gold]" />
        <p className="text-sm font-bold text-white mb-1">{t('yearlyChallenge.challengeTitle', { year })}</p>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>{t('yearlyChallenge.askGoal')}</p>
        <button
          onClick={() => setEditing(true)}
          className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #D4A843, #b8922a)", color: "#000", boxShadow: "0 4px 16px rgba(212,168,67,0.25)" }}>
          {t('yearlyChallenge.setGoal')}
        </button>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="rounded-2xl p-5" style={glassCard}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #D4A843, #E11D48)" }} />
          <p className="flex items-center gap-2 text-sm font-bold text-white"><IconTrophy size={16} className="text-[--gold]" />{t('yearlyChallenge.setGoalTitle', { year })}</p>
        </div>
        <div className="space-y-4">
          {[
            { key: 'film', Icon: IconFilm, label: t('yearlyChallenge.filmGoalLabel'), value: filmGoal, set: setFilmGoal, max: 1000 },
            { key: 'series', Icon: IconTv, label: t('yearlyChallenge.seriesGoalLabel'), value: seriesGoal, set: setSeriesGoal, max: 500 },
          ].map(({ key, Icon, label, value, set, max }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}><Icon size={14} />{label}</label>
              <div className="flex items-center gap-3">
                <button onClick={() => set(Math.max(0, value - 1))}
                  className="w-9 h-9 rounded-xl text-white font-bold text-lg transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>−</button>
                <input type="number" value={value}
                  onChange={e => set(Math.max(0, Math.min(max, Number(e.target.value))))}
                  min={0} max={max}
                  className="w-20 text-center rounded-xl py-2 text-sm font-bold text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <button onClick={() => set(Math.min(max, value + 1))}
                  className="w-9 h-9 rounded-xl text-white font-bold text-lg transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>+</button>
                <div className="flex gap-1 ml-2">
                  {[12, 24, 52, 100].filter(n => n <= max).map(n => (
                    <button key={n} onClick={() => set(n)}
                      className="text-[10px] px-2 py-1 rounded-lg transition-colors hover:text-white"
                      style={{ background: value === n ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.04)", color: value === n ? "#D4A843" : "rgba(255,255,255,0.3)", border: `1px solid ${value === n ? "rgba(212,168,67,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(false)}
              className="flex-1 py-2 rounded-xl text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              {t('common.cancel')}
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #E11D48, #be123c)", boxShadow: "0 4px 14px rgba(225,29,72,0.25)" }}>
              {saving ? t('yearlyChallenge.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5" style={goldBorder}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #D4A843, #E11D48)" }} />
          <p className="flex items-center gap-2 text-sm font-bold text-white"><IconTrophy size={16} className="text-[--gold]" />{t('yearlyChallenge.mainTitle', { year })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={share}
            className="text-[11px] px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: shared ? "#4ade80" : "rgba(255,255,255,0.4)" }}>
            {shared ? <span className="inline-flex items-center gap-1"><IconCheck size={11} />{t('yearlyChallenge.copied')}</span> : t('yearlyChallenge.share')}
          </button>
          <button onClick={() => setEditing(true)}
            className="text-[11px] px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
            {t('common.edit')}
          </button>
        </div>
      </div>

      <div className="flex gap-4 justify-around">
        {filmGoalVal > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <ProgressRing pct={filmPct} color={filmPct >= 100 ? "#4ade80" : "#E11D48"} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-white">{filmPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white leading-none">{filmWatched}<span className="text-xs font-normal text-white/30">/{filmGoalVal}</span></p>
              <p className="flex items-center justify-center gap-1 text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}><IconFilm size={11} />{t('yearlyChallenge.film')}</p>
              {filmPct >= 100 && <p className="flex items-center justify-center gap-1 text-[10px] text-green-400 font-bold mt-0.5">{t('yearlyChallenge.completed')}<IconCheck size={11} /></p>}
            </div>
          </div>
        )}

        {filmGoalVal > 0 && seriesGoalVal > 0 && (
          <div className="w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        )}

        {seriesGoalVal > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <ProgressRing pct={seriesPct} color={seriesPct >= 100 ? "#4ade80" : "#c4b5fd"} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-white">{seriesPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white leading-none">{seriesWatched}<span className="text-xs font-normal text-white/30">/{seriesGoalVal}</span></p>
              <p className="flex items-center justify-center gap-1 text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}><IconTv size={11} />{t('yearlyChallenge.series')}</p>
              {seriesPct >= 100 && <p className="flex items-center justify-center gap-1 text-[10px] text-green-400 font-bold mt-0.5">{t('yearlyChallenge.completed')}<IconCheck size={11} /></p>}
            </div>
          </div>
        )}
      </div>

      {/* Kilometre taşı rozetleri */}
      {(filmGoalVal > 0 || seriesGoalVal > 0) && (
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[9px] text-center mb-3 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
            {t('yearlyChallenge.milestones')}
          </p>
          <div className="flex justify-around">
            <MilestoneBadge pct={combinedPct} threshold={25} Icon={IconMedal} iconColor="#B87333" />
            <MilestoneBadge pct={combinedPct} threshold={50} Icon={IconMedal} iconColor="#C0C0C0" />
            <MilestoneBadge pct={combinedPct} threshold={75} Icon={IconMedal} iconColor="#D4A803" />
            <MilestoneBadge pct={combinedPct} threshold={100} Icon={IconTrophy} iconColor="#D4A843" />
          </div>
        </div>
      )}

      {(filmGoalVal > 0 || seriesGoalVal > 0) && (
        <p className="text-[10px] text-center mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>
          {t('yearlyChallenge.asOfDate', { date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) })}
        </p>
      )}
    </div>
  )
}
