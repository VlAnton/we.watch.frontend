import { apiFetch } from '../client'
import { MovieItem, TMDBSearchResponse } from './types'

export function getMovies(query: string) {
  const params = new URLSearchParams()
  const trimmed = query.trim()

  if (trimmed.length) {
    params.set('query', trimmed)
  }

  const endpoint = `/api/films/search${params.toString() ? `?${params.toString()}` : ''}`

  return apiFetch<TMDBSearchResponse<MovieItem>>(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
