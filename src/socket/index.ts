import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocket(): Socket {
  if (socket) return socket

  socket = io('/', {
    withCredentials: true,
    autoConnect: true
  })

  socket.on('connect', () => {
    console.log('🔌 WebSocket подключен через HttpOnly cookie:', socket?.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('Ошибка подключения сокета:', err.message)
  })

  return socket
}
