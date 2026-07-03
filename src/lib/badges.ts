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
  name: string
  desc: string
  check: (s: BadgeStats) => boolean
}> = [
  // ─── İzleme miktarı ───────────────────────────────────────────
  { id: 'first_review',  icon: IconFilm,          name: 'İlk Adım',        desc: 'İlk yorumunu yaptın',          check: s => s.reviewCount >= 1 },
  { id: 'reviews_10',    icon: IconPopcorn,       name: 'Film Sever',       desc: '10 yorum yaptın',              check: s => s.reviewCount >= 10 },
  { id: 'reviews_50',    icon: IconMasks,         name: 'Sinema Tutkunu',   desc: '50 yorum yaptın',              check: s => s.reviewCount >= 50 },
  { id: 'reviews_100',   icon: IconTrophy,        name: 'Sinefil',          desc: '100 yorum yaptın',             check: s => s.reviewCount >= 100 },
  { id: 'reviews_500',   icon: IconCrown,         name: 'Efsane',           desc: '500 yorum yaptın',             check: s => s.reviewCount >= 500 },

  // ─── Film / Dizi ──────────────────────────────────────────────
  { id: 'film_fan',      icon: IconFilm,          name: 'Film Hayranı',    desc: '10+ film yorumladın',          check: s => s.filmCount >= 10 },
  { id: 'series_fan',    icon: IconTv,            name: 'Dizi Bağımlısı',  desc: '10+ dizi yorumladın',          check: s => s.diziCount >= 10 },
  { id: 'balanced',      icon: IconScale,         name: 'Dengeli',          desc: 'Film ve dizi yorumların dengeli', check: s => s.reviewCount >= 20 && Math.abs(s.filmCount - s.diziCount) / s.reviewCount < 0.2 },

  // ─── Puan ─────────────────────────────────────────────────────
  { id: 'optimist',      icon: IconSmile,         name: 'İyimser',          desc: 'Ort. puanın 8 veya üstü',     check: s => s.reviewCount >= 10 && s.avgRating >= 8 },
  { id: 'critic',        icon: IconGlasses,       name: 'Sert Eleştirmen',  desc: 'Ort. puanın 5 veya altı',     check: s => s.reviewCount >= 10 && s.avgRating <= 5 },

  // ─── Sosyal ───────────────────────────────────────────────────
  { id: 'first_follower',icon: IconHandshake,     name: 'Popüler',          desc: 'İlk takipçini kazandın',       check: s => s.followerCount >= 1 },
  { id: 'popular_10',    icon: IconSparkles,      name: 'Sosyal Kelebek',   desc: '10 takipçin var',              check: s => s.followerCount >= 10 },
  { id: 'popular_50',    icon: IconStarFilled,    name: 'Fenomen',           desc: '50 takipçin var',              check: s => s.followerCount >= 50 },
  { id: 'list_maker',    icon: IconClipboard,     name: 'Liste Ustası',      desc: '3 liste oluşturdun',           check: s => s.listCount >= 3 },

  // ─── Film milestone ───────────────────────────────────────────
  { id: 'films_100',     icon: IconFilm,          name: '100 Film Kulübü',  desc: '100 filmi yorumladın',         check: s => s.filmCount >= 100 },

  // ─── Liste ────────────────────────────────────────────────────
  { id: 'first_list',    icon: IconPencil,        name: 'Liste Kurucusu',    desc: 'İlk listeni oluşturdun',       check: s => s.listCount >= 1 },

  // ─── Üyelik ───────────────────────────────────────────────────
  { id: 'member_1year',  icon: IconCake,          name: 'Sinezon Yıllığı',  desc: '1 yıldır Sinezon üyesisin',   check: s => !!s.joinedAt && (Date.now() - new Date(s.joinedAt).getTime()) >= 365 * 24 * 3600 * 1000 },

  // ─── Günlük ───────────────────────────────────────────────────
  { id: 'diary_1',       icon: IconCalendar,      name: 'Günlük Başlangıcı',desc: 'İlk günlük kaydını yaptın',   check: s => s.diaryCount >= 1 },
  { id: 'diary_10',      icon: IconBookOpen,      name: 'Günlük Tutucu',    desc: '10 günlük kaydın var',         check: s => s.diaryCount >= 10 },
  { id: 'diary_50',      icon: IconBookOpen,      name: 'Anılar Kitabı',    desc: '50 günlük kaydın var',         check: s => s.diaryCount >= 50 },

  // ─── Forum ────────────────────────────────────────────────────
  { id: 'forum_poster',  icon: IconMessageSquare, name: 'Forum Katılımcısı',desc: '5 forum konusu açtın',         check: s => s.threadCount >= 5 },
  { id: 'forum_active',  icon: IconMic,           name: 'Forum Yıldızı',   desc: '20 forum konusu açtın',        check: s => s.threadCount >= 20 },

  // ─── Konular ──────────────────────────────────────────────────
  { id: 'topic_voter',   icon: IconTag,           name: 'Etiket Ustası',   desc: '10+ içeriği konularla etiketledin', check: s => s.topicVoteCount >= 10 },
]

export function computeBadges(stats: BadgeStats): Badge[] {
  return BADGE_DEFS.map(def => ({
    id: def.id,
    icon: def.icon,
    name: def.name,
    desc: def.desc,
    earned: def.check(stats),
  }))
}

export const ALL_BADGE_COUNT = BADGE_DEFS.length
