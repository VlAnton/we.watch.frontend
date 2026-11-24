import { apiFetch } from '../client'
import { MovieItem, TMDBMovieDetails, TMDBSearchResponse } from './types'

export function getMovies(
  query: string,
  page: number,
  options?: { signal?: AbortSignal }
) {
  const params = new URLSearchParams()
  const trimmed = query.trim()

  if (trimmed.length) {
    params.set('query', trimmed)
    params.set('page', page.toString())
  }

  const endpoint = `/api/films/search${params.toString() ? `?${params.toString()}` : ''}`

  return apiFetch<TMDBSearchResponse<MovieItem>>(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    signal: options?.signal
  })
}

export function getTMDBMovieDetails(movieId: number) {
  return apiFetch<TMDBMovieDetails>(`/api/films/${movieId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
