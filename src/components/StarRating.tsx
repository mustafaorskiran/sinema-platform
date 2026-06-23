'use client'

import { useState } from 'react'
import { IconStarFilled, IconStar } from '@/components/icons'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button key={star} type="button" disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          {star <= display
            ? <IconStarFilled className={`${sizes[size]} text-[--gold] transition-colors`} />
            : <IconStar className={`${sizes[size]} text-[--border] transition-colors`} />
          }
        </button>
      ))}
      {value > 0 && <span className="ml-2 text-sm font-semibold text-[--gold]">{value}/10</span>}
    </div>
  )
}
