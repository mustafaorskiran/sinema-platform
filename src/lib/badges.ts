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
}

const BADGE_DEFS: Array<{
  id: string
  icon: IconType
  check: (s: BadgeStats) => boolean
}> = [
  // ─── İzleme miktarı ───────────────────────────────────────────
  { id: 'first_review',  icon: IconFilm,          check: s => s.reviewCount >= 1 },
  { id: 'reviews_10',    icon: IconPopcorn,       check: s => s.reviewCount >= 10 },
  { id: 'reviews_50',    icon: IconMasks,         check: s => s.reviewCount >= 50 },
  { id: 'reviews_100',   icon: IconTrophy,        check: s => s.reviewCount >= 100 },
  { id: 'reviews_500',   icon: IconCrown,         check: s => s.reviewCount >= 500 },

  // ─── Film / Dizi ──────────────────────────────────────────────
  { id: 'film_fan',      icon: IconFilm,          check: s => s.filmCount >= 10 },
  { id: 'series_fan',    icon: IconTv,            check: s => s.diziCount >= 10 },
  { id: 'balanced',      icon: IconScale,         check: s => s.reviewCount >= 20 && Math.abs(s.filmCount - s.diziCount) / s.reviewCount < 0.2 },

  // ─── Puan ─────────────────────────────────────────────────────
  { id: 'optimist',      icon: IconSmile,         check: s => s.reviewCount >= 10 && s.avgRating >= 8 },
  { id: 'critic',        icon: IconGlasses,       check: s => s.reviewCount >= 10 && s.avgRating <= 5 },

  // ─── Sosyal ───────────────────────────────────────────────────
  { id: 'first_follower',icon: IconHandshake,     check: s => s.followerCount >= 1 },
  { id: 'popular_10',    icon: IconSparkles,      check: s => s.followerCount >= 10 },
  { id: 'popular_50',    icon: IconStarFilled,    check: s => s.followerCount >= 50 },
  { id: 'list_maker',    icon: IconClipboard,     check: s => s.listCount >= 3 },

  // ─── Film milestone ───────────────────────────────────────────
  { id: 'films_100',     icon: IconFilm,          check: s => s.filmCount >= 100 },

  // ─── Liste ────────────────────────────────────────────────────
  { id: 'first_list',    icon: IconPencil,        check: s => s.listCount >= 1 },

  // ─── Üyelik ───────────────────────────────────────────────────
  { id: 'member_1year',  icon: IconCake,          check: s => !!s.joinedAt && (Date.now() - new Date(s.joinedAt).getTime()) >= 365 * 24 * 3600 * 1000 },

  // ─── Günlük ───────────────────────────────────────────────────
  { id: 'diary_1',       icon: IconCalendar,      check: s => s.diaryCount >= 1 },
  { id: 'diary_10',      icon: IconBookOpen,      check: s => s.diaryCount >= 10 },
  { id: 'diary_50',      icon: IconBookOpen,      check: s => s.diaryCount >= 50 },

  // ─── Forum ────────────────────────────────────────────────────
  { id: 'forum_poster',  icon: IconMessageSquare, check: s => s.threadCount >= 5 },
  { id: 'forum_active',  icon: IconMic,           check: s => s.threadCount >= 20 },

  // ─── Konular ──────────────────────────────────────────────────
  { id: 'topic_voter',   icon: IconTag,           check: s => s.topicVoteCount >= 10 },
]

export function computeBadges(stats: BadgeStats, t: (key: string) => string): Badge[] {
  return BADGE_DEFS.map(def => ({
    id: def.id,
    icon: def.icon,
    name: t(`badges.${def.id}.name`),
    desc: t(`badges.${def.id}.desc`),
    earned: def.check(stats),
  }))
}

export const ALL_BADGE_COUNT = BADGE_DEFS.length
