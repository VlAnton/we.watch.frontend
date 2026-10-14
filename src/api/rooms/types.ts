export interface RoomPayload {
  name: string
}

export interface RoomsPostResponse {
  success: boolean
  room: RoomPayload
}

export interface RoomsGetResponse {
  rooms: Room[]
}

export interface Room {
  id: number
  name: string
  code: string
  createdBy: number
  createdAt: string
}
