export const config = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  apiBaseUrl: (import.meta.env.VITE_API_URL as string) || '',
  socketUrl: (import.meta.env.VITE_SOCKET_URL as string) || '/',
  appUrl:
    (import.meta.env.VITE_APP_URL as string) ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'),

  images: {
    tmdbBaseUrl:
      (import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string) ||
      'https://image.tmdb.org/t/p',
    posterSmall: 'w300',
    posterLarge: 'w500',
    backdrop: 'w1280'
  }
} as const
