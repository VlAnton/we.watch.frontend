import { apiFetch } from '@/api/client'

import { AuthResponse, LoginPayload, RegisterPayload, User } from './types'

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function getMe(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>('/api/auth/me')
}

export async function logoutUser(): Promise<void> {
  await apiFetch('/api/auth/logout', {
    method: 'POST'
  })
}
