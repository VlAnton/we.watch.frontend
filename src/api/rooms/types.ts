import { MovieItem } from '../films/types'

export interface RoomPayload {
  name: string
}

export interface RoomsPostResponse {
  success: boolean
  room: Room
}

export interface RoomsGetResponse {
  rooms: Room[]
}

export interface RoomDetailsResponse {
  room: Room
  watchlist: RoomWatchlistItem[]
}

export interface Room {
  id: number
  name: string
  code: string
  createdBy: number
  createdAt: string
}

export interface RoomWatchlistItem extends MovieItem {
  status: 'to_watch' | 'watched'
  addedBy: number
  addedByUsername: string
  createdAt: string
}

export interface RoomWithMovies extends Room {
  watchlist: RoomWatchlistItem[]
}

export interface RoomAddMovieItem {
  success: boolean
  item: MovieItem
}
