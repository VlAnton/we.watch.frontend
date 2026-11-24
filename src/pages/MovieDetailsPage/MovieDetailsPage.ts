import './MovieDetailsPage.scss'

import { getTMDBMovieDetails } from '@/api/films'
import type { MovieItem, TMDBCastItem, TMDBMovieDetails } from '@/api/films/types'
import {
  addToWatchlist,
  getRoomDetails,
  getUserRoomsWithMovies,
  removeFromWatchlist
} from '@/api/rooms'
import type { RoomWithMovies } from '@/api/rooms/types'
import plusSvg from '@/assets/icons/plus.svg?raw'
import { createButton } from '@/components/Button/Button'
import { createContextMenu } from '@/components/ContextMenu/ContextMenu'
import { createPoster } from '@/components/Image/Image'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'
import { store } from '@/state/store'
import { setCurrentBreadcrumb } from '@/utils/breadcrumbs'

import pageTemplate from './MovieDetailsPage.html?raw'

const pageTemplateEl = document.createElement('template')
pageTemplateEl.innerHTML = pageTemplate

type MovieInfoField = readonly [key: keyof TMDBMovieDetails['data'], label: string]

const MOVIE_INFO_FIELDS = [
  ['releaseDate', 'дата выхода'],
  ['genres', 'жанры'],
  ['tagline', 'слоган'],
  ['directors', 'режиссер'],
  ['writers', 'сценарист'],
  ['producers', 'продюсер'],
  ['cinematographers', 'оператор'],
  ['editors', 'монтажер'],
  ['budgetUsd', 'бюджет'],
  ['runtimeMinutes', 'время']
] as const satisfies readonly MovieInfoField[]

