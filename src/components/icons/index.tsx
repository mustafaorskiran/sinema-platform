/**
 * Sinezon SVG İkon Kütüphanesi
 * Tüm ikonlar bu dosyadan import edilmeli.
 * Lucide veya başka bir ikon kütüphanesinden direkt import yapma.
 *
 * Kullanım: import { IconStar, IconFilm } from '@/components/icons'
 */

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  strokeWidth?: number
}

function icon(paths: React.ReactNode, opts?: { fill?: boolean }) {
  return function Icon({ size = 24, strokeWidth = 2, className = '', ...props }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={opts?.fill ? 'currentColor' : 'none'}
        stroke={opts?.fill ? 'none' : 'currentColor'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    )
  }
}

// ─── Navigasyon ────────────────────────────────────────────────────────────────

export const IconHome = icon(<>
  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
  <path d="M9 21V12h6v9" />
</>)

export const IconSearch = icon(<>
  <circle cx="11" cy="11" r="7" />
  <path d="m21 21-4.35-4.35" />
</>)

export const IconMenu = icon(<>
  <line x1="4" y1="7" x2="20" y2="7" />
  <line x1="4" y1="12" x2="20" y2="12" />
  <line x1="4" y1="17" x2="20" y2="17" />
</>)

export const IconClose = icon(<>
  <path d="M18 6 6 18M6 6l12 12" />
</>)

export const IconChevronLeft = icon(<path d="m15 18-6-6 6-6" />)
export const IconChevronRight = icon(<path d="m9 18 6-6-6-6" />)
export const IconChevronDown = icon(<path d="m6 9 6 6 6-6" />)
export const IconChevronUp = icon(<path d="m18 15-6-6-6 6" />)
export const IconArrowLeft = icon(<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>)
export const IconArrowRight = icon(<><path d="m12 5 7 7-7 7" /><path d="M5 12h14" /></>)

// ─── Sinema & İçerik ──────────────────────────────────────────────────────────

/** Film makarası */
export const IconFilm = icon(<>
  <rect x="2" y="2" width="20" height="20" rx="2.18" />
  <line x1="7" y1="2" x2="7" y2="22" />
  <line x1="17" y1="2" x2="17" y2="22" />
  <line x1="2" y1="12" x2="22" y2="12" />
  <line x1="2" y1="7" x2="7" y2="7" />
  <line x1="2" y1="17" x2="7" y2="17" />
  <line x1="17" y1="17" x2="22" y2="17" />
  <line x1="17" y1="7" x2="22" y2="7" />
</>)

/** Klakör */
export const IconClapperboard = icon(<>
  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
  <path d="M20 8H4L2 4h20Z" />
  <path d="m7 4 1 4" />
  <path d="m12 4 1 4" />
  <path d="m17 4 1 4" />
</>)

/** TV Ekranı / Dizi */
export const IconTv = icon(<>
  <rect x="2" y="7" width="20" height="13" rx="2" />
  <polyline points="12 17 12 20 8 20" />
  <polyline points="12 20 16 20" />
  <path d="m7.5 3 4.5 4 4.5-4" />
</>)

/** Oynat */
export const IconPlay = icon(<>
  <circle cx="12" cy="12" r="10" />
  <polygon points="10 8 16 12 10 16 10 8" />
</>)

/** Karıştır / Rastgele */
export const IconShuffle = icon(<>
  <polyline points="16 3 21 3 21 8" />
  <line x1="4" y1="20" x2="21" y2="3" />
  <polyline points="21 16 21 21 16 21" />
  <line x1="15" y1="15" x2="21" y2="21" />
  <line x1="4" y1="4" x2="9" y2="9" />
</>)

// ─── Puanlama ─────────────────────────────────────────────────────────────────

/** Yıldız (boş) */
export const IconStar = icon(<>
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
</>)

/** Yıldız (dolu) */
export const IconStarFilled = icon(
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  { fill: true }
)

// ─── Sosyal ───────────────────────────────────────────────────────────────────

/** Kalp / Beğeni */
export const IconHeart = icon(<>
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
</>)

/** Kalp (dolu) */
export const IconHeartFilled = icon(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  { fill: true }
)

/** Yer imi / Watchlist */
export const IconBookmark = icon(<>
  <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
</>)

/** Yer imi (dolu) */
export const IconBookmarkFilled = icon(
  <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  { fill: true }
)

/** Yorum balonu */
export const IconMessageSquare = icon(<>
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
</>)

/** Yanıtla */
export const IconReply = icon(<>
  <polyline points="9 17 4 12 9 7" />
  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
</>)

