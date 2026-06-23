import type { TMDbMovie } from './types'

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function getPosterUrl(path: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function getMediaTitle(media: TMDbMovie): string {
  return media.title || media.name || 'Başlık Yok'
}

export function getMediaDate(media: TMDbMovie): string {
  return media.release_date || media.first_air_date || ''
}

export function getMediaYear(media: TMDbMovie): string {
  const date = getMediaDate(media)
  return date ? date.substring(0, 4) : ''
}
