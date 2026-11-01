import './MoviesPage.scss'

import { getMovies } from '@/api/films'
import { getUserRoomsWithMovies } from '@/api/rooms'
import { RoomWithMovies } from '@/api/rooms/types'
import { createInputField } from '@/components/Input/Input'
import { createMovieCard } from '@/components/MovieCard/MovieCard'
import { MovieCard } from '@/components/MovieCard/types'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'
import { debounce } from '@/utils/debounce'

import pageTemplate from './MoviesPage.html?raw'

export async function renderMoviesPage() {
  let activeRooms: RoomWithMovies[] = []
  const currentRoomId = parseInt(router.params.roomId, 10)

  function updateAllCardsRooms(card: MovieCard, freshRooms: RoomWithMovies[]) {
    activeRooms = freshRooms
    card.updateRooms(freshRooms)
  }

  function showInitialSkeletons() {
    pageEmptyEl.style.display = 'none'
    sentinelEl.style.display = 'none'
    moviesListEl.style.display = 'grid'
    moviesListEl.innerHTML = `
      ${skeleton.outerHTML}
      ${skeleton.outerHTML}
      ${skeleton.outerHTML}
      ${skeleton.outerHTML}
    `
  }

  async function fetchMovies(isNewQuery: boolean = false) {
    if (isLoading) return
    if (!isNewQuery && currentPage > totalPages) return

    isLoading = true
    const currentRequestId = ++lastRequestId

    if (isNewQuery) {
      currentPage = 1
      showInitialSkeletons()
    } else {
      sentinelEl.style.display = 'flex'
    }

    try {
      const data = await getMovies(currentQuery, currentPage)

      if (currentRequestId !== lastRequestId) return

      if (isNewQuery) {
        moviesListEl.innerHTML = ''
      }

      totalPages = data.total_pages || 1

      if (isNewQuery && (!data.results || data.results.length === 0)) {
        moviesListEl.style.display = 'none'
        sentinelEl.style.display = 'none'
        pageEmptyEl.style.display = 'flex'
        return
      }

      moviesListEl.style.display = 'grid'
      pageEmptyEl.style.display = 'none'

      const fragment = document.createDocumentFragment()
      data.results.forEach((movieItem) => {
        const card = createMovieCard({
          ...movieItem,
          showContextMenu: !currentRoomId,
          rooms: activeRooms,
          onRoomsUpdate: function (rooms: RoomWithMovies[]) {
            updateAllCardsRooms(card, rooms)
          }
        })
        fragment.appendChild(card.element)
      })
      moviesListEl.appendChild(fragment)

      currentPage++

      sentinelEl.style.display = currentPage <= totalPages ? 'flex' : 'none'
    } catch (err) {
      if (currentRequestId !== lastRequestId) return

      if (isNewQuery) {
        moviesListEl.innerHTML = ''
      }
      toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
        title: 'Ошибка при загрузке списка фильмов'
      })
    } finally {
      isLoading = false
    }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(pageTemplate, 'text/html')
  const pageRoot = doc.body.firstElementChild as HTMLElement

  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!
  pageTitleEl.textContent = 'Поиск по фильмам'

  const moviesListEl = pageRoot.querySelector<HTMLElement>('.movies-page__watchlist')!
  const pageFiltersEl = pageRoot.querySelector<HTMLElement>('.movies-page__filters')!
  const pageEmptyEl = pageRoot.querySelector<HTMLElement>('.movies-page__empty')!
  const sentinelEl = pageRoot.querySelector<HTMLElement>('.movies-page__sentinel')!

  let currentQuery = 'a'
  let currentPage = 1
  let totalPages = 1
  let isLoading = false
  let lastRequestId = 0

  const skeleton = createSkeleton({ size: 'l' })
  skeleton.style.height = '500px'

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoading && currentPage <= totalPages) {
        fetchMovies(false)
      }
    },
    {
      root: null,
      rootMargin: '250px',
      threshold: 0
    }
  )

  observer.observe(sentinelEl)

  const handleSearch = debounce((query: string) => {
    currentQuery = query.trim()
    fetchMovies(true)
  }, 400)

  const searchField = createInputField({
    label: 'Название',
    name: 'search',
    placeholder: 'Введите название фильма',
    required: false,
    type: 'text',
    onInput(value) {
      handleSearch(value)
    }
  })
  pageFiltersEl.appendChild(searchField.element)

  moviesListEl.addEventListener('mouseenter', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null

    const currentCard = target?.closest<HTMLElement>('.movie-card')
    if (!currentCard) {
      return
    }
    const contextMenu = currentCard.querySelector<HTMLElement>(
      '.movie-card__context-menu'
    )!
    if (!contextMenu) {
      return
    }
    contextMenu.style.visibility = 'visible'
  })
  moviesListEl.addEventListener('mouseleave', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    const currentCard = target?.closest<HTMLElement>('.movie-card')
    if (!currentCard || !moviesListEl.contains(currentCard)) return

    const related = event.relatedTarget as Node | null

    if (related && currentCard.contains(related)) {
      return
    }
  })

  activeRooms = await getUserRoomsWithMovies()
  await fetchMovies(true)

  if (currentRoomId) {
    const currentRoom = activeRooms.find((room) => room.id === currentRoomId)
    const currentRoomName = currentRoom?.name.toLowerCase()
    pageTitleEl.textContent = currentRoom
      ? `поиск фильмов для комнаты «${currentRoomName}»`
      : pageTitleEl.textContent

    const breadcrumbsEl = pageRoot.querySelector<HTMLElement>('.breadcrumbs')!
    const roomBreadcrumb = document.createElement('a')
    roomBreadcrumb.classList.add('link', 'link__sm', 'link__breadcrumb')
    roomBreadcrumb.href = `/rooms/${currentRoom?.id}`
    roomBreadcrumb.textContent = currentRoomName ?? ''
    if (currentRoom) {
      breadcrumbsEl.appendChild(roomBreadcrumb)
    }
  }

  return {
    element: pageRoot,
    cleanup: () => {
      observer.disconnect()
    }
  }
}
