import './MoviesPage.scss'

import { getMovies } from '@/api/films'
import type { MovieItem } from '@/api/films/types'
import { getUserRoomsWithMovies } from '@/api/rooms'
import { createInputField } from '@/components/Input/Input'
import { createMovieCard } from '@/components/MovieCard/MovieCard'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'
import { effect, reactive } from '@/state/reactivity'
import { store } from '@/state/store'
import { setCurrentBreadcrumb } from '@/utils/breadcrumbs'
import { debounce } from '@/utils/debounce'

import pageTemplate from './MoviesPage.html?raw'

const pageTemplateEl = document.createElement('template')
pageTemplateEl.innerHTML = pageTemplate

interface MoviesPageState {
  movies: MovieItem[]
  query: string
  page: number
  totalPages: number
  isInitialLoading: boolean
  isMoreLoading: boolean
}

export async function renderMoviesPage() {
  const pageRoot = pageTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!
  const moviesListEl = pageRoot.querySelector<HTMLElement>('.movies-page__watchlist')!
  const pageFiltersEl = pageRoot.querySelector<HTMLElement>('.movies-page__filters')!
  const pageEmptyEl = pageRoot.querySelector<HTMLElement>('.movies-page__empty')!
  const pageEmptyTextEl = pageEmptyEl.querySelector<HTMLElement>(
    '.movies-page__empty-text'
  )!
  const sentinelEl = pageRoot.querySelector<HTMLElement>('.movies-page__sentinel')!
  const breadcrumbsEl = pageRoot.querySelector<HTMLElement>('.breadcrumbs')!

  const currentRoomId = router.params.roomId ? parseInt(router.params.roomId, 10) : null

  const state = reactive<MoviesPageState>({
    movies: [],
    query: 'a',
    page: 1,
    totalPages: 1,
    isInitialLoading: true,
    isMoreLoading: false
  })

  const baseSkeleton = createSkeleton({ height: '500px' })

  store.roomsWithMovies = await getUserRoomsWithMovies()

  const unsubs: Array<() => void> = []

  unsubs.push(
    effect(() => {
      if (!currentRoomId) {
        pageTitleEl.textContent = 'поиск фильмов'
        breadcrumbsEl.style.display = 'none'
        return
      }

      const currentRoom = store.rooms.find((r) => r.id === currentRoomId)
      pageTitleEl.textContent = currentRoom
        ? `поиск фильмов для комнаты «${currentRoom.name.toLowerCase()}»`
        : 'поиск фильмов'

      breadcrumbsEl.style.display = 'flex'
      router.setBreadcrumbs(breadcrumbsEl, currentRoom?.name)
      setCurrentBreadcrumb(breadcrumbsEl, 'каталог фильмов')
    })
  )

  unsubs.push(
    effect(() => {
      if (state.isInitialLoading) {
        pageEmptyEl.style.display = 'none'
        moviesListEl.style.display = 'grid'
        moviesListEl.innerHTML = ''

        const fragment = document.createDocumentFragment()
        for (let i = 0; i < 4; i++) {
          fragment.appendChild(baseSkeleton.cloneNode(true))
        }
        moviesListEl.appendChild(fragment)
        return
      }

      if (state.movies.length === 0) {
        moviesListEl.style.display = 'none'
        pageEmptyEl.style.display = 'flex'
      } else {
        moviesListEl.style.display = 'grid'
        pageEmptyEl.style.display = 'none'
      }
    })
  )

  unsubs.push(
    effect(() => {
      const hasMore = state.page <= state.totalPages
      const showSentinel = !state.isInitialLoading && state.movies.length > 0 && hasMore
      sentinelEl.style.display = showSentinel ? 'flex' : 'none'
    })
  )

  let abortController: AbortController | null = null

  function appendMoviesToDom(items: MovieItem[], clearBefore = false) {
    if (clearBefore) {
      moviesListEl.innerHTML = ''
    }

    const fragment = document.createDocumentFragment()
    for (const movieItem of items) {
      const card = createMovieCard({
        ...movieItem,
        deleteOnly: !!currentRoomId && !router.currentRoute?.endsWith('/movies'),
        showContextMenu: !currentRoomId
      })

      fragment.appendChild(card)
    }

    moviesListEl.appendChild(fragment)
  }

  async function fetchMovies(isNewQuery = false) {
    if (
      !isNewQuery &&
      (state.isMoreLoading || state.isInitialLoading || state.page > state.totalPages)
    ) {
      return
    }

    abortController?.abort()
    abortController = new AbortController()

    if (isNewQuery) {
      state.page = 1
      state.movies = []
      state.isInitialLoading = true
    } else {
      state.isMoreLoading = true
    }

    try {
      const data = await getMovies(state.query, state.page, {
        signal: abortController.signal
      })

      const results = data.results ?? []
      state.totalPages = data.total_pages || 1

      if (!results.length) {
        pageEmptyEl.style.display = 'flex'
        pageEmptyTextEl.textContent = `по запросу «${state.query}» ничего не найдено`
      }

      if (isNewQuery) {
        state.movies = results
        state.isInitialLoading = false
        if (results.length > 0) {
          appendMoviesToDom(results, true)
        }
      } else {
        state.movies.push(...results)
        appendMoviesToDom(results, false)
      }

      state.page++
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return

      state.isInitialLoading = false
      toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
        title: 'Ошибка при загрузке списка фильмов'
      })
    } finally {
      state.isMoreLoading = false
      abortController = null
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        fetchMovies(false)
      }
    },
    { root: null, rootMargin: '250px', threshold: 0 }
  )
  observer.observe(sentinelEl)

  const handleSearch = debounce((value: string) => {
    state.query = value.trim()
    fetchMovies(true)
  }, 400)

  const searchField = createInputField({
    label: 'Название',
    name: 'search',
    placeholder: 'Введите название фильма',
    required: false,
    type: 'text',
    onInput: handleSearch
  })
  pageFiltersEl.appendChild(searchField.element)

  fetchMovies(true)

  return {
    element: pageRoot,
    cleanup: () => {
      observer.disconnect()
      abortController?.abort()
      unsubs.forEach((unsub) => unsub())
      handleSearch.cancel()
    }
  }
}
