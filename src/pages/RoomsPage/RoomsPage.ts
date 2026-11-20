import './RoomsPage.scss'

import { getRoomsList } from '@/api/rooms'
import type { Room } from '@/api/rooms/types'
import { createButton } from '@/components/Button/Button'
import { createInputField } from '@/components/Input/Input'
import { createRoomModal } from '@/components/Modal/CreateRoomModal/CreateRoomModal'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { toast } from '@/components/Toast/Toast'
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
    name: 'Комната 1'
  },
  {
    code: 'mocked-code-2',
    createdAt: new Date().toLocaleDateString(),
    createdBy: 1,
    id: 2,
    name: 'Комната 2'
  },
  {
    code: 'mocked-code-3',
    createdAt: new Date().toLocaleDateString(),
    createdBy: 1,
    id: 3,
    name: 'Комната 3'
  }
]

const pageTemplateEl = document.createElement('template')
pageTemplateEl.innerHTML = roomsPageTemplate

function createRoomCard(room: Pick<Room, 'id' | 'name'>): HTMLAnchorElement {
  const card = document.createElement('a')
  card.className = 'rooms-page__room-card'
  card.href = `/rooms/${room.id}`

  const title = document.createElement('h3')
  title.className = 'rooms-page__room-card-title'
  title.textContent = room.name

  card.appendChild(title)
  return card
}

export function renderRoomsPage(props: RoomsPageProps) {
  const pageRoot = pageTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const roomsListEl = pageRoot.querySelector<HTMLElement>('.rooms-page__list')!
  const roomsListFiltersEl = pageRoot.querySelector<HTMLElement>('.rooms-page__filters')!
  const roomsListEmptyEl = pageRoot.querySelector<HTMLElement>('.rooms-page__empty')!
  const pageListEmptyTitleEl = pageRoot.querySelector<HTMLElement>(
    '.rooms-page__empty-text'
  )!

  let abortController: AbortController | null = null

  const showSkeletons = (count = 3) => {
    roomsListEmptyEl.style.display = 'none'
    roomsListEl.innerHTML = ''
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < count; i++) {
      fragment.appendChild(createSkeleton({ height: '80px' }))
    }
    roomsListEl.appendChild(fragment)
  }

  const renderList = (rooms: Room[]) => {
    roomsListEl.innerHTML = ''

    if (rooms.length === 0) {
      roomsListEmptyEl.style.display = 'flex'
      return
    }

    roomsListEmptyEl.style.display = 'none'
    const fragment = document.createDocumentFragment()
    for (const room of rooms) {
      fragment.appendChild(createRoomCard(room))
    }
    roomsListEl.appendChild(fragment)
  }

  const fetchRooms = async (query: string = '') => {
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    showSkeletons(3)

    try {
      const { rooms } = await getRoomsList(query, { signal: abortController.signal })
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

  const createModal = createRoomModal()

  const createBtn = createButton({
    text: 'Создать комнату',
    size: 'm',
    width: 'fit-content',
    onCLick: () => createModal.open()
  })

  roomsListFiltersEl.appendChild(searchField.element)
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
  }

  return { element: pageRoot, cleanup }
}
