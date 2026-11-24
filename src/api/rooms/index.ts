import { apiFetch } from '../client'
import { MovieItem } from '../films/types'
import {
  Room,
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

export function joinRoom(payload: { code: string }) {
  return apiFetch<{ success: boolean; room: Room }>('/api/rooms/join', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function leaveRoom(roomId: number) {
  return apiFetch<{ success: boolean; message: string }>(`/api/rooms/${roomId}/leave`, {
    method: 'POST'
  })
}

export function deleteRoom(roomId: number) {
  return apiFetch<RoomsDeleteResponse>(`/api/rooms/${roomId}`, {
    method: 'DELETE'
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

export function getJoinedRoomsList(query?: string, options?: { signal?: AbortSignal }) {
  const params = new URLSearchParams()
  const trimmed = query?.trim() ?? ''

  if (trimmed.length) {
    params.set('query', trimmed)
  }

  const endpoint = `/api/rooms/joined${params.toString() ? `?${params.toString()}` : ''}`

  return apiFetch<RoomsGetResponse>(endpoint, {
    signal: options?.signal
  })
}

export async function getUserRoomsWithMovies() {
  const res = await apiFetch<{ rooms: RoomWithMovies[] } | RoomWithMovies[]>(
    '/api/rooms/my/with-movies'
  )
  return Array.isArray(res) ? res : (res.rooms ?? [])
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