/** Gönder */
export const IconSend = icon(<>
  <line x1="22" y1="2" x2="11" y2="13" />
  <polygon points="22 2 15 22 11 13 2 9 22 2" />
</>)

/** Zil / Bildirim */
export const IconBell = icon(<>
  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
</>)

/** Feed / Akış */
export const IconRss = icon(<>
  <path d="M4 11a9 9 0 0 1 9 9" />
  <path d="M4 4a16 16 0 0 1 16 16" />
  <circle cx="5" cy="19" r="1" />
</>)

// ─── Kullanıcı ────────────────────────────────────────────────────────────────

export const IconUser = icon(<>
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</>)

export const IconUsers = icon(<>
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
</>)

export const IconUserPlus = icon(<>
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <line x1="19" y1="8" x2="19" y2="14" />
  <line x1="16" y1="11" x2="22" y2="11" />
</>)

export const IconUserCheck = icon(<>
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <polyline points="16 11 18 13 22 9" />
</>)

export const IconLogOut = icon(<>
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  <polyline points="16 17 21 12 16 7" />
  <line x1="21" y1="12" x2="9" y2="12" />
</>)

// ─── Admin & Güvenlik ─────────────────────────────────────────────────────────

export const IconShield = icon(<>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</>)

export const IconShieldOff = icon(<>
  <path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18" />
  <path d="M4.73 4.73 4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38" />
  <line x1="1" y1="1" x2="23" y2="23" />
</>)

export const IconBan = icon(<>
  <circle cx="12" cy="12" r="10" />
  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
</>)

export const IconAlertTriangle = icon(<>
  <path d="m10.29 3.86-8.17 14.12A2 2 0 0 0 3.85 21h16.28a2 2 0 0 0 1.73-3.02L13.71 3.86a2 2 0 0 0-3.42 0z" />
  <line x1="12" y1="9" x2="12" y2="13" />
  <line x1="12" y1="17" x2="12.01" y2="17" />
</>)

export const IconLayoutDashboard = icon(<>
  <rect x="3" y="3" width="7" height="9" rx="1" />
  <rect x="14" y="3" width="7" height="5" rx="1" />
  <rect x="14" y="12" width="7" height="9" rx="1" />
  <rect x="3" y="16" width="7" height="5" rx="1" />
</>)

// ─── Liste & Düzen ────────────────────────────────────────────────────────────

export const IconList = icon(<>
  <line x1="8" y1="6" x2="21" y2="6" />
  <line x1="8" y1="12" x2="21" y2="12" />
  <line x1="8" y1="18" x2="21" y2="18" />
  <line x1="3" y1="6" x2="3.01" y2="6" />
  <line x1="3" y1="12" x2="3.01" y2="12" />
  <line x1="3" y1="18" x2="3.01" y2="18" />
</>)

export const IconGrid = icon(<>
  <rect x="3" y="3" width="7" height="7" rx="1" />
  <rect x="14" y="3" width="7" height="7" rx="1" />
  <rect x="3" y="14" width="7" height="7" rx="1" />
  <rect x="14" y="14" width="7" height="7" rx="1" />
</>)

export const IconListPlus = icon(<>
  <path d="M11 12H3" />
  <path d="M16 6H3" />
  <path d="M16 18H3" />
  <path d="M18 9v6" />
  <path d="M21 12h-6" />
</>)

export const IconLayers = icon(<>
  <polygon points="12 2 2 7 12 12 22 7 12 2" />
  <polyline points="2 17 12 22 22 17" />
  <polyline points="2 12 12 17 22 12" />
</>)

export const IconPlus = icon(<>
  <line x1="12" y1="5" x2="12" y2="19" />
  <line x1="5" y1="12" x2="19" y2="12" />
</>)

export const IconTrash = icon(<>
  <polyline points="3 6 5 6 21 6" />
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  <line x1="10" y1="11" x2="10" y2="17" />
  <line x1="14" y1="11" x2="14" y2="17" />
</>)

export const IconPencil = icon(<>
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
</>)

export const IconSettings = icon(<>
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
</>)

export const IconSlidersHorizontal = icon(<>
  <line x1="21" y1="6" x2="3" y2="6" />
  <line x1="17" y1="12" x2="3" y2="12" />
  <line x1="13" y1="18" x2="3" y2="18" />
  <circle cx="19" cy="6" r="2" />
  <circle cx="15" cy="12" r="2" />
  <circle cx="11" cy="18" r="2" />
</>)

// ─── Durum & Onay ─────────────────────────────────────────────────────────────

export const IconCheck = icon(<polyline points="20 6 9 17 4 12" />)

