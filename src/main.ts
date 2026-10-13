import './style.css'

import { renderAuthPage } from '@/pages/AuthPage/AuthPage'
import { Router } from '@/router'

const app = document.querySelector<HTMLDivElement>('#app')!
export const router = new Router(app)

router
  .addRoute({
    path: '/auth',
    title: 'Вход',
    render: () => {
      return renderAuthPage({
        onSuccess: () => {
          router.navigate('/rooms')
        },
        onError: (message) => {
          alert(`Ошибка: ${message}`)
        }
      })
    }
  })
  .addRoute({
    path: '/rooms',
    title: 'Мои комнаты',
    isProtected: true,
    render: () => {
      const el = document.createElement('div')
      el.innerHTML = `
        <h1>Мои комнаты</h1>
        <a href="/rooms/1">Перейти в комнату 1</a>
      `
      return el
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
  .addRoute({
    path: '*',
    title: 'Не найдено',
    render: () => {
      const el = document.createElement('div')
      el.innerHTML = `
        <h2>Страница не найдена</h2>
        <a href="/">На главную</a>
      `
      return el
    }
  })

window.addEventListener('auth:unauthorized', () => {
  router.navigate('/auth')
})

router.start()
