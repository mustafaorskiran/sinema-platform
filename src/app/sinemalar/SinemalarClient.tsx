'use client'

import { useState, type ReactNode, type ComponentType } from 'react'
import Link from 'next/link'
import {
  IconFilm, IconCalendarDays, IconBuilding, IconStarFilled, IconMapPin,
  IconClapperboard, IconMasks, IconTent, IconAnchor, IconSparkles, IconTicket,
} from '@/components/icons'

type Tab = 'vizyonda' | 'yakinda' | 'zincirler'

interface MovieItem {
  id: number
  title: string
  year: string
  poster: string | null
  rating: number
  release_date: string
}

interface UpcomingItem extends MovieItem {
  daysUntil: string | null
  formattedDate: string
}

interface Zincir {
  name: string
  logo: string
  url: string
  desc: string
}

interface Props {
  nowPlaying: MovieItem[]
  upcoming: UpcomingItem[]
  zincirleri: Zincir[]
}

// Sinema zinciri "logo" emojisini SVG ikonuna eşler (veri kaynağı hâlâ emoji tutuyor)
const ZINCIR_LOGO_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  '🎬': IconClapperboard,
  '🎭': IconMasks,
  '🎪': IconTent,
  '⚓': IconAnchor,
  '🌟': IconSparkles,
  '🎟️': IconTicket,
  '📽️': IconFilm,
  '🏢': IconBuilding,
}

export default function SinemalarClient({ nowPlaying, upcoming, zincirleri }: Props) {
  const [tab, setTab] = useState<Tab>('vizyonda')

  const tabs: { key: Tab; icon: ReactNode; label: string; count?: number }[] = [
    { key: 'vizyonda', icon: <IconFilm size={16} />, label: 'Vizyonda', count: nowPlaying.length },
    { key: 'yakinda', icon: <IconCalendarDays size={16} />, label: 'Yakında', count: upcoming.length },
    { key: 'zincirler', icon: <IconBuilding size={16} />, label: 'Sinema Zincirleri' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-8 rounded-xl p-1 w-fit" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-[--accent] text-white'
                : 'text-[--text-secondary] hover:text-white'
            }`}
          >
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Vizyonda */}
      {tab === 'vizyonda' && (
        <div>
          <p className="text-sm text-[--text-secondary] mb-5">
            Türkiye'de şu an gösterimde olan filmler · Bilet için sinema zinciri sitelerini ziyaret et
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {nowPlaying.map(movie => (
              <div key={movie.id} className="group">
                <Link href={`/film/${movie.id}`}>
                  <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {movie.poster
                      ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                      : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center">{movie.title}</div>
                    }
                    {/* Vizyonda rozeti */}
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-bold uppercase bg-[--accent] text-white px-1.5 py-0.5 rounded">Vizyonda</span>
                    </div>
                    {movie.rating > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-[--gold] flex items-center gap-0.5">
                        <IconStarFilled size={11} /> {movie.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-white font-medium line-clamp-1 group-hover:text-[--accent] transition-colors">{movie.title}</p>
                  <p className="text-[10px] text-[--text-secondary]">{movie.year}</p>
                </Link>
                <a
                  href={`https://biletinial.com/tr-tr/sinema?q=${encodeURIComponent(movie.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-[10px] text-[--accent] hover:underline"
                >
                  Bilet Al →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yakında */}
      {tab === 'yakinda' && (
        <div>
          <p className="text-sm text-[--text-secondary] mb-5">
            Yakında Türkiye'de vizyona girecek filmler
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {upcoming.map((movie) => (
              <div key={movie.id} className="group">
                <Link href={`/film/${movie.id}`}>
                  <div className="aspect-[2/3] rounded-xl overflow-hidden rounded-xl group-hover:border-[--accent]/50 transition-colors relative" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {movie.poster
                      ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                      : <div className="w-full h-full flex items-center justify-center text-[--text-secondary] text-xs p-2 text-center">{movie.title}</div>
                    }
                    {movie.daysUntil && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-2 py-2">
                        <p className="text-[10px] font-semibold text-[--gold]">{movie.daysUntil}</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-white font-medium line-clamp-1 group-hover:text-[--accent] transition-colors">{movie.title}</p>
                  <p className="text-[10px] text-[--text-secondary]">{movie.formattedDate}</p>
                </Link>
              </div>
            ))}
          </div>
          {upcoming.length === 0 && (
            <div className="py-16 text-center text-[--text-secondary] text-sm">
              Yakında vizyon filmi bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* Sinema Zincirleri */}
      {tab === 'zincirler' && (
        <div>
          <p className="text-sm text-[--text-secondary] mb-5">
            Türkiye'nin büyük sinema zincirleri ve bilet siteleri
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {zincirleri.map(z => {
              const LogoIcon = ZINCIR_LOGO_ICONS[z.logo] ?? IconBuilding
              return (
              <a
                key={z.name}
                href={z.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-xl hover:border-[--accent]/40 transition-colors group" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <LogoIcon size={32} className="shrink-0 text-[--accent]" />
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-[--accent] transition-colors">{z.name}</p>
                  <p className="text-xs text-[--text-secondary] mt-0.5">{z.desc}</p>
                </div>
                <span className="text-xs text-[--text-secondary] shrink-0">→</span>
              </a>
              )
            })}
          </div>

          <div className="mt-8 rounded-xl p-5" style={{ background: 'linear-gradient(160deg, rgba(20,28,47,0.9), rgba(14,20,32,0.95))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5"><IconMapPin size={16} /> Şehrine göre sinema bul</p>
            <p className="text-xs text-[--text-secondary] mb-3">
              Bulunduğun şehirdeki sinemaları ve seans saatlerini görmek için aşağıdaki siteleri kullanabilirsin:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Sinemalar.com', url: 'https://www.sinemalar.com' },
                { label: 'Beyazperde Seanslar', url: 'https://www.beyazperde.com/sinemalar/' },
                { label: 'Biletinial', url: 'https://biletinial.com/tr-tr/sinema' },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full text-xs text-white/40 hover:text-white hover:border-white/30 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