export const IconCheckCircle = icon(<>
  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
  <polyline points="22 4 12 14.01 9 11.01" />
</>)

export const IconTrendingUp = icon(<>
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  <polyline points="17 6 23 6 23 12" />
</>)

export const IconGlobe = icon(<>
  <circle cx="12" cy="12" r="10" />
  <line x1="2" y1="12" x2="22" y2="12" />
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
</>)

export const IconLock = icon(<>
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
</>)

export const IconWifiOff = icon(<>
  <line x1="1" y1="1" x2="23" y2="23" />
  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
  <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
  <line x1="12" y1="20" x2="12.01" y2="20" />
</>)

// ─── Medya & Zaman ────────────────────────────────────────────────────────────

export const IconClock = icon(<>
  <circle cx="12" cy="12" r="10" />
  <polyline points="12 6 12 12 16 14" />
</>)

export const IconFire = icon(<>
  <path d="M12 2c0 0-4 4-4 8a4 4 0 0 0 8 0c0-1.5-.5-2.5-.5-2.5S14 9 12 9c-1 0-2-.5-2-2 0-1 .5-2 2-3z" />
  <path d="M12 22c-3.3 0-6-2.7-6-6 0-3 2-5.5 4-7 0 1.5 1 3 3 3s3-1.5 3-3c2 1.5 4 4 4 7 0 3.3-2.7 6-6 6z" />
</>)

export const IconCalendar = icon(<>
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
</>)

export const IconCalendarDays = icon(<>
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
  <line x1="8" y1="14" x2="8" y2="14" />
  <line x1="12" y1="14" x2="12" y2="14" />
  <line x1="16" y1="14" x2="16" y2="14" />
  <line x1="8" y1="18" x2="8" y2="18" />
  <line x1="12" y1="18" x2="12" y2="18" />
</>)

export const IconMapPin = icon(<>
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
  <circle cx="12" cy="10" r="3" />
</>)

// ─── Form & Hesap ─────────────────────────────────────────────────────────────

export const IconEye = icon(<>
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
  <circle cx="12" cy="12" r="3" />
</>)

export const IconEyeOff = icon(<>
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
  <line x1="1" y1="1" x2="23" y2="23" />
</>)

export const IconMail = icon(<>
  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
  <polyline points="22,6 12,13 2,6" />
</>)

export const IconCamera = icon(<>
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
  <circle cx="12" cy="13" r="4" />
</>)

// ─── Yükleniyor ───────────────────────────────────────────────────────────────

/** Spinner — animate-spin class ile kullan */
export const IconLoader = icon(<>
  <line x1="12" y1="2" x2="12" y2="6" />
  <line x1="12" y1="18" x2="12" y2="22" />
  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
  <line x1="2" y1="12" x2="6" y2="12" />
  <line x1="18" y1="12" x2="22" y2="12" />
  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
</>)

// ─── Tema ─────────────────────────────────────────────────────────────────────

export const IconSun = icon(<>
  <circle cx="12" cy="12" r="5" />
  <line x1="12" y1="1" x2="12" y2="3" />
  <line x1="12" y1="21" x2="12" y2="23" />
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
  <line x1="1" y1="12" x2="3" y2="12" />
  <line x1="21" y1="12" x2="23" y2="12" />
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
</>)

export const IconMoon = icon(<>
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
</>)

export const IconCopy = icon(<>
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</>)

export const IconExpand = icon(<>
  <path d="M15 3h6v6" /><path d="M9 21H3v-6" />
  <path d="m21 3-7 7" /><path d="m3 21 7-7" />
</>)

// ─── Tür & Ruh Hali ───────────────────────────────────────────────────────────

/** Tiyatro maskeleri — dram/komedi */
export const IconMasks = icon(<>
  <path d="M8.5 12.5c1 1.5 2.5 1.5 3.5 0" />
  <path d="M3 6c2-2 6-3 9-1 2-3 7-2 9 1-1 6-4 10-9 10S4 12 3 6z" />
  <circle cx="7.5" cy="8" r=".6" fill="currentColor" stroke="none" />
  <circle cx="16.5" cy="8" r=".6" fill="currentColor" stroke="none" />
</>)

/** Gülen yüz — komedi */
export const IconLaugh = icon(<>
  <circle cx="12" cy="12" r="10" />
  <path d="M7 13a5 5 0 0 0 10 0z" />
  <line x1="9" y1="9" x2="9.01" y2="9" />
  <line x1="15" y1="9" x2="15.01" y2="9" />
</>)

/** Hayalet — korku */
export const IconGhost = icon(<>
  <path d="M9 10h.01M15 10h.01" />
  <path d="M4 21V11a8 8 0 0 1 16 0v10l-2.5-1.8L15 21l-2-1.8L11 21l-2.5-1.8z" />
</>)

