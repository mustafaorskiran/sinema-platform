'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/context/LocaleContext'
import { IconStarFilled } from '@/components/icons'

interface Props {
  mediaId: number
  mediaType: 'film' | 'dizi'
  title: string
  year?: string
  poster?: string | null
  rating?: number | null
  children: React.ReactNode
}

export default function FilmPreviewPopup({
  mediaId,
  mediaType,
  title,
  year,
  poster,
  rating,
  children,
}: Props) {
  const { t } = useLocale()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const href = `/${mediaType === 'film' ? 'film' : 'dizi'}/${mediaId}`
  const posterUrl = poster
    ? `https://image.tmdb.org/t/p/w154${poster}`
    : null

  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 300)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {visible && (
        <span
          className="absolute top-full left-0 mt-2 w-48 z-[200] block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="block rounded-xl shadow-2xl p-3" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.98), rgba(14,20,32,0.99))', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Poster */}
            {posterUrl ? (
              <span className="block w-full h-28 rounded-lg overflow-hidden mb-2 relative">
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="block w-full h-28 rounded-lg bg-[--bg-card] mb-2 flex items-center justify-center">
                <span className="text-[--text-secondary] text-xs">{title[0]}</span>
              </span>
            )}

            {/* Başlık */}
            <span className="block text-sm font-semibold text-white truncate mb-0.5">
              {title}
            </span>

            {/* Yıl + badge */}
            <span className="flex items-center gap-1.5 mb-2">
              {year && (
                <span className="text-xs text-[--text-secondary]">{year}</span>
              )}
              <span
                className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  lineHeight: 1.4,
                }}
              >
                {mediaType === 'film' ? t('film.badge') : t('series.badge')}
              </span>
            </span>

            {/* Puan */}
            {rating != null && rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-[--gold] font-semibold mb-2">
                <IconStarFilled size={12} /> {rating.toFixed(1)}
              </span>
            )}

            {/* Link */}
            <Link
              href={href}
              prefetch={false}
              className="block text-center text-xs font-medium text-[--accent] hover:underline mt-1"
            >
              {t('filmPreviewPopup.goToDetail')} →
            </Link>
          </span>
        </span>
      )}
    </span>
  )
}
