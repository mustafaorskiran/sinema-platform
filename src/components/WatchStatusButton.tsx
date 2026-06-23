'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'watching' | 'completed' | 'dropped' | 'plan_to_watch' | 'on_hold'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  isLoggedIn: boolean
  initialStatus?: string | null
}

const STATUS_OPTIONS: { value: Status; label: string; color: string; dot: string }[] = [
  { value: 'watching',      label: 'İzliyorum',    color: 'text-blue-400',   dot: 'bg-blue-400' },
  { value: 'completed',     label: 'Tamamladım ✓', color: 'text-green-400',  dot: 'bg-green-400' },
  { value: 'dropped',       label: 'Bıraktım',     color: 'text-red-400',    dot: 'bg-red-400' },
  { value: 'plan_to_watch', label: 'İzleyeceğim',  color: 'text-purple-400', dot: 'bg-purple-400' },
  { value: 'on_hold',       label: 'Askıda',       color: 'text-yellow-400', dot: 'bg-yellow-400' },
]

function getOption(status: string | null | undefined) {
  return STATUS_OPTIONS.find(o => o.value === status) ?? null
}

export default function WatchStatusButton({ mediaId, mediaType, isLoggedIn, initialStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<Status | null>(
    STATUS_OPTIONS.find(o => o.value === initialStatus) ? (initialStatus as Status) : null
  )
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fetch current status from API on mount (if not provided)
  useEffect(() => {
    if (!isLoggedIn) return
    if (initialStatus !== undefined) return // already have it
    fetch(`/api/watch-status?media_id=${mediaId}&media_type=${mediaType}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.status) setStatus(data.status as Status)
      })
      .catch(() => {})
  }, [mediaId, mediaType, isLoggedIn, initialStatus])

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function select(value: Status) {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setLoading(true)
    setOpen(false)
    try {
      await fetch('/api/watch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId, media_type: mediaType, status: value }),
      })
      setStatus(value)
    } catch {}
    setLoading(false)
  }

  async function remove() {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setLoading(true)
    setOpen(false)
    try {
      await fetch('/api/watch-status', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId, media_type: mediaType }),
      })
      setStatus(null)
    } catch {}
    setLoading(false)
  }

  function handleButtonClick() {
    if (!isLoggedIn) { router.push('/auth/giris'); return }
    setOpen(prev => !prev)
  }

  const current = getOption(status)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
          current
            ? 'bg-[--bg-card] border-[--border] hover:border-white/20'
            : 'bg-[--bg-card] border-[--border] text-[--text-secondary] hover:text-white hover:border-white/20'
        } ${loading ? 'opacity-60 cursor-wait' : ''}`}
      >
        {current ? (
          <>
            <span className={`w-2 h-2 rounded-full shrink-0 ${current.dot}`} />
            <span className={current.color}>{current.label}</span>
          </>
        ) : (
          <span>İzleme Durumu</span>
        )}
        <span className="text-[--text-secondary] text-xs ml-0.5">▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-[200] min-w-[180px] rounded-2xl border border-[--border] shadow-2xl overflow-hidden"
          style={{ background: 'rgba(11,15,25,0.97)', backdropFilter: 'blur(16px)' }}
        >
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[--text-secondary]">Durum Seç</p>
          </div>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                status === opt.value ? opt.color + ' font-semibold' : 'text-[--text-secondary] hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
              {opt.label}
            </button>
          ))}
          {status && (
            <>
              <div className="border-t border-[--border]/50 mx-3 my-1" />
              <button
                onClick={remove}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[--text-secondary] hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <span className="w-2 h-2 rounded-full shrink-0 bg-[--text-secondary]/30" />
                Kaldır
              </button>
            </>
          )}
          <div className="pb-1" />
        </div>
      )}
    </div>
  )
}