/** Roket — bilim kurgu */
export const IconRocket = icon(<>
  <path d="M12 2c3 1 5.5 4 5.5 8.5C17.5 15 14 18 12 21c-2-3-5.5-6-5.5-10.5C6.5 6 9 3 12 2z" />
  <circle cx="12" cy="10" r="2" />
  <path d="M7 16c-1.5.5-2.5 2-3 4 2-.5 3.5-1.5 4-3" />
  <path d="M17 16c1.5.5 2.5 2 3 4-2-.5-3.5-1.5-4-3" />
</>)

/** Harita — macera */
export const IconMap = icon(<>
  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
  <line x1="9" y1="3" x2="9" y2="18" />
  <line x1="15" y1="6" x2="15" y2="21" />
</>)

/** Parşömen — tarih */
export const IconScroll = icon(<>
  <path d="M8 21a2 2 0 0 1-2-2V5a2 2 0 0 1 4 0v13a1 1 0 0 0 1 1h9a2 2 0 0 0 2-2v-2H10" />
  <path d="M6 3h9a2 2 0 0 1 2 2v9" />
</>)

/** Nota — müzik */
export const IconMusic = icon(<>
  <path d="M9 18V5l12-2v13" />
  <circle cx="6" cy="18" r="3" />
  <circle cx="18" cy="16" r="3" />
</>)

/** Mikrofon */
export const IconMic = icon(<>
  <rect x="9" y="2" width="6" height="12" rx="3" />
  <path d="M5 10a7 7 0 0 0 14 0" />
  <line x1="12" y1="17" x2="12" y2="22" />
  <line x1="8" y1="22" x2="16" y2="22" />
</>)

/** Aile */
export const IconFamily = icon(<>
  <circle cx="7" cy="6" r="2.5" />
  <circle cx="17" cy="6" r="2.5" />
  <circle cx="12" cy="9" r="2" />
  <path d="M2 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 3 1.4" />
  <path d="M22 21v-2a4 4 0 0 0-4-4h-2a4 4 0 0 0-3 1.4" />
  <path d="M9 21v-1a3 3 0 0 1 3-3 3 3 0 0 1 3 3v1" />
</>)

/** Palet — animasyon */
export const IconPalette = icon(<>
  <path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.5A5.5 5.5 0 0 0 22 10c0-4.4-4.5-8-10-8z" />
  <circle cx="7" cy="10" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="11" cy="7" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="16" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="8" cy="15" r="1.2" fill="currentColor" stroke="none" />
</>)

/** Sihirli değnek — fantezi */
export const IconWand = icon(<>
  <path d="m6 21 12-12" />
  <path d="M15 4h.01M20 9h.01M18 3l.6 1.4L20 5l-1.4.6L18 7l-.6-1.4L16 5l1.4-.6z" />
</>)

/** Şapka — western */
export const IconHat = icon(<>
  <path d="M4 16c0-4 3-9 8-9s8 5 8 9" />
  <ellipse cx="12" cy="16" rx="10" ry="2.5" />
  <ellipse cx="12" cy="16" rx="4" ry="1.2" />
</>)

/** Kılıçlar — savaş */
export const IconSwords = icon(<>
  <path d="m5 4 14 14M19 4 5 18" />
  <path d="M3 6l2-2 2 2M17 20l2-2 2 2M3 20l2 2 2-2M17 4l2 2 2-2" />
</>)

/** Parmak izi — suç */
export const IconFingerprint = icon(<>
  <path d="M12 3a7 7 0 0 1 7 7c0 2.5-.5 4.5-1 6" />
  <path d="M12 3a7 7 0 0 0-7 7c0 3 .5 5 1.5 7" />
  <path d="M9 10a3 3 0 0 1 6 0c0 4-2 6-2 9" />
  <path d="M12 10v2c0 3-1.5 5-1.5 7" />
  <path d="M6 10a6 6 0 0 1 1-3.4" />
</>)

/** Beyin */
export const IconBrain = icon(<>
  <path d="M9 4a2.5 2.5 0 0 0-2.5 2.5c0 .4.1.8.2 1.1A3 3 0 0 0 5 10.5 3 3 0 0 0 7 13.2 2.8 2.8 0 0 0 9 18a2.5 2.5 0 0 0 3-2.4V6.5A2.5 2.5 0 0 0 9 4z" />
  <path d="M15 4a2.5 2.5 0 0 1 2.5 2.5c0 .4-.1.8-.2 1.1A3 3 0 0 1 19 10.5 3 3 0 0 1 17 13.2 2.8 2.8 0 0 1 15 18a2.5 2.5 0 0 1-3-2.4V6.5A2.5 2.5 0 0 1 15 4z" />
</>)

