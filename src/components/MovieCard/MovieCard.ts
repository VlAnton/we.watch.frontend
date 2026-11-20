import './MovieCard.scss'

import type { MovieItem } from '@/api/films/types'
import { addToWatchlist, getUserRoomsWithMovies, removeFromWatchlist } from '@/api/rooms'
import closeIconSvg from '@/assets/icons/close.svg?raw'
import plusIconSvg from '@/assets/icons/plus.svg?raw'
import { router } from '@/main'
import { effect } from '@/state/reactivity'
import { store } from '@/state/store'

import { createIconButton } from '../IconButton/IconButton'
import { createPoster } from '../Image/Image'
import { toast } from '../Toast/Toast'
import movieCardTemplate from './MovieCard.html?raw'

interface MovieCardProps extends MovieItem {
  deleteOnly?: boolean
  showContextMenu?: boolean
  onRoomDelete?: () => void
}

const movieCardTemplateEl = document.createElement('template')
movieCardTemplateEl.innerHTML = movieCardTemplate

export function createMovieCard(props: MovieCardProps) {
  const movieCardEl = movieCardTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLAnchorElement

  const currentRoomId = router.params.roomId ? parseInt(router.params.roomId, 10) : null
  const isDeleteOnly = Boolean(props.deleteOnly)
  const hasContextMenu = !isDeleteOnly && Boolean(props.showContextMenu)

  movieCardEl.id = `movie-${props.movieId}`
  movieCardEl.href = currentRoomId
    ? `/rooms/${currentRoomId}/movies/${props.movieId}`
    : `/movies/${props.movieId}`

  const cardTitle = movieCardEl.querySelector<HTMLElement>('.card__title')!
  const cardActions = movieCardEl.querySelector<HTMLElement>('.movie-card__actions')!
  const cardImgContainer = movieCardEl.querySelector<HTMLElement>(
    '.movie-card__img-container'
  )!

  cardTitle.textContent = props.title
  cardTitle.title = props.title

  const posterElement = createPoster({
    posterPath: props.posterPath,
    title: props.title,
    targetSize: 'w342'
  })
  cardImgContainer.appendChild(posterElement)

  let isSubmitting = false

  function isMovieInRoom(roomId: number | null): boolean {
    if (!roomId) return false
    const targetRoom = store.roomsWithMovies.find((room) => room.id === roomId)
    return Boolean(targetRoom?.watchlist.some((movie) => movie.movieId === props.movieId))
  }

  function getActionIcon(): string {
    if (isDeleteOnly) return closeIconSvg
    if (hasContextMenu) return plusIconSvg
    return isMovieInRoom(currentRoomId) ? closeIconSvg : plusIconSvg
  }

  const contextMenu = document.createElement('div')
  contextMenu.className = 'movie-card__context-menu'
  contextMenu.style.display = 'none'

  function renderMenuItems() {
    contextMenu.innerHTML = ''
    const fragment = document.createDocumentFragment()

    for (const room of store.roomsWithMovies) {
      const inRoom = room.watchlist.some((movie) => movie.movieId === props.movieId)
      const item = document.createElement('div')
      item.className = 'movie-card__context-menu-item'
      item.textContent = room.name
      item.dataset.roomId = String(room.id)

      if (inRoom) {
        item.classList.add('movie-card__context-menu-item--active')
      }
      fragment.appendChild(item)
    }

    contextMenu.appendChild(fragment)
  }

  async function syncRoomsState() {
    store.roomsWithMovies = await getUserRoomsWithMovies()
    if (hasContextMenu) {
      renderMenuItems()
    }
    if (props.onRoomDelete) {
      props.onRoomDelete()
    }
  }

  const actionBtn = createIconButton({
    icon: getActionIcon(),
    size: 's',
    type: 'primary',
    async onClick(event) {
      event?.preventDefault()
      event?.stopPropagation()

      if (hasContextMenu) {
        const isOpening = contextMenu.style.display !== 'flex'
        if (isOpening) {
          renderMenuItems()
          contextMenu.style.display = 'flex'
        } else {
          contextMenu.style.display = 'none'
        }
        return
      }

      if (!currentRoomId || isSubmitting) return
      isSubmitting = true

      const shouldRemove = isDeleteOnly || isMovieInRoom(currentRoomId)

      try {
        const res = shouldRemove
          ? await removeFromWatchlist(currentRoomId, props.movieId)
          : await addToWatchlist(props, currentRoomId)

        toast.success(
          shouldRemove
            ? `фильм «${res.item.title.toLowerCase()}» успешно удален из списка для просмотра`
            : `фильм «${res.item.title.toLowerCase()}» успешно добавлен в список для просмотра`,
          { title: 'успех' }
        )

        await syncRoomsState()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message.toLowerCase() : 'ошибка сети'
        toast.error(message, {
          title: shouldRemove ? 'ошибка удаления фильма' : 'ошибка добавления фильма'
        })
      } finally {
        isSubmitting = false
      }
    }
  })

  if (!isDeleteOnly && !hasContextMenu) {
    effect(() => {
      actionBtn.setIcon(getActionIcon())
    })
  }

  if (hasContextMenu) {
    cardActions.addEventListener('mouseleave', () => {
      contextMenu.style.display = 'none'
    })

    contextMenu.addEventListener('click', async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()

      const target = event.target as HTMLElement | null
      const currentItem = target?.closest<HTMLElement>('.movie-card__context-menu-item')
      if (!currentItem || isSubmitting) return

      const roomId = Number(currentItem.dataset.roomId)
      const roomName = currentItem.textContent?.toLowerCase() ?? ''
      const alreadyInRoom = isMovieInRoom(roomId)

      isSubmitting = true

      try {
        const res = alreadyInRoom
          ? await removeFromWatchlist(roomId, props.movieId)
          : await addToWatchlist(props, roomId)

        toast.success(
          alreadyInRoom
            ? `фильм «${res.item.title.toLowerCase()}» успешно удален из списка комнаты «${roomName}»`
            : `фильм «${res.item.title.toLowerCase()}» успешно добавлен в список комнаты «${roomName}»`,
          { title: 'успех' }
        )

        await syncRoomsState()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message.toLowerCase() : 'ошибка сети'
        toast.error(message, {
          title: alreadyInRoom ? 'ошибка удаления фильма' : 'ошибка добавления фильма'
        })
      } finally {
        isSubmitting = false
      }
    })

    actionBtn.element.appendChild(contextMenu)
  }

  cardActions.appendChild(actionBtn.element)

  return movieCardEl
}
