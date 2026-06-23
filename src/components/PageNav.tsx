'use client'

import { useEffect, useState } from 'react'

interface Section { id: string; label: string }

interface Props { sections: Section[] }

export default function PageNav({ sections }: Props) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="sticky top-16 z-30 bg-[--bg-primary]/90 backdrop-blur-sm border-b border-[--border] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 mt-6">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
        {sections.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={e => {
              e.preventDefault()
              document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              active === s.id
                ? 'bg-[--accent] text-white'
                : 'text-[--text-secondary] hover:text-white hover:bg-white/5'
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  )
}
