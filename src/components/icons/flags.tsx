/**
 * Dairesel bayrak ikonları — dil seçici için.
 * Emoji bayraklar Windows'ta "TR", "GB" gibi düz metin kısaltmalarına
 * düşebildiğinden, burada platformdan bağımsız SVG bayraklar kullanılıyor.
 *
 * Kullanım: import { FlagIcon } from '@/components/icons/flags'
 */

import type { Locale } from '@/lib/i18n-config'

interface FlagProps {
  size?: number
  className?: string
}

function Circle({ size = 20, className = '', id, children }: FlagProps & { id: string; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id={id}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
      <circle cx="16" cy="16" r="15.5" fill="none" stroke="rgba(255,255,255,0.16)" />
    </svg>
  )
}

const FlagTR = (p: FlagProps) => (
  <Circle {...p} id="flag-tr">
    <rect width="32" height="32" fill="#E30A17" />
    <circle cx="13.5" cy="16" r="7" fill="#fff" />
    <circle cx="15.3" cy="16" r="5.7" fill="#E30A17" />
    <path
      fill="#fff"
      d="M22.6 11.8l1.02 3.06 3.23.03-2.6 1.94.98 3.09-2.63-1.9-2.63 1.9.98-3.09-2.6-1.94 3.23-.03z"
    />
  </Circle>
)

const FlagGB = (p: FlagProps) => (
  <Circle {...p} id="flag-gb">
    <rect width="32" height="32" fill="#012169" />
    <path d="M0 0l32 32M32 0L0 32" stroke="#fff" strokeWidth="6" />
    <path d="M0 0l32 32M32 0L0 32" stroke="#C8102E" strokeWidth="2.4" />
    <path d="M16 0v32M0 16h32" stroke="#fff" strokeWidth="10" />
    <path d="M16 0v32M0 16h32" stroke="#C8102E" strokeWidth="4" />
  </Circle>
)

const FlagDE = (p: FlagProps) => (
  <Circle {...p} id="flag-de">
    <rect width="32" height="10.67" fill="#000" />
    <rect y="10.67" width="32" height="10.67" fill="#DD0000" />
    <rect y="21.33" width="32" height="10.67" fill="#FFCE00" />
  </Circle>
)

const FlagNL = (p: FlagProps) => (
  <Circle {...p} id="flag-nl">
    <rect width="32" height="10.67" fill="#AE1C28" />
    <rect y="10.67" width="32" height="10.67" fill="#fff" />
    <rect y="21.33" width="32" height="10.67" fill="#21468B" />
  </Circle>
)

const FlagFR = (p: FlagProps) => (
  <Circle {...p} id="flag-fr">
    <rect width="10.67" height="32" fill="#002395" />
    <rect x="10.67" width="10.67" height="32" fill="#fff" />
    <rect x="21.33" width="10.67" height="32" fill="#ED2939" />
  </Circle>
)

const FlagGA = (p: FlagProps) => (
  <Circle {...p} id="flag-ga">
    <rect width="10.67" height="32" fill="#169B62" />
    <rect x="10.67" width="10.67" height="32" fill="#fff" />
    <rect x="21.33" width="10.67" height="32" fill="#FF883E" />
  </Circle>
)

const FlagPT = (p: FlagProps) => (
  <Circle {...p} id="flag-pt">
    <rect width="32" height="32" fill="#FF0000" />
    <rect width="12.8" height="32" fill="#046A38" />
    <circle cx="12.8" cy="16" r="5.5" fill="#FFCC00" stroke="#046A38" strokeWidth="0.8" />
  </Circle>
)

const FlagZH = (p: FlagProps) => {
  const star = (cx: number, cy: number, r: number, rot = 0) => (
    <path
      transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${r})`}
      fill="#FFDE00"
      d="M0 -1L0.588 0.809 -0.951 -0.309H0.951L-0.588 0.809Z"
    />
  )
  return (
    <Circle {...p} id="flag-zh">
      <rect width="32" height="32" fill="#DE2910" />
      {star(7, 8, 3.4, -20)}
      {star(13.5, 4, 1.1, 10)}
      {star(15.5, 7.6, 1.1, 30)}
      {star(15, 11.6, 1.1, 5)}
      {star(12, 13.6, 1.1, -20)}
    </Circle>
  )
}

const FlagJA = (p: FlagProps) => (
  <Circle {...p} id="flag-ja">
    <rect width="32" height="32" fill="#fff" />
    <circle cx="16" cy="16" r="8" fill="#BC002D" />
  </Circle>
)

const FLAG_MAP: Record<Locale, (p: FlagProps) => React.ReactElement> = {
  tr: FlagTR,
  en: FlagGB,
  de: FlagDE,
  nl: FlagNL,
  fr: FlagFR,
  ga: FlagGA,
  pt: FlagPT,
  zh: FlagZH,
  ja: FlagJA,
}

export function FlagIcon({ code, size = 20, className = '' }: FlagProps & { code: Locale }) {
  const Flag = FLAG_MAP[code] ?? FlagTR
  return <Flag size={size} className={className} />
}
