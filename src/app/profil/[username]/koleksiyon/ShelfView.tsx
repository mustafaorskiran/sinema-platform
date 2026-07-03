'use client'

import Link from 'next/link'
import { IconLaptop, IconDisc, IconCassette, IconPackage } from '@/components/icons'
import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>

interface Item {
  id: string
  media_id: number
  media_type: string
  title: string
  year: string
  poster: string | null
  format: string
}

interface Props {
  items: Item[]
}

const FORMAT_INFO: Record<string, { label: string; icon: IconType; shelfColor: string }> = {
  dijital: { label: 'Dijital', icon: IconLaptop, shelfColor: '#1e40af' },
  bluray:  { label: 'Blu-ray', icon: IconDisc, shelfColor: '#0369a1' },
  dvd:     { label: 'DVD', icon: IconDisc, shelfColor: '#5b21b6' },
  vhs:     { label: 'VHS', icon: IconCassette, shelfColor: '#92400e' },
}

const SHELF_HEIGHT = 160 // px — poster yüksekliği
const ITEMS_PER_SHELF = 8

export default function ShelfView({ items }: Props) {
  const groups: Record<string, Item[]> = {}
  for (const item of items) {
    if (!groups[item.format]) groups[item.format] = []
    groups[item.format].push(item)
  }

  return (
    <div className="space-y-10">
      {Object.entries(groups).map(([format, groupItems]) => {
        const info = FORMAT_INFO[format] ?? { label: format, icon: IconPackage, shelfColor: '#374151' }
        const rows: Item[][] = []
        for (let i = 0; i < groupItems.length; i += ITEMS_PER_SHELF) {
          rows.push(groupItems.slice(i, i + ITEMS_PER_SHELF))
        }

        return (
          <section key={format}>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center"><info.icon size={20} /></span>
              <h2 className="text-base font-bold text-white">{info.label}</h2>
              <span className="text-sm text-[--text-secondary]">({groupItems.length})</span>
            </div>

            <div className="space-y-6">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="relative">
                  {/* Raf tahtası */}
                  <div className="relative flex items-end gap-1 px-4 pt-4 pb-0 min-h-[180px]"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent 20%)' }}>
                    {/* İçerikler */}
                    <div className="flex gap-1 flex-wrap items-end">
                      {row.map(item => (
                        <Link
                          key={item.id}
                          href={`/${item.media_type}/${item.media_id}`}
                          className="group relative shrink-0 transition-transform duration-200 hover:-translate-y-2"
                          style={{ width: 80, height: SHELF_HEIGHT }}
                          title={`${item.title} (${item.year})`}
                        >
                          {/* Poster */}
                          {item.poster ? (
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-t-sm"
                              style={{
                                boxShadow: '-3px 0 8px rgba(0,0,0,0.5), 3px 0 4px rgba(0,0,0,0.3)',
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full rounded-t-sm flex items-center justify-center p-1 text-center"
                              style={{
                                background: `linear-gradient(135deg, ${info.shelfColor}cc, ${info.shelfColor}66)`,
                                boxShadow: '-3px 0 8px rgba(0,0,0,0.5)',
                              }}
                            >
                              <span className="text-[9px] text-white font-medium leading-tight">{item.title}</span>
                            </div>
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-[--accent]/20 rounded-t-sm transition-colors" />

                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {item.title} {item.year && `(${item.year})`}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Raf tahtası alt kısmı */}
                  <div
                    className="h-4 rounded-b-sm mx-0"
                    style={{
                      background: `linear-gradient(to bottom, ${info.shelfColor}cc, ${info.shelfColor}88)`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    }}
                  />
                  <div
                    className="h-1.5 mx-2 rounded-b"
                    style={{
                      background: `linear-gradient(to bottom, ${info.shelfColor}44, transparent)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
