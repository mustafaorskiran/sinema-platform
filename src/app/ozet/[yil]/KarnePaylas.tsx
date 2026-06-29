'use client'
import { useState } from 'react'

interface Props {
  year: number
  totalFilm: number
  totalDizi: number
  totalReviews: number
  username: string
}

export default function KarnePaylas({ year, totalFilm, totalDizi, totalReviews, username }: Props) {
  const [shared, setShared] = useState(false)

  async function share() {
    const text = `🎬 ${year} Sinema Karnem\n🎥 ${totalFilm} Film · 📺 ${totalDizi} Dizi · ✍️ ${totalReviews} Yorum\n@${username} — Sinezon`
    const url = `https://sinema-platform.vercel.app/ozet/${year}`
    if (navigator.share) {
      try { await navigator.share({ title: `${year} Sinema Karnem`, text, url }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setShared(true)
      setTimeout(() => setShared(false), 2500)
    }
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
      style={{ background: shared ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)', border: shared ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)', color: shared ? '#34d399' : 'rgba(255,255,255,0.7)' }}>
      {shared ? '✓ Kopyalandı!' : '📤 Karneyi Paylaş'}
    </button>
  )
}
