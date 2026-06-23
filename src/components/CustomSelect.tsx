'use client'

import { useState, useRef, useEffect } from 'react'
import { IconChevronDown } from '@/components/icons'

interface Option { value: string; label: string }

interface Props {
  value: string
  onChange: (val: string) => void
  options: Option[]
  active?: boolean
}

export default function CustomSelect({ value, onChange, options, active = false }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value) ?? options[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm outline-none cursor-pointer transition-colors ${
          active
            ? 'border-[--accent] text-white'
            : 'border-[--border] text-[--text-secondary]'
        } bg-[--bg-card] hover:border-[--accent]/60`}
      >
        <span>{selected.label}</span>
        <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-full max-h-64 overflow-y-auto rounded-lg border border-[--border] bg-[--bg-card] shadow-xl">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                o.value === value
                  ? 'bg-[--accent]/20 text-white font-medium'
                  : 'text-[--text-secondary] hover:bg-[--bg-secondary] hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
