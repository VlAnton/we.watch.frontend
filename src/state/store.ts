import { User } from '@/api/auth'
import { Room, RoomWithMovies } from '@/api/rooms/types'

import { reactive } from './reactivity'

export interface AppState {
  user: User | null
  roomsWithMovies: RoomWithMovies[]
  rooms: Room[]
}

export const store = reactive<AppState>({
  roomsWithMovies: [],
  rooms: [],
  user: null
})
