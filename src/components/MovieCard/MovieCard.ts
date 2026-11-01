import './MovieCard.scss'

import { MovieItem } from '@/api/films/types'
import { addToWatchlist, getUserRoomsWithMovies, removeFromWatchlist } from '@/api/rooms'
import { RoomWithMovies } from '@/api/rooms/types'
import closeIconSvg from '@/assets/icons/close.svg?raw'
import plusIconSvg from '@/assets/icons/plus.svg?raw'
import { router } from '@/main'

import { createIconButton, IconButton } from '../IconButton/IconButton'
import { createPoster } from '../Image/Image'
import { toast } from '../Toast/Toast'
import movieCardTemplate from './MovieCard.html?raw'

interface MovieCardProps extends MovieItem {
  showContextMenu: boolean
  deleteOnly?: boolean
  rooms?: RoomWithMovies[]
  onRoomsUpdate?: (updatedRooms: RoomWithMovies[]) => void
}

export function createMovieCard(props: MovieCardProps) {
  function getIsMovieInTheRoom(roomId: number) {
    return !!currentRooms.find(
      (room) =>
        room.id === roomId &&
        !!room.watchlist.find((movie) => props.movieId === movie.movieId)
    )
  }

  async function actionCallback(btn: IconButton, icon: string, successText: string) {
    toast.success(successText, { title: 'успех' })
    const freshRooms = await getUserRoomsWithMovies()
    props.onRoomsUpdate?.(freshRooms)
    btn.setIcon(icon)
  }

  function renderMenuItems() {
    contextMenu.innerHTML = ''
    const fragment = document.createDocumentFragment()

    currentRooms.forEach((room) => {
      const isMovieInTheRoom = room.watchlist.some(
        (movie) => props.movieId === movie.movieId
      )
      const contextMenuItem = document.createElement('div')
      contextMenuItem.classList.add('movie-card__context-menu-item')
      contextMenuItem.textContent = room.name
      contextMenuItem.id = String(room.id)

      if (isMovieInTheRoom) {
        contextMenuItem.classList.add('movie-card__context-menu-item--active')
      }
      fragment.appendChild(contextMenuItem)
    })

    contextMenu.appendChild(fragment)
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(movieCardTemplate, 'text/html')
  const movieCardEl = doc.body.firstElementChild as HTMLElement
  movieCardEl.id = `movie-${props.movieId}`

  const cardTitle = movieCardEl.querySelector<HTMLElement>('.card__title')!
  const cardActions = movieCardEl.querySelector<HTMLElement>('.movie-card__actions')!
  const cardImgContainer = movieCardEl.querySelector<HTMLElement>(
    '.movie-card__img-container'
  )!
  const posterElement = createPoster({
    posterPath: props.posterPath,
    title: props.title,
    targetSize: 'w342'
  })

  let currentRooms = props.rooms ?? []
  const currentRoomId = parseInt(router.params.roomId, 10)
  let isMovieInTheCurrentRoom = getIsMovieInTheRoom(currentRoomId)

  const contextMenu = document.createElement('div')
  contextMenu.classList.add('movie-card__context-menu')
  contextMenu.style.display = 'none'

  const addBtn = createIconButton({
    icon: isMovieInTheCurrentRoom || props.deleteOnly ? closeIconSvg : plusIconSvg,
    size: 's',
    type: 'primary',
    onClick() {
      if (props.showContextMenu) {
        renderMenuItems()
        contextMenu.style.display = 'flex'
        return
      }
      if (isMovieInTheCurrentRoom || props.deleteOnly) {
        removeFromWatchlist(currentRoomId, props.movieId)
          .then(async (res) => {
            await actionCallback(
              addBtn,
              plusIconSvg,
              `фильм «${res.item.title.toLowerCase()}» успешно удален из списка для просмотра`
            )
          })
          .catch((err) => {
            toast.error(err.message.toLowerCase(), {
              title: 'ошибка удаления фильма'
            })
          })
      } else {
        addToWatchlist(props, currentRoomId)
          .then(async (res) => {
            await actionCallback(
              addBtn,
              closeIconSvg,
              `фильм «${res.item.title.toLowerCase()}» успешно добавлен в список для просмотра`
            )
          })
          .catch((err) => {
            toast.error(err.message.toLowerCase(), {
              title: 'ошибка добавления фильма'
            })
          })
      }
      getUserRoomsWithMovies().then((res) => {
        currentRooms = res
        isMovieInTheCurrentRoom = getIsMovieInTheRoom(currentRoomId)
      })
    }
  })

  cardActions.addEventListener('mouseleave', () => {
    contextMenu.style.display = 'none'
  })

  contextMenu.addEventListener('click', async (event: Event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    const target = event.target as HTMLElement | null
    const currentItem = target?.closest<HTMLElement>('.movie-card__context-menu-item')

    if (!currentItem) return

    const roomId = parseInt(currentItem.id, 10)
    const roomName = currentItem.textContent || ''
    const isMovieInTheRoom = getIsMovieInTheRoom(roomId)

    try {
      const res = isMovieInTheRoom
        ? await removeFromWatchlist(roomId, props.movieId)
        : await addToWatchlist(props, roomId)
      toast.success(
        isMovieInTheRoom
          ? `фильм «${res.item.title.toLowerCase()}» успешно добавлен в список для просмотра комнаты ${roomName.toLowerCase()}`
          : `фильм «${res.item.title.toLowerCase()}» успешно удален из списка для просмотра`,
        { title: 'успех' }
      )

      const freshRooms = await getUserRoomsWithMovies()

      currentRooms = freshRooms
      renderMenuItems()

      props.onRoomsUpdate?.(freshRooms)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message, {
        title: isMovieInTheRoom ? 'ошибка добавления фильма' : 'ошибка удаления фильма'
      })
    }
  })

  addBtn.element.appendChild(contextMenu)
  cardActions.appendChild(addBtn.element)

  cardTitle.innerHTML = props.title
  cardImgContainer.appendChild(posterElement)

  return {
    element: movieCardEl,
    updateRooms: function (newRooms: RoomWithMovies[]) {
      currentRooms = newRooms
      renderMenuItems()
    }
  }
}
