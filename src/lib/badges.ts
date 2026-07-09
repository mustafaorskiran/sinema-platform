import type { ComponentType, SVGProps } from 'react'
import {
  IconFilm, IconPopcorn, IconMasks, IconTrophy, IconCrown, IconTv, IconScale, IconSmile,
  IconGlasses, IconHandshake, IconSparkles, IconStarFilled, IconClipboard, IconPencil, IconCake,
  IconCalendar, IconBookOpen, IconMessageSquare, IconMic, IconTag,
} from '@/components/icons'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>

export interface BadgeStats {
  reviewCount: number
  filmCount: number
  diziCount: number
  avgRating: number
  followerCount: number
  listCount: number
  diaryCount: number
  threadCount: number
  topicVoteCount: number
  joinedAt?: string
}

export interface Badge {
  id: string
  icon: IconType
  name: string
  desc: string
  earned: boolean
  color: string
  colorDark: string
}

const BADGE_DEFS: Array<{
  id: string
  icon: IconType
  /** Madalyon rengi — kategori bazlı, aynı aile içindeki rozetler kademeli olarak zenginleşir. */
  color: string
  colorDark: string
  check: (s: BadgeStats) => boolean
}> = [
  // ─── İzleme miktarı (bronz → gümüş → altın → platin → elmas) ──
  { id: 'first_review',  icon: IconFilm,          color: '#CD7F32', colorDark: '#8B5A22', check: s => s.reviewCount >= 1 },
  { id: 'reviews_10',    icon: IconPopcorn,       color: '#A8B2BD', colorDark: '#6B7480', check: s => s.reviewCount >= 10 },
  { id: 'reviews_50',    icon: IconMasks,         color: '#D4A843', colorDark: '#9C7A2E', check: s => s.reviewCount >= 50 },
  { id: 'reviews_100',   icon: IconTrophy,        color: '#7DD3FC', colorDark: '#3B9FD1', check: s => s.reviewCount >= 100 },
  { id: 'reviews_500',   icon: IconCrown,         color: '#C4B5FD', colorDark: '#7C5CE0', check: s => s.reviewCount >= 500 },

  // ─── Film / Dizi ──────────────────────────────────────────────
  { id: 'film_fan',      icon: IconFilm,          color: '#3B82F6', colorDark: '#1D4ED8', check: s => s.filmCount >= 10 },
  { id: 'series_fan',    icon: IconTv,            color: '#8B5CF6', colorDark: '#5B21B6', check: s => s.diziCount >= 10 },
  { id: 'balanced',      icon: IconScale,         color: '#14B8A6', colorDark: '#0D8377', check: s => s.reviewCount >= 20 && Math.abs(s.filmCount - s.diziCount) / s.reviewCount < 0.2 },

  // ─── Puan ─────────────────────────────────────────────────────
  { id: 'optimist',      icon: IconSmile,         color: '#FBBF24', colorDark: '#B8860B', check: s => s.reviewCount >= 10 && s.avgRating >= 8 },
  { id: 'critic',        icon: IconGlasses,       color: '#64748B', colorDark: '#3F4B5C', check: s => s.reviewCount >= 10 && s.avgRating <= 5 },

  // ─── Sosyal ───────────────────────────────────────────────────
  { id: 'first_follower',icon: IconHandshake,     color: '#EC4899', colorDark: '#9D174D', check: s => s.followerCount >= 1 },
  { id: 'popular_10',    icon: IconSparkles,      color: '#F472B6', colorDark: '#BE185D', check: s => s.followerCount >= 10 },
  { id: 'popular_50',    icon: IconStarFilled,    color: '#D4A843', colorDark: '#9C7A2E', check: s => s.followerCount >= 50 },
  { id: 'list_maker',    icon: IconClipboard,     color: '#22D3EE', colorDark: '#0E7C90', check: s => s.listCount >= 3 },

  // ─── Film milestone ───────────────────────────────────────────
  { id: 'films_100',     icon: IconFilm,          color: '#D4A843', colorDark: '#9C7A2E', check: s => s.filmCount >= 100 },

  // ─── Liste ────────────────────────────────────────────────────
  { id: 'first_list',    icon: IconPencil,        color: '#2DD4BF', colorDark: '#0F766E', check: s => s.listCount >= 1 },

  // ─── Üyelik ───────────────────────────────────────────────────
  { id: 'member_1year',  icon: IconCake,          color: '#FB923C', colorDark: '#C2530C', check: s => !!s.joinedAt && (Date.now() - new Date(s.joinedAt).getTime()) >= 365 * 24 * 3600 * 1000 },

  // ─── Günlük (yeşil kademeleri) ─────────────────────────────────
  { id: 'diary_1',       icon: IconCalendar,      color: '#4ADE80', colorDark: '#15803D', check: s => s.diaryCount >= 1 },
  { id: 'diary_10',      icon: IconBookOpen,      color: '#22C55E', colorDark: '#166534', check: s => s.diaryCount >= 10 },
  { id: 'diary_50',      icon: IconBookOpen,      color: '#15803D', colorDark: '#052E16', check: s => s.diaryCount >= 50 },

  // ─── Forum ────────────────────────────────────────────────────
  { id: 'forum_poster',  icon: IconMessageSquare, color: '#6366F1', colorDark: '#3730A3', check: s => s.threadCount >= 5 },
  { id: 'forum_active',  icon: IconMic,           color: '#818CF8', colorDark: '#4338CA', check: s => s.threadCount >= 20 },

  // ─── Konular ──────────────────────────────────────────────────
  { id: 'topic_voter',   icon: IconTag,           color: '#E11D48', colorDark: '#881337', check: s => s.topicVoteCount >= 10 },
]

export function computeBadges(stats: BadgeStats, t: (key: string) => string): Badge[] {
  return BADGE_DEFS.map(def => ({
    id: def.id,
    icon: def.icon,
    name: t(`badges.${def.id}.name`),
    desc: t(`badges.${def.id}.desc`),
    earned: def.check(stats),
    color: def.color,
    colorDark: def.colorDark,
  }))
}

export const ALL_BADGE_COUNT = BADGE_DEFS.length
