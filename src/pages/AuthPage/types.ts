import { User } from '@/api/auth'

export interface AuthPageProps {
  onSuccess: (user: User) => void
  onError: (message: string) => void
}

export type AuthMode = 'login' | 'register'
