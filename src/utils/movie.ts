const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original'

/**
 * Формирует валидный URL постера фильма TMDB.
 * Если путь отсутствует (null/undefined) — возвращает путь к локальной заглушке.
 */
export function getPosterUrl(
  path: string | null | undefined,
  size: PosterSize = 'w342'
): string {
  if (!path) {
    return '/images/empty_poster.webp'
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`
}

export function getBackdropUrl(
  path: string | null | undefined,
  size: BackdropSize = 'w1280'
): string {
  if (!path) {
    return '/images/empty_poster.webp'
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`
}
