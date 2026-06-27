'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IconStar } from '@/components/icons'

interface Item {
  id: number
  title: string
  poster: string | null
  rating: number
  type: string
  overlap: number
}

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
}

export default function SimilarWatchers({ mediaId, mediaType }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/similar-watchers?media_id=${mediaId}&media_type=${mediaType}`)
      .then(r => r.json())
      .then(data => {
        setItems(data.results ?? [])
        setCount(data.count ?? 0)
      })
      .finally(() => setLoading(false))
  }, [mediaId, mediaType])

  if (loading) return null
  if (items.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          Bunu İzleyenler Şunu da İzledi
        </h2>
        {count > 0 && (
          <span className="text-xs text-[--text-secondary]">{count} ortak izleyici</span>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map(item => (
          <Link
            key={item.id}
            href={`/${item.type}/${item.id}`}
            className="group"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <span className="text-[--text-secondary] text-xs text-center line-clamp-3">{item.title}</span>
                </div>
              )}
              {item.overlap >= 2 && (
                <div className="absolute top-1.5 right-1.5 bg-[--accent]/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.overlap}×
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-white line-clamp-1 group-hover:text-[--accent] transition-colors">{item.title}</p>
            {item.rating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <IconStar className="h-3 w-3 text-[--gold]" />
                <span className="text-[10px] text-[--gold]">{item.rating.toFixed(1)}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
