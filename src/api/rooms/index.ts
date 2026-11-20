import { apiFetch } from '../client'
import { MovieItem } from '../films/types'
import {
  RoomAddMovieItem,
  RoomDetailsResponse,
  RoomPayload,
  RoomsDeleteResponse,
  RoomsGetResponse,
  RoomsPostResponse,
  RoomWithMovies
} from './types'

export function createRoom(payload: RoomPayload) {
  return apiFetch<RoomsPostResponse>('/api/rooms/', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function getRoomsList(query?: string, options?: { signal?: AbortSignal }) {
  const params = new URLSearchParams()
  const trimmed = query?.trim() ?? ''

  if (trimmed.length) {
    params.set('query', trimmed)
  }

  const endpoint = `/api/rooms/my${params.toString() ? `?${params.toString()}` : ''}`

  return apiFetch<RoomsGetResponse>(endpoint, {
    signal: options?.signal
  })
}

export function getUserRoomsWithMovies() {
  return apiFetch<RoomWithMovies[]>('/api/rooms/my/with-movies')
}

export function getRoomDetails(roomId: number, query: string = '') {
  const params = new URLSearchParams()
  const trimmed = query.trim()

  if (trimmed.length) {
    params.set('query', trimmed)
  }
  const endpoint = `/api/rooms/${roomId}/watchlist${params.toString() ? `?${params.toString()}` : ''}`
  return apiFetch<RoomDetailsResponse>(endpoint)
}

export function addToWatchlist(payload: MovieItem, roomId?: number) {
  return apiFetch<RoomAddMovieItem>(`/api/rooms/${roomId}/watchlist`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function removeFromWatchlist(roomId: number, movieId: number) {
  return apiFetch<RoomsDeleteResponse>(`/api/rooms/${roomId}/watchlist/${movieId}`, {
    method: 'DELETE'
  })
}
