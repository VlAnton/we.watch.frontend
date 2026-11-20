import { RoomWithMovies } from '@/api/rooms/types'

import { reactive } from './reactivity'

export const store = reactive({
  roomsWithMovies: [] as RoomWithMovies[]
})
