export interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  username: string
}
