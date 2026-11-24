import './RoomsPage.scss'

import { getJoinedRoomsList, getRoomsList } from '@/api/rooms'
import type { Room } from '@/api/rooms/types'
import joinSvg from '@/assets/icons/join.svg?raw'
import { createButton } from '@/components/Button/Button'
import { createIconButton } from '@/components/IconButton/IconButton'
import { createInputField } from '@/components/Input/Input'
import { createRoomModal } from '@/components/Modal/CreateRoomModal/CreateRoomModal'
import { createJoinRoomModal } from '@/components/Modal/JoinRoomModal/JoinRoomModal'
import { createRoomCard } from '@/components/RoomCard/RoomCard'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { createTab } from '@/components/Tab/Tab'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'
import { effect, reactive } from '@/state/reactivity'
import { store } from '@/state/store'
import { debounce } from '@/utils/debounce'

import roomsPageTemplate from './RoomsPage.html?raw'

interface RoomsPageProps {
  isMocked?: boolean
}

export const MOCKED_ROOMS: Room[] = [
  {
    code: 'mocked-code-1',
    createdAt: new Date().toLocaleDateString(),
    createdBy: 1,
    id: 1,
    name: 'Комната 1',
    membersCount: 0,
    moviesCount: 0
  },
  {
    code: 'mocked-code-2',
    createdAt: new Date().toLocaleDateString(),
    createdBy: 1,
    id: 2,
    name: 'Комната 2',
    membersCount: 0,
    moviesCount: 0
  },
  {
    code: 'mocked-code-3',
    createdAt: new Date().toLocaleDateString(),
    createdBy: 1,
    id: 3,
    name: 'Комната 3',
    membersCount: 0,
    moviesCount: 0
  }
]

const pageTemplateEl = document.createElement('template')
pageTemplateEl.innerHTML = roomsPageTemplate

export function renderRoomsPage(props: RoomsPageProps) {
  const pageRoot = pageTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const roomsListEl = pageRoot.querySelector<HTMLElement>('.rooms-page__list')!
  const tabsEl = pageRoot.querySelector<HTMLElement>('.rooms-page__tabs')!
  const roomsListFiltersEl = pageRoot.querySelector<HTMLElement>('.rooms-page__filters')!
  const roomsListEmptyEl = pageRoot.querySelector<HTMLElement>('.rooms-page__empty')!
  const pageListEmptyTitleEl = pageRoot.querySelector<HTMLElement>(
    '.rooms-page__empty-text'
  )!

  let abortController: AbortController | null = null

  function showSkeletons(count = 3) {
    roomsListEmptyEl.style.display = 'none'
    roomsListEl.innerHTML = ''
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < count; i++) {
      fragment.appendChild(createSkeleton({ height: '135px' }))
    }
    roomsListEl.appendChild(fragment)
  }

  function renderList(rooms: Room[]) {
    roomsListEl.innerHTML = ''

    if (rooms.length === 0) {
      roomsListEmptyEl.style.display = 'flex'
      return
    }

    roomsListEmptyEl.style.display = 'none'
    const fragment = document.createDocumentFragment()
    for (const room of rooms) {
      fragment.appendChild(
        createRoomCard({
          ...room,
          isRoomOwner: store.user?.id === room.createdBy,
          async onRoomAction() {
            await fetchRooms()
          }
        })
      )
    }
    roomsListEl.appendChild(fragment)
  }

  async function fetchRooms(query: string = '') {
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    showSkeletons(3)

    try {
      const { rooms } = await state.getRooms(query, { signal: abortController.signal })
      store.rooms = rooms
      setTimeout(() => {
        if (query && !rooms.length) {
          roomsListEmptyEl.style.display = 'flex'
          pageListEmptyTitleEl.textContent = `не удалось найти комнаты по запросу «${query}»`
        }
        renderList(rooms)
      }, 300)
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }

      roomsListEl.innerHTML = ''
      roomsListEmptyEl.style.display = 'flex'
      toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
        title: 'Не удалось загрузить список комнат'
      })
    } finally {
      abortController = null
    }
  }

  const selfTab = createTab({
    text: 'мои комнаты',
    size: 'm',
    href: '/rooms?my',
    type: 'button'
  })
  const joinedTab = createTab({
    text: 'комнаты, в которых я участник',
    size: 'm',
    href: '/rooms?joined',
    type: 'button'
  })
  tabsEl.appendChild(selfTab.element)
  tabsEl.appendChild(joinedTab.element)

  const tabs = [
    { instance: selfTab, href: '/rooms?my' },
    { instance: joinedTab, href: '/rooms?joined' }
  ]

  const pathCleanup = effect(() => {
    const path = router.currentRoute
    if (!path) return

    tabs.forEach((tab) => {
      const isActive = path.startsWith(tab.href)
      tab.instance.toggleActive(isActive)
    })

    const isAnyActive = tabs.some((tab) => tab.instance.isActive)
    if (!isAnyActive) {
      selfTab.toggleActive(true)
    }
  })

  const state = reactive({
    getRooms: selfTab.isActive ? getRoomsList : getJoinedRoomsList
  })

  const handleSearch = debounce((query: string) => {
    fetchRooms(query)
  }, 300)

  const searchField = createInputField({
    label: 'Название',
    name: 'search',
    placeholder: 'Введите название комнаты',
    required: false,
    type: 'text',
    onInput(value) {
      handleSearch(value.trim())
    }
  })
  searchField.element.classList.add('rooms-page__search-field')

  const joinRoomModal = createJoinRoomModal()
  const joinRoomBtn = createIconButton({
    icon: joinSvg,
    size: 'm',
    type: 'outlined',
    onClick() {
      joinRoomModal.open()
    }
  })
  joinRoomBtn.element.classList.add('rooms-page__join-btn')

  const createModal = createRoomModal()
  const createBtn = createButton({
    text: 'Создать комнату',
    size: 'm',
    width: 'fit-content',
    type: 'outlined',
    onClick: () => createModal.open()
  })
  createBtn.classList.add('rooms-page__create-btn')

  roomsListFiltersEl.appendChild(searchField.element)
  roomsListFiltersEl.appendChild(joinRoomBtn.element)
  roomsListFiltersEl.appendChild(createBtn)

  if (props.isMocked) {
    renderList(MOCKED_ROOMS)
  } else {
    fetchRooms()
  }

  const cleanup = () => {
    if (abortController) {
      abortController.abort()
    }
    handleSearch.cancel()
    pathCleanup()
    tabs.forEach((tab) => tab.instance.cleanup())
  }

  return { element: pageRoot, cleanup }
}
