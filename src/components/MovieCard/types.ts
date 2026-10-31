import { RoomWithMovies } from '@/api/rooms/types'

export interface MovieCard {
  element: HTMLElement
  updateRooms: (rooms: RoomWithMovies[]) => void
}
