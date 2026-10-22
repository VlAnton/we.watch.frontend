import './MoviesPage.scss'

import { getMovies } from '@/api/films'
import { createInputField } from '@/components/Input/Input'
import { createMovieCard } from '@/components/MovieCard/MovieCard'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { toast } from '@/components/Toast/Toast'
import { debounce } from '@/utils/debounce'

import pageTemplate from './MoviesPage.html?raw'

async function setMovies(
  moviesListEl: HTMLElement,
  pageEmptyEl: HTMLElement,
  query: string = ''
) {
  const { results } = await getMovies(query)
  moviesListEl.innerHTML = ''

  results.forEach((movieItem) => {
    const card = createMovieCard({
      ...movieItem
    })
    moviesListEl.appendChild(card)
  })

  if (results.length > 0) {
    moviesListEl.style.display = 'grid'
    pageEmptyEl.style.display = 'none'
  } else {
    moviesListEl.style.display = 'none'
    pageEmptyEl.style.display = 'flex'
  }
}

export async function renderMoviesPage() {
  const parser = new DOMParser()
  const doc = parser.parseFromString(pageTemplate, 'text/html')
  const pageRoot = doc.body.firstElementChild as HTMLElement

  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!

  pageTitleEl.textContent = 'Поиск по фильмам'
  const moviesListEl = pageRoot.querySelector<HTMLElement>('.movies-page__watchlist')!
  const pageFiltersEl = pageRoot.querySelector<HTMLElement>('.movies-page__filters')!
  const pageEmptyEl = pageRoot.querySelector<HTMLElement>('.movies-page__empty')!

  const skeleton = createSkeleton({ size: 'l' })

  const handleSearch = debounce((query: string) => {
    setMovies(moviesListEl, pageEmptyEl, query)
  }, 400)

  const searchField = createInputField({
    label: 'Название',
    name: 'search',
    placeholder: 'Введите название фильма',
    required: false,
    type: 'text',
    onInput(value) {
      pageEmptyEl.style.display = 'none'
      moviesListEl.style.display = 'grid'
      skeleton.style.height = '636px'
      moviesListEl.innerHTML = `
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
      `
      handleSearch(value)
    }
  })
  pageFiltersEl.appendChild(searchField.element)

  try {
    await setMovies(moviesListEl, pageEmptyEl, 'a')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
      title: 'Ошибка при загрузке списка фильмов'
    })
  }

  return pageRoot
}
