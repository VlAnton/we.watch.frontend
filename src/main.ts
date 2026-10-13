import './style.css'

import { showAuth } from '@/pages/AuthPage/AuthPage'

import { getMe } from './api/auth'

const app = document.querySelector<HTMLDivElement>('#app')!

const currentUser = await getMe().catch(() => null)

if (!currentUser) {
  showAuth(app)
}
