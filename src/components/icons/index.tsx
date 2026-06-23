/**
 * SineMa SVG İkon Kütüphanesi
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
