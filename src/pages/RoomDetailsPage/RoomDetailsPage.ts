import './RoomDetailsPage.scss'

import { getRoomDetails } from '@/api/rooms'
import { createButton } from '@/components/Button/Button'
import { createInputField } from '@/components/Input/Input'
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
  const roomDetailsData = await getRoomDetails(parseInt(router.params.id), query)
  const roomWatchlist = roomDetailsData.watchlist
  if (roomWatchlist.length > 0) {
    pageWatchlistEl.style.display = 'flex'
    pageEmptyEl.style.display = 'none'
    pageWatchlistEl.textContent = roomWatchlist.toString()
  } else {
    pageWatchlistEl.style.display = 'none'
    pageEmptyEl.style.display = 'flex'
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
      skeleton.style.height = '100%'
      pageWatchlistEl.innerHTML = `
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
      `
      handleSearch(value)
    }
  })
  const toMoviesCatatlogBtn = createButton({
    text: 'добавить фильм',
    size: 'm',
    type: 'primary',
    width: 'fit-content',
    onCLick: () => {
      router.navigate('/movies')
    }
  })
  pageFiltersEl.appendChild(searchField.element)
  pageFiltersEl.appendChild(toMoviesCatatlogBtn)

  try {
    await setWatchList(pageWatchlistEl, pageEmptyEl, pageTitleEl)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
      title: 'Ошибка при загрузке комнаты'
    })
  }

  return pageRoot
}
