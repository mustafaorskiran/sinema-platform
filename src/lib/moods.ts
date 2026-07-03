import type { ComponentType, SVGProps } from 'react'
import {
  IconLaugh, IconCry, IconZap, IconGhost, IconHeartFilled, IconThinking, IconRocket,
  IconFamily, IconSearch, IconGlobe,
} from '@/components/icons'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>

export interface Mood {
  slug: string
  icon: IconType
  title: string
  subtitle: string
  color: string // Tailwind gradient classes
  movieGenres: number[]
  tvGenres: number[]
  sortBy: string
  voteCountMin: number
}

export const MOODS: Mood[] = [
  {
    slug: 'gul-eglence',
    icon: IconLaugh,
    title: 'Güldür Beni',
    subtitle: 'Kahkaha atıp eğlenmek istiyorum',
    color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    movieGenres: [35, 16, 10751],
    tvGenres: [35, 16, 10751],
    sortBy: 'vote_average.desc',
    voteCountMin: 1000,
  },
  {
    slug: 'duygu-yuku',
    icon: IconCry,
    title: 'Duygu Yükü',
    subtitle: 'İçimi dökeceğim bir drama arıyorum',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    movieGenres: [18, 10749],
    tvGenres: [18, 10749],
    sortBy: 'vote_average.desc',
    voteCountMin: 2000,
  },
  {
    slug: 'aksiyon-enerji',
    icon: IconZap,
    title: 'Aksiyon & Enerji',
    subtitle: 'Adrenalini yüksek, nefes kesen bir şey',
    color: 'from-red-500/20 to-rose-500/20 border-red-500/30',
    movieGenres: [28, 12, 878],
    tvGenres: [28, 12, 10765],
    sortBy: 'popularity.desc',
    voteCountMin: 5000,
  },
  {
    slug: 'korku-gerilim',
    icon: IconGhost,
    title: 'Korkut Beni',
    subtitle: 'Kalbim ağzıma gelsin istiyorum',
    color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
    movieGenres: [27, 53],
    tvGenres: [27, 9648],
    sortBy: 'vote_average.desc',
    voteCountMin: 1000,
  },
  {
    slug: 'romantik',
    icon: IconHeartFilled,
    title: 'Romantik Mood',
    subtitle: 'Aşk ve duygu dolu bir hikaye',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    movieGenres: [10749, 18],
    tvGenres: [10749, 18],
    sortBy: 'vote_average.desc',
    voteCountMin: 1000,
  },
  {
    slug: 'dusundurucu',
    icon: IconThinking,
    title: 'Düşündürücü',
    subtitle: 'Kafamı çalıştıracak, iz bırakacak bir şey',
    color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
    movieGenres: [99, 36, 9648],
    tvGenres: [99, 18, 9648],
    sortBy: 'vote_average.desc',
    voteCountMin: 2000,
  },
  {
    slug: 'macera-fantezi',
    icon: IconRocket,
    title: 'Macera & Fantezi',
    subtitle: 'Bambaşka bir dünyaya kaçmak istiyorum',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
    movieGenres: [12, 14, 878],
    tvGenres: [12, 14, 10765],
    sortBy: 'popularity.desc',
    voteCountMin: 2000,
  },
  {
    slug: 'aile-beraber',
    icon: IconFamily,
    title: 'Aileyle Beraber',
    subtitle: 'Herkesin izleyebileceği keyifli bir şey',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    movieGenres: [10751, 16, 35],
    tvGenres: [10751, 16, 35],
    sortBy: 'vote_average.desc',
    voteCountMin: 1000,
  },
  {
    slug: 'gizem-suc',
    icon: IconSearch,
    title: 'Gizem & Suç',
    subtitle: 'Ipuçlarını takip edip gerçeği bulmak istiyorum',
    color: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
    movieGenres: [9648, 80, 53],
    tvGenres: [9648, 80],
    sortBy: 'vote_average.desc',
    voteCountMin: 1000,
  },
  {
    slug: 'belgesel',
    icon: IconGlobe,
    title: 'Gerçek Hayat',
    subtitle: 'Dünyayı ve insanları daha iyi anlamak istiyorum',
    color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
    movieGenres: [99, 36],
    tvGenres: [99],
    sortBy: 'vote_average.desc',
    voteCountMin: 500,
  },
]

export function getMoodBySlug(slug: string): Mood | undefined {
  return MOODS.find(m => m.slug === slug)
}
