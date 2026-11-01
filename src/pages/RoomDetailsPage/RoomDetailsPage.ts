import './RoomDetailsPage.scss'

import { getRoomDetails } from '@/api/rooms'
import { createButton } from '@/components/Button/Button'
import { createInputField } from '@/components/Input/Input'
import { createMovieCard } from '@/components/MovieCard/MovieCard'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'
import { debounce } from '@/utils/debounce'

import pageTemplate from './RoomDetailsPage.html?raw'

async function setWatchList(
  pageWatchlistEl: HTMLElement,
  pageEmptyEl: HTMLElement,
  pageTitleEl: HTMLElement,
  query: string = ''
) {
  const roomId = parseInt(router.params.roomId, 10)
  const roomDetailsData = await getRoomDetails(roomId, query)
  const roomWatchlist = roomDetailsData.watchlist
  if (roomWatchlist.length > 0) {
    pageWatchlistEl.innerHTML = ''
    pageWatchlistEl.style.display = 'grid'
    pageEmptyEl.style.display = 'none'
    roomWatchlist.forEach((movie) => {
      const movieCard = createMovieCard({
        ...movie,
        showContextMenu: false,
        deleteOnly: true,
        onRoomsUpdate() {
          setWatchList(pageWatchlistEl, pageEmptyEl, pageTitleEl, query)
        }
      })
      pageWatchlistEl.appendChild(movieCard.element)
    })
  } else {
    pageWatchlistEl.style.display = 'none'
    pageEmptyEl.style.display = 'flex'
    if (query.length > 0) {
      const pageEmotyTextEl = pageEmptyEl.querySelector<HTMLElement>(
        '.room-details-page__empty-text'
      )!
      pageEmotyTextEl.textContent = `по запросу «${query}» ничего не найдено`
    }
  }
  pageTitleEl.textContent = roomDetailsData.room.name
}

export async function renderRoomDetailsPage() {
  const parser = new DOMParser()
  const doc = parser.parseFromString(pageTemplate, 'text/html')
  const pageRoot = doc.body.firstElementChild as HTMLElement

  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!
  const pageWatchlistEl = pageRoot.querySelector<HTMLElement>(
    '.room-details-page__watchlist'
  )!
  const pageFiltersEl = pageRoot.querySelector<HTMLElement>(
    '.room-details-page__filters'
  )!
  const pageEmptyEl = pageRoot.querySelector<HTMLElement>('.room-details-page__empty')!

  const skeleton = createSkeleton({ size: 'l' })

  const handleSearch = debounce((query: string) => {
    setWatchList(pageWatchlistEl, pageEmptyEl, pageTitleEl, query)
  }, 400)

  const searchField = createInputField({
    label: 'Название',
    name: 'search',
    placeholder: 'Введите название фильма',
    required: false,
    type: 'text',
    onInput(value) {
      pageEmptyEl.style.display = 'none'
      pageWatchlistEl.style.display = 'grid'
      skeleton.style.height = '500px'
      pageWatchlistEl.innerHTML = `
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
      `
      handleSearch(value)
    }
  })
  const toMoviesCatalogBtn = createButton({
    text: 'добавить фильм',
    size: 'm',
    type: 'primary',
    width: 'fit-content',
    onCLick: () => {
      router.navigate(`/rooms/${router.params.roomId}/movies`)
    }
  })
  pageFiltersEl.appendChild(searchField.element)
  pageFiltersEl.appendChild(toMoviesCatalogBtn)

  try {
    await setWatchList(pageWatchlistEl, pageEmptyEl, pageTitleEl)
  } catch (err) {
    toast.error(err instanceof Error ? err.message.toLowerCase() : 'ошибка сети', {
      title: 'ошибка при загрузке комнаты'
    })
  }

  return pageRoot
}