/** Hap */
export const IconPill = icon(<>
  <rect x="3" y="10.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 14)" />
  <line x1="9" y1="9" x2="15" y2="15" />
</>)

/** Yarasa — evren teması */
export const IconBat = icon(<>
  <path d="M12 6c1-2 3-3 5-2-1 1-1.5 2-1.5 3 2-.5 4 0 5 2-2 0-3 .5-3.5 1.5C19 11 20 13 20 15c-2-1-4-1.5-5.5-1-.8.3-1.7 1.5-2.5 3-.8-1.5-1.7-2.7-2.5-3-1.5-.5-3.5 0-5.5 1 0-2 1-4 2.5-4.5C6 12 5 11.5 3 11.5c1-2 3-2.5 5-2-.5-1-1-2-1.5-3 2-1 4 0 5 2z" />
</>)

/** Yüzük — evren teması */
export const IconRing = icon(<>
  <circle cx="12" cy="15" r="6" />
  <path d="M9 9l3-6 3 6" />
</>)

/** Pati — hayvan/dino evreni */
export const IconPaw = icon(<>
  <circle cx="6" cy="9" r="2" />
  <circle cx="11" cy="6.5" r="2" />
  <circle cx="16" cy="9" r="2" />
  <path d="M8 16c0-2.5 2-4 4-4s4 1.5 4 4-2 3.5-4 3.5-4-1-4-3.5z" />
</>)

/** Araba — yarış evreni */
export const IconCar = icon(<>
  <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
  <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
  <circle cx="7.5" cy="17.5" r="1.5" />
  <circle cx="16.5" cy="17.5" r="1.5" />
</>)

/** Oyun kolu */
export const IconGamepad = icon(<>
  <path d="M6 12h4M8 10v4" />
  <circle cx="16" cy="11" r=".6" fill="currentColor" stroke="none" />
  <circle cx="18" cy="13" r=".6" fill="currentColor" stroke="none" />
  <path d="M17 7H7a5 5 0 0 0-5 5c0 3 1.5 5.5 3.5 5.5.9 0 1.5-.5 2-1.3l1-1.7h7l1 1.7c.5.8 1.1 1.3 2 1.3 2 0 3.5-2.5 3.5-5.5a5 5 0 0 0-5-5z" />
</>)

/** Ejderha — evren teması */
export const IconDragon = icon(<>
  <path d="M3 16c2-1 3-3 3-5 1 1 1 3 0 4 2 0 3-1 4-3 0 2 1 3 2 3 2 0 3-2 3-4 1 1 2 2 2 4 2-.5 3-2 3-4 1 2 1 5-1 6.5-2 1.5-5 1.5-7 .5-1.5 2-4 2.5-6 1.5" />
  <circle cx="19" cy="9" r=".6" fill="currentColor" stroke="none" />
</>)

/** Çiçek — gül/kiraz çiçeği */
export const IconFlower = icon(<>
  <circle cx="12" cy="12" r="2" />
  <path d="M12 10a3 3 0 1 1 3-3 3 3 0 0 1-3 3z" />
  <path d="M12 14a3 3 0 1 0 3 3 3 3 0 0 0-3-3z" />
  <path d="M10 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3z" />
  <path d="M14 12a3 3 0 1 1 3 3 3 3 0 0 1-3-3z" />
  <line x1="12" y1="16" x2="12" y2="22" />
</>)

