import { apiFetch } from '../client'
import {
  RoomDetailsResponse,
  RoomPayload,
  RoomsGetResponse,
  RoomsPostResponse
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

export function getRoomsList(query: string) {
  const params = new URLSearchParams()
  const trimmed = query.trim()

  if (trimmed.length) {
    params.set('query', trimmed)
  }

  const endpoint = `/api/rooms/my${params.toString() ? `?${params.toString()}` : ''}`
  return apiFetch<RoomsGetResponse>(endpoint)
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
