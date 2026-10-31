import './MovieCard.scss'

import { MovieItem } from '@/api/films/types'
import { addToWatchlist, getUserRoomsWithMovies } from '@/api/rooms'
import { RoomWithMovies } from '@/api/rooms/types'
import plusIconSvg from '@/assets/icons/plus.svg?raw'
import { router } from '@/main'

import { createIconButton } from '../IconButton/IconButton'
import { createPoster } from '../Image/Image'
import { toast } from '../Toast/Toast'
import movieCardTemplate from './MovieCard.html?raw'

interface MovieCardProps extends MovieItem {
  showContextMenu: boolean
  rooms?: RoomWithMovies[]
  onRoomsUpdate?: (updatedRooms: RoomWithMovies[]) => void
}

export function createMovieCard(props: MovieCardProps) {
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

  // Локальная ссылка на комнаты текущей карточки
  let currentRooms = props.rooms ?? []

  const contextMenu = document.createElement('div')
  contextMenu.classList.add('movie-card__context-menu')
  contextMenu.style.display = 'none'

  const addBtn = createIconButton({
    icon: plusIconSvg,
    size: 's',
    type: 'primary',
    onClick() {
      if (!props.showContextMenu) {
        addToWatchlist(props, parseInt(router.params.roomId, 10))
          .then(async (res) => {
            toast.success(
              `фильм «${res.item.title.toLowerCase()}» успешно добавлен в список для просмотра`,
              { title: 'успех' }
            )
            const freshRooms = await getUserRoomsWithMovies()
            props.onRoomsUpdate?.(freshRooms)
          })
          .catch((err) => {
            toast.error(err.message, {
              title: 'Ошибка добавления фильма'
            })
          })
        return
      }

      renderMenuItems()
      contextMenu.style.display = 'flex'
    }
  })

  contextMenu.addEventListener('mouseleave', () => {
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

    try {
      const res = await addToWatchlist(props, roomId)
      toast.success(
        `фильм «${res.item.title.toLowerCase()}» успешно добавлен в список для просмотра комнаты ${roomName.toLowerCase()}`,
        { title: 'успех' }
      )

      const freshRooms = await getUserRoomsWithMovies()

      currentRooms = freshRooms
      renderMenuItems()

      props.onRoomsUpdate?.(freshRooms)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message, {
        title: 'ошибка добавления фильма'
      })
    }
  })

  addBtn.appendChild(contextMenu)
  cardActions.appendChild(addBtn)

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