/** Damla — kan/nem */
export const IconDroplet = icon(<path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z" />)

/** Elmas */
export const IconGem = icon(<>
  <path d="M6 3h12l4 6-10 12L2 9z" />
  <path d="M2 9h20M9 3l3 6-3 12M15 3l-3 6 3 12" />
</>)

/** Çapa — deniz sinemaları */
export const IconAnchor = icon(<>
  <circle cx="12" cy="5" r="2" />
  <line x1="12" y1="7" x2="12" y2="21" />
  <path d="M5 12H2a10 10 0 0 0 10 10 10 10 0 0 0 10-10h-3" />
  <line x1="8" y1="9" x2="16" y2="9" />
</>)

/** Çadır — festival/tören */
export const IconTent = icon(<>
  <path d="M12 3 3 19h18z" />
  <path d="M12 3v16" />
  <path d="M6.5 19 12 9l5.5 10" />
</>)

/** Bilet */
export const IconTicket = icon(<>
  <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
  <line x1="10" y1="6" x2="10" y2="18" strokeDasharray="2 2" />
</>)

/** Patlamış mısır */
export const IconPopcorn = icon(<>
  <path d="M7 9h10l-1 12H8z" />
  <path d="M9 9V6a1.5 1.5 0 0 1 3 0V4a1.5 1.5 0 0 1 3 0v2a1.5 1.5 0 0 1 3 1.5V9" />
  <line x1="10" y1="9" x2="9.3" y2="21" />
  <line x1="14" y1="9" x2="14.7" y2="21" />
</>)

/** Domates — Rotten Tomatoes */
export const IconTomato = icon(<>
  <circle cx="12" cy="13" r="8" />
  <path d="M9 5c1-1.5 2-2 3-2s2 .5 3 2" />
</>)

/** Madalya — sıralama */
export const IconMedal = icon(<>
  <path d="M8.5 3h7l2 6-5.5 4-5.5-4z" />
  <circle cx="12" cy="15" r="6" />
  <path d="M12 12v6M9.5 14l5 4M14.5 14l-5 4" />
</>)

/** Kupa — ödül */
export const IconTrophy = icon(<>
  <path d="M8 21h8M12 17v4" />
  <path d="M7 4h10v6a5 5 0 0 1-10 0z" />
  <path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5" />
</>)

/** Taç */
export const IconCrown = icon(<>
  <path d="m3 8 3 3 3-6 3 6 3-6 3 6 3-3-2 10H5z" />
  <line x1="5" y1="20" x2="19" y2="20" />
</>)

/** Pasta — yıl dönümü */
export const IconCake = icon(<>
  <path d="M12 2v3M9 2.5c0 1-.5 1-.5 2s.5 1 .5 2M15 2.5c0 1-.5 1-.5 2s.5 1 .5 2" />
  <path d="M4 21v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7z" />
  <path d="M4 21h16" />
  <path d="M4 16c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" />
</>)

/** Hediye */
export const IconGift = icon(<>
  <rect x="3" y="8" width="18" height="4" />
  <path d="M12 8v13M5 12v9h14v-9" />
  <path d="M12 8c-1.5-3-3-4.5-5-4S4 6.5 5.5 8H12zM12 8c1.5-3 3-4.5 5-4s3 2.5 1.5 4H12z" />
</>)

/** El sıkışma */
export const IconHandshake = icon(<>
  <path d="M2 12l4-4 5 5-2 2a2 2 0 0 1-3 0z" />
  <path d="M22 12l-4-4-5 5 2 2a2 2 0 0 0 3 0z" />
  <path d="M8 13l3 3a2 2 0 0 0 3 0l3-3M6 8l3-2 3 2" />
</>)

/** Parıltı */
export const IconSparkles = icon(<>
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
  <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" />
</>)

/** Alkış */
export const IconClap = icon(<>
  <path d="M8 13V6a1.5 1.5 0 0 1 3 0v5" />
  <path d="M11 11V4a1.5 1.5 0 0 1 3 0v7" />
  <path d="M14 11.5V6a1.5 1.5 0 0 1 3 0v9c0 3.5-2.5 6-6 6s-6-1.5-7-4l-1.5-3.5A1.5 1.5 0 1 1 5.2 12L8 13" />
</>)

/** Ağlayan yüz */
export const IconCry = icon(<>
  <circle cx="12" cy="12" r="10" />
  <path d="M8 15s1.5-2 4-2 4 2 4 2" />
  <line x1="9" y1="9" x2="9.01" y2="9" />
  <line x1="15" y1="9" x2="15.01" y2="9" />
  <path d="M8 12v4M16 12v4" />
</>)

/** Kızgın yüz */
export const IconAngry = icon(<>
  <circle cx="12" cy="12" r="10" />
  <path d="M8 15c1-1 2-1.5 4-1.5s3 .5 4 1.5" />
  <path d="M7.5 8.5l3 1.5M16.5 8.5l-3 1.5" />
</>)

/** Gülümseme */
export const IconSmile = icon(<>
  <circle cx="12" cy="12" r="10" />
  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
  <line x1="9" y1="9" x2="9.01" y2="9" />
  <line x1="15" y1="9" x2="15.01" y2="9" />
</>)

/** Gözlük — eleştirmen */
export const IconGlasses = icon(<>
  <circle cx="6.5" cy="14.5" r="3.5" />
  <circle cx="17.5" cy="14.5" r="3.5" />
  <path d="M10 14.5h4M3 14.5l-1-5.5a2 2 0 0 1 2-2.5M21 14.5l1-5.5a2 2 0 0 0-2-2.5" />
</>)

/** Düşünen yüz */
export const IconThinking = icon(<>
  <circle cx="12" cy="12" r="10" />
  <path d="M8.5 15c1-.5 2-.5 3 0" />
  <line x1="8" y1="9" x2="10" y2="9.5" />
  <line x1="16" y1="9" x2="14" y2="9.5" />
  <path d="M16 15a3 3 0 0 0 2-3" />
</>)

/** Robot — yapay zeka */
export const IconRobot = icon(<>
  <rect x="4" y="8" width="16" height="12" rx="2" />
  <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none" />
  <path d="M9 18h6M12 8V4M9 4h6" />
  <line x1="2" y1="13" x2="4" y2="13" />
  <line x1="20" y1="13" x2="22" y2="13" />
</>)

/** Yeniden döndür */
export const IconRotateCw = icon(<>
  <path d="M21 12a9 9 0 1 1-3-6.7" />
  <polyline points="21 3 21 9 15 9" />
</>)

/** Zar */
export const IconDice = icon(<>
  <rect x="3" y="3" width="18" height="18" rx="3" />
  <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
  <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
</>)

/** Kum saati */
export const IconHourglass = icon(<>
  <path d="M6 2h12M6 22h12" />
  <path d="M6 2c0 5 5 5 5 10s-5 5-5 10M18 2c0 5-5 5-5 10s5 5 5 10" />
</>)

/** Klasör */
export const IconFolder = icon(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />)

/** Yapboz — quiz */
export const IconPuzzle = icon(<>
  <path d="M8 4h4a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 0 0 3h4v4a1.5 1.5 0 0 1-3 0 1.5 1.5 0 0 0-3 0v4H6a2 2 0 0 1-2-2v-4a1.5 1.5 0 0 1 0-3 1.5 1.5 0 0 0 0-3V6a2 2 0 0 1 2-2z" />
</>)

/** Gelen kutusu (boş) */
export const IconInbox = icon(<>
  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
  <path d="M5.5 5h13l2.5 7v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7z" />
</>)

/** Zincir / bağlantı */
export const IconLink = icon(<>
  <path d="M9 15a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" />
  <path d="M15 9a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
</>)

/** Raptiye */
export const IconPin = icon(<>
  <path d="M12 17v5" />
  <path d="M8 3h8l-1 6 3 3v2H6v-2l3-3z" />
</>)

/** Kredi kartı */
export const IconCreditCard = icon(<>
  <rect x="2" y="5" width="20" height="14" rx="2" />
  <line x1="2" y1="10" x2="22" y2="10" />
</>)

/** Etiket */
export const IconTag = icon(<>
  <path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.8 0l-7.4-7.4a2 2 0 0 1 0-2.8L10.4 2.4A2 2 0 0 1 12 2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-.6 1.6z" />
  <circle cx="16" cy="7" r="1.5" />
</>)

/** Açık kitap */
export const IconBookOpen = icon(<>
  <path d="M2 5c2-1.3 5-2 8-1v14c-3-1-6-.3-8 1z" />
  <path d="M22 5c-2-1.3-5-2-8-1v14c3-1 6-.3 8 1z" />
</>)

/** Pano / liste */
export const IconClipboard = icon(<>
  <rect x="5" y="4" width="14" height="17" rx="2" />
  <rect x="9" y="2" width="6" height="4" rx="1" />
  <line x1="8" y1="11" x2="16" y2="11" />
  <line x1="8" y1="15" x2="16" y2="15" />
</>)

/** Çubuk grafik */
export const IconBarChart = icon(<>
  <line x1="4" y1="20" x2="20" y2="20" />
  <rect x="6" y="12" width="3" height="8" />
  <rect x="10.5" y="7" width="3" height="13" />
  <rect x="15" y="10" width="3" height="10" />
</>)

/** Gazete */
export const IconNewspaper = icon(<>
  <path d="M4 4h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
  <path d="M19 8h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8" />
  <line x1="8" y1="8" x2="13" y2="8" />
  <line x1="8" y1="12" x2="15" y2="12" />
  <line x1="8" y1="15" x2="15" y2="15" />
</>)

/** Paket / kutu */
export const IconPackage = icon(<>
  <path d="m21 8-9-5-9 5v8l9 5 9-5z" />
  <path d="M3 8l9 5 9-5M12 13v8" />
</>)

/** Ataç */
export const IconPaperclip = icon(<path d="M21 11.5 12.5 20a4 4 0 0 1-5.7-5.7l8.5-8.5a2.7 2.7 0 0 1 3.8 3.8L10.5 18a1.3 1.3 0 0 1-1.9-1.9l7-7" />)

/** Alışveriş sepeti */
export const IconShoppingCart = icon(<>
  <circle cx="9" cy="21" r="1" />
  <circle cx="18" cy="21" r="1" />
  <path d="M2 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" />
</>)

/** Bina — sinema zinciri/şirket */
export const IconBuilding = icon(<>
  <rect x="4" y="3" width="16" height="18" rx="1" />
  <line x1="9" y1="7" x2="9" y2="7.01" />
  <line x1="15" y1="7" x2="15" y2="7.01" />
  <line x1="9" y1="11" x2="9" y2="11.01" />
  <line x1="15" y1="11" x2="15" y2="11.01" />
  <line x1="9" y1="15" x2="9" y2="15.01" />
  <line x1="15" y1="15" x2="15" y2="15.01" />
  <path d="M9 21v-3h6v3" />
</>)

/** Hedef */
export const IconTarget = icon(<>
  <circle cx="12" cy="12" r="10" />
  <circle cx="12" cy="12" r="6" />
  <circle cx="12" cy="12" r="2" />
</>)

/** Dış bağlantı */
export const IconExternalLink = icon(<>
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  <polyline points="15 3 21 3 21 9" />
  <line x1="10" y1="14" x2="21" y2="3" />
</>)

/** Haç — vefat tarihi */
export const IconCross = icon(<path d="M12 2v20M7 8h10" />)

/** Konfeti / kutlama */
export const IconPartyPopper = icon(<>
  <path d="M4 20 15 9" />
  <path d="M4 20a10 6 0 0 0 8-8" />
  <path d="M16 3l.5 2M20 6l2 .5M13 5.5l1 1.5M18.5 9l1.5 1" />
</>)

/** DNA */
export const IconDna = icon(<>
  <path d="M6 3c0 6 12 6 12 12M18 21c0-6-12-6-12-12" />
  <line x1="7" y1="6" x2="10" y2="6" />
  <line x1="14" y1="10" x2="17" y2="10" />
  <line x1="7" y1="18" x2="10" y2="18" />
  <line x1="14" y1="14" x2="17" y2="14" />
</>)

/** Akıllı telefon */
export const IconSmartphone = icon(<>
  <rect x="6" y="2" width="12" height="20" rx="2" />
  <line x1="11" y1="18" x2="13" y2="18" />
</>)

/** Disk — DVD/Blu-ray */
export const IconDisc = icon(<>
  <circle cx="12" cy="12" r="10" />
  <circle cx="12" cy="12" r="3" />
</>)

/** Kaset — VHS */
export const IconCassette = icon(<>
  <rect x="2" y="5" width="20" height="14" rx="2" />
  <circle cx="8" cy="12" r="2.5" />
  <circle cx="16" cy="12" r="2.5" />
  <line x1="10.2" y1="12" x2="13.8" y2="12" />
  <path d="M6 17h12" />
</>)

/** Dizüstü bilgisayar */
export const IconLaptop = icon(<>
  <rect x="4" y="4" width="16" height="10" rx="1" />
  <path d="M2 18h20l-1.5-4h-17z" />
</>)

/** Ampul — trivia */
export const IconLightbulb = icon(<>
  <path d="M9 18h6M10 21h4" />
  <path d="M12 2a6 6 0 0 0-3.7 10.7c.6.5 1 1.3 1.1 2.1v.2h5.2v-.2c.1-.8.5-1.6 1.1-2.1A6 6 0 0 0 12 2z" />
</>)

/** Zil kapalı */
export const IconBellOff = icon(<>
  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  <path d="M18.63 13A17.9 17.9 0 0 1 18 8" />
  <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
  <path d="M18 8a6 6 0 0 0-9.33-5" />
  <line x1="1" y1="1" x2="23" y2="23" />
</>)

/** Şimşek — aksiyon/enerji */
export const IconZap = icon(<polygon points="13 2 3 14 11 14 10 22 21 9 13 9" />)

/** Kahve fincanı — destek ol */
export const IconCoffee = icon(<>
  <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
  <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
  <line x1="6" y1="2" x2="6" y2="4" />
  <line x1="10" y1="2" x2="10" y2="4" />
  <line x1="14" y1="2" x2="14" y2="4" />
</>)

/** Terazi — denge */
export const IconScale = icon(<>
  <line x1="12" y1="3" x2="12" y2="21" />
  <line x1="5" y1="7" x2="19" y2="7" />
  <path d="M5 7 2 14a3.5 3.5 0 0 0 6 0z" />
  <path d="M19 7l3 7a3.5 3.5 0 0 1-6 0z" />
  <path d="M8 21h8" />
</>)
