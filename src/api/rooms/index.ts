import { apiFetch } from '../client'
import { RoomPayload, RoomsGetResponse, RoomsPostResponse } from './types'

export async function createRoom(payload: RoomPayload) {
  return apiFetch<RoomsPostResponse>('/api/rooms/', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function getRoomsList(query: string) {
  const params = new URLSearchParams()
  const trimmed = query.trim()

  if (trimmed.length) {
    params.set('query', trimmed)
  }

  const endpoint = `/api/rooms/my${params.toString() ? `?${params.toString()}` : ''}`
  return apiFetch<RoomsGetResponse>(endpoint)
}