export async function renderMovieDetailsPage() {
  const pageRoot = pageTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const posterContainerEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__poster-container'
  )!
  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!
  const pageActionEl = pageRoot.querySelector<HTMLElement>('.movie-details-page__action')!
  const pageOverviewEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__overview'
  )!
  const pageOriginalTitleEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__original-title'
  )!
  const pageInfoEl = pageRoot.querySelector<HTMLElement>('.movie-details-page__info')!
  const ratingEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__rating-container'
  )!
  const castEl = pageRoot.querySelector<HTMLElement>('.movie-details-page__cast')!
  const breadcrumbsEl = pageRoot.querySelector<HTMLElement>('.breadcrumbs')!

  let contextMenuCleanup: (() => void) | null = null
  let isSubmitting = false

  function isMovieInRoom(roomId: number | null, movieId: number): boolean {
    if (!roomId) return false
    const targetRoom = store.roomsWithMovies.find((room) => room.id === roomId)
    return Boolean(targetRoom?.watchlist.some((movie) => movie.movieId === movieId))
  }

  function setMovieActions(movie: MovieItem) {
    const contextMenu = createContextMenu({
      renderItem(room: RoomWithMovies) {
        const inRoom = room.watchlist.some((m) => m.movieId === movie.movieId)
        const itemEl = document.createElement('div')
        itemEl.className = 'context-menu__item'
        itemEl.textContent = room.name
        itemEl.dataset.roomId = String(room.id)

        if (inRoom) {
          itemEl.classList.add('context-menu__item--active')
        }
        return itemEl
      },
      async onSelect(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        const target = event.target as HTMLElement | null
        const currentItem = target?.closest<HTMLElement>('.context-menu__item')
        if (!currentItem || isSubmitting) return

        const roomId = Number(currentItem.dataset.roomId)
        const roomName = currentItem.textContent?.toLowerCase() ?? ''
        const alreadyInRoom = isMovieInRoom(roomId, movie.movieId)

        isSubmitting = true

        try {
          const res = alreadyInRoom
            ? await removeFromWatchlist(roomId, movie.movieId)
            : await addToWatchlist(movie, roomId)

          toast.success(
            alreadyInRoom
              ? `фильм «${res.item.title.toLowerCase()}» успешно удален из списка комнаты «${roomName}»`
              : `фильм «${res.item.title.toLowerCase()}» успешно добавлен в список комнаты «${roomName}»`,
            { title: 'успех' }
          )

          store.roomsWithMovies = await getUserRoomsWithMovies()
          contextMenu.setItems(store.roomsWithMovies)
          contextMenu.open()
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message.toLowerCase() : 'ошибка сети'
          toast.error(message, {
            title: alreadyInRoom ? 'ошибка удаления фильма' : 'ошибка добавления фильма'
          })
        } finally {
          isSubmitting = false
        }
      }
    })

    contextMenuCleanup = contextMenu.cleanup

    const addToRoomBtn = createButton({
      text: 'добавить в комнату',
      icon: plusSvg,
      async onClick(event) {
        event?.preventDefault()
        event?.stopPropagation()

        const isOpening = contextMenu.element.style.display !== 'flex'
        if (!isOpening) {
          contextMenu.close()
          return
        }

        if (store.roomsWithMovies.length === 0) {
          store.roomsWithMovies = await getUserRoomsWithMovies()
        }

        contextMenu.setItems(store.roomsWithMovies)
        contextMenu.open()
      }
    })

    pageActionEl.addEventListener('mouseleave', () => {
      contextMenu.close()
    })

    pageActionEl.appendChild(addToRoomBtn)
    pageActionEl.appendChild(contextMenu.element)
  }

  function setCast(cast: TMDBCastItem[]) {
    const fragment = document.createDocumentFragment()
    cast.forEach((actor) => {
      const actorLink = document.createElement('a')
      actorLink.classList.add('link', 'link__s', 'link__alternate')
      actorLink.textContent = actor.name
      fragment.appendChild(actorLink)
    })
    castEl.appendChild(fragment)
  }

  function setRating(rating: number, votes: number) {
    const ratingTextEl = document.createElement('h3')
    ratingTextEl.classList.add('movie-details-page__rating')
    ratingTextEl.textContent = rating.toString()
    ratingEl.appendChild(ratingTextEl)

    const votesEl = document.createElement('p')
    votesEl.classList.add('movie-details-page__votes')
    votesEl.textContent = `${votes} оценок`
    ratingEl.appendChild(votesEl)
  }

  function setMovieInfo(movieDetails: TMDBMovieDetails['data']) {
    const fragment = document.createDocumentFragment()
    MOVIE_INFO_FIELDS.forEach(([field, title]) => {
      const rowTitle = document.createElement('p')
      const rawValue = movieDetails[field]
      const fieldData = Array.isArray(rawValue)
        ? rawValue
            .map((v) =>
              typeof v === 'object' && v !== null && 'name' in v ? v.name : String(v)
            )
            .join(', ')
        : rawValue?.toString() || 'неизвестно'

      rowTitle.textContent = title

      const rowData = document.createElement('p')
      rowData.textContent = fieldData.toLowerCase()

      fragment.appendChild(rowTitle)
      fragment.appendChild(rowData)
    })
    pageInfoEl.appendChild(fragment)
  }

  const roomId = router.params.roomId ? parseInt(router.params.roomId, 10) : null
  const movieId = parseInt(router.params.movieId, 10)
  let room

  if (roomId) {
    try {
      const roomDetails = await getRoomDetails(roomId)
      room = roomDetails.room
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : err)
    }
  }
  router.setBreadcrumbs(breadcrumbsEl, room?.name)

  try {
    const { success, data: movieDetails } = await getTMDBMovieDetails(movieId)
    if (!success) {
      throw new Error('попробуйте перезагрузить страницу')
    }

    setCurrentBreadcrumb(breadcrumbsEl, movieDetails.title.toLowerCase())

    const posterEl = createPoster({
      posterPath: movieDetails.posterPath,
      title: movieDetails.title,
      targetSize: 'w500'
    })

    setMovieActions({
      movieId: movieDetails.movieId,
      title: movieDetails.title,
      posterPath: movieDetails.posterPath ?? ''
    })

    pageTitleEl.textContent = movieDetails.title
    pageOverviewEl.textContent = movieDetails.overview
    pageOriginalTitleEl.textContent = movieDetails.originalTitle
    posterContainerEl.appendChild(posterEl)
    setCast(movieDetails.cast)
    setRating(movieDetails.rating, movieDetails.votes)
    setMovieInfo(movieDetails)
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'ошибка сети', {
      title: 'ошибка загрузки данных о фильме'
    })
  }

  return {
    element: pageRoot,
    cleanup: () => {
      contextMenuCleanup?.()
    }
  }
}
