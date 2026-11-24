import { User } from '@/api/auth'
import { RoomWithMovies } from '@/api/rooms/types'

import { reactive } from './reactivity'

export interface AppState {
  user: User | null
  roomsWithMovies: RoomWithMovies[]
}

export const store = reactive<AppState>({
  roomsWithMovies: [] as RoomWithMovies[],
  user: null
})
