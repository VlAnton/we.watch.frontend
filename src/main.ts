import './style.css'

import { renderAuthPage } from '@/pages/AuthPage/AuthPage'
import { Router } from '@/router'

import { logoutUser } from './api/auth'
import { renderRoomsPage } from './pages/RoomsPage/RoomsPage'

const app = document.querySelector<HTMLDivElement>('#app')!
export const router = new Router(app, () => {
  logoutUser()
  router.navigate('/auth')
})

router
  .addRoute({
    path: '/auth',
    title: 'Вход',
    layout: 'main',
    render: () => {
      return renderAuthPage()
    }
  })
  .addRoute({
    path: '/rooms',
    title: 'Мои комнаты',
    isProtected: true,
    layout: 'main',
    render: () => {
      return renderRoomsPage({})
    }
  })
  .addRoute({
    path: '/rooms/:id',
    title: 'Комната совместного просмотра',
    isProtected: true,
    render: ({ params }) => {
      const el = document.createElement('div')
      el.innerHTML = `
        <h1>Комната #${params.id}</h1>
        <a href="/rooms">← Назад к комнатам</a>
      `

      const cleanup = () => {
        console.log(`Покинули комнату ${params.id}`)
      }

      return { element: el, cleanup }
    }
  })
  .addRoute({
    path: '/',
    render: () => {
      router.navigate('/rooms')
      return document.createElement('div')
    }
  })

window.addEventListener('auth:unauthorized', () => {
  router.navigate('/auth')
})

router.start()
