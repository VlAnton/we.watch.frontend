import './RoomDetailsPage.scss'

import { deleteRoom, getRoomDetails, leaveRoom } from '@/api/rooms'
import deleteSvg from '@/assets/icons/close.svg?raw'
import leaveSvg from '@/assets/icons/leave.svg?raw'
import { createButton } from '@/components/Button/Button'
import { createIconButton } from '@/components/IconButton/IconButton'
import { createInputField } from '@/components/Input/Input'
import { createConfirmModal } from '@/components/Modal/ConfirmModal/ConfirmModal'
import { createMovieCard } from '@/components/MovieCard/MovieCard'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'
import { effect, reactive } from '@/state/reactivity'
import { store } from '@/state/store'
import { setCurrentBreadcrumb } from '@/utils/breadcrumbs'
import { debounce } from '@/utils/debounce'

import pageTemplate from './RoomDetailsPage.html?raw'

const pageTemplateEl = document.createElement('template')
pageTemplateEl.innerHTML = pageTemplate

export async function renderRoomDetailsPage() {
  async function setWatchList(query: string = '') {
    const roomDetailsData = await getRoomDetails(roomId, query)
    const roomWatchlist = roomDetailsData.watchlist
    if (roomWatchlist.length > 0) {
      pageWatchlistEl.innerHTML = ''
      pageWatchlistEl.style.display = 'grid'
      pageEmptyEl.style.display = 'none'
      const fragment = document.createDocumentFragment()
      roomWatchlist.forEach((movie) => {
        const movieCard = createMovieCard({
          ...movie,
          deleteOnly: true,
          async onRoomDelete() {
            await setWatchList()
          }
        })
        fragment.appendChild(movieCard)
      })
      pageWatchlistEl.appendChild(fragment)
    } else {
      pageWatchlistEl.style.display = 'none'
      pageEmptyEl.style.display = 'flex'
      if (query.length > 0) {
        pageEmptyTextEl.textContent = `по запросу «${query}» ничего не найдено`
      }
    }
    state.pageTitle = roomDetailsData.room.name
  }

  const state = reactive({
    pageTitle: ''
  })

  const unsubs: Array<() => void> = []

  unsubs.push(
    effect(() => {
      if (!state.pageTitle) {
        return
      }
      pageTitleEl.textContent = state.pageTitle
      setCurrentBreadcrumb(breadcrumbsEl, `комната «${state.pageTitle}»`)
    })
  )

  const pageRoot = pageTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const pageHeaderEl = pageRoot.querySelector<HTMLElement>('.page__header')!
  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!
  const pageWatchlistEl = pageRoot.querySelector<HTMLElement>(
    '.room-details-page__watchlist'
  )!
  const pageFiltersEl = pageRoot.querySelector<HTMLElement>(
    '.room-details-page__filters'
  )!
  const pageEmptyEl = pageRoot.querySelector<HTMLElement>('.room-details-page__empty')!
  const pageEmptyTextEl = pageEmptyEl.querySelector<HTMLElement>(
    '.room-details-page__empty-text'
  )!
  const breadcrumbsEl = pageRoot.querySelector<HTMLElement>('.breadcrumbs')!

  router.setBreadcrumbs(breadcrumbsEl)

  const roomId = parseInt(router.params.roomId, 10)
  const room = store.rooms.find((room) => room.id === roomId)
  const isRoomOwner = store.user?.id === room?.createdBy

  const confirmModal = createConfirmModal({
    title: isRoomOwner
      ? 'вы уверены что хотите удалить комнату?'
      : 'вы уверены что хотите выйти из комнаты?',
    confirmText: isRoomOwner ? 'удалить' : 'выйти',
    async onConfirm() {
      try {
        if (isRoomOwner) {
          await deleteRoom(roomId)
        } else {
          await leaveRoom(roomId)
        }
        router.navigate('/rooms?my')
      } catch (err) {
        toast.error(err instanceof Error ? err?.message : 'не удалось выйти из комнаты', {
          title: 'ошибка'
        })
      }
    }
  })

  const leaveBtn = createIconButton({
    icon: isRoomOwner ? deleteSvg : leaveSvg,
    size: 'm',
    type: 'primary',
    async onClick() {
      confirmModal.open()
    }
  })

  pageHeaderEl.appendChild(leaveBtn.element)

  const skeleton = createSkeleton({ height: '500px' })

  const handleSearch = debounce((query: string) => {
    setWatchList(query)
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
      const fragment = document.createDocumentFragment()
      for (let i = 0; i < 4; i++) {
        fragment.appendChild(skeleton.cloneNode(true))
      }
      pageWatchlistEl.innerHTML = ''
      pageWatchlistEl.appendChild(fragment)
      handleSearch(value)
    }
  })
  const toMoviesCatalogBtn = createButton({
    text: 'добавить фильм',
    size: 'm',
    type: 'outlined',
    width: '170px',
    onClick: () => {
      router.navigate(`/rooms/${roomId}/movies`)
    }
  })
  pageFiltersEl.appendChild(searchField.element)
  pageFiltersEl.appendChild(toMoviesCatalogBtn)

  try {
    await setWatchList()
  } catch (err) {
    toast.error(err instanceof Error ? err.message.toLowerCase() : 'ошибка сети', {
      title: 'ошибка при загрузке комнаты'
    })
  }

  return {
    element: pageRoot,
    cleanup: () => {
      unsubs.forEach((unsub) => unsub())
      handleSearch.cancel()
    }
  }
}
