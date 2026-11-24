import './style.scss'
import '@/assets/styles/classes.scss'

import { renderAuthPage } from '@/pages/AuthPage/AuthPage'
import { Router } from '@/router'

import { logoutUser } from './api/auth'
import { createConfirmModal } from './components/Modal/ConfirmModal/ConfirmModal'
import { toast } from './components/Toast/Toast'
import { renderMovieDetailsPage } from './pages/MovieDetailsPage/MovieDetailsPage'
import { renderMoviesPage } from './pages/MoviesPage/MoviesPage'
import { renderRoomDetailsPage } from './pages/RoomDetailsPage/RoomDetailsPage'
import { renderRoomsPage } from './pages/RoomsPage/RoomsPage'

const app = document.getElementById('app')!

export const router = new Router(app, () => {
  const modalEl = createConfirmModal({
    title: 'уверены что хотите выйти?',
    confirmText: 'выйти',
    onConfirm() {
      logoutUser()
        .then(() => {
          router.navigate('/auth')
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
            title: 'Ошибка выхода из аккаунта'
          })
        })
    }
  })
  app.appendChild(modalEl.element)
  modalEl.open()
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
    path: '/rooms/:roomId',
    title: 'Комната совместного просмотра',
    isProtected: true,
    render: () => {
      return renderRoomDetailsPage()
    }
  })
  .addRoute({
    path: '/movies',
    title: 'Фильмы',
    render: () => {
      return renderMoviesPage()
    }
  })
  .addRoute({
    path: '/rooms/:roomId/movies',
    title: 'Фильмы',
    render: () => {
      return renderMoviesPage()
    }
  })
  .addRoute({
    path: '/movies/:movieId',
    title: 'Фильмы',
    render: () => {
      return renderMovieDetailsPage()
    }
  })
  .addRoute({
    path: '/rooms/:roomId/movies/:movieId',
    title: 'Фильмы',
    render: () => {
      return renderMovieDetailsPage()
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
