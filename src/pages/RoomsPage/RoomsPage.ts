import './RoomsPage.scss'

import { getRoomsList } from '@/api/rooms'
import { createButton } from '@/components/Button/Button'
import { createInputField } from '@/components/Input/Input'
import { createRoomModal } from '@/components/Modal/CreateRoomModal/CreateRoomModal'
import { createSkeleton } from '@/components/Skeleton/Skeleton'
import { toast } from '@/components/Toast/Toast'
import { debounce } from '@/utils/debounce'

import roomsPageTemplate from './RoomsPage.html?raw'

let lastRequestId = 0

function setRooms(
  roomsListEl: HTMLElement,
  roomsListEmptyEl: HTMLElement,
  query: string = ''
) {
  const currentRequestId = ++lastRequestId

  getRoomsList(query)
    .then(({ rooms }) => {
      if (currentRequestId !== lastRequestId) {
        return
      }

      roomsListEl.innerHTML = ''

      if (rooms.length === 0) {
        roomsListEmptyEl.style.display = 'flex'
        return
      }

      for (const room of rooms) {
        const roomCard = document.createElement('a')
        roomCard.classList.add('rooms-page__room-card')
        roomCard.href = `/rooms/${room.id}`

        const roomCardTitle = document.createElement('h3')
        roomCardTitle.textContent = room.name
        roomCardTitle.classList.add('rooms-page__room-card-title')

        roomCard.appendChild(roomCardTitle)
        roomsListEl.appendChild(roomCard)
      }
    })
    .catch((err) => {
      if (currentRequestId !== lastRequestId) {
        return
      }

      roomsListEl.innerHTML = ''
      roomsListEmptyEl.style.display = 'flex'

      toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
        title: 'Не удалось загрузить список комнат'
      })
    })
}

export function renderRoomsPage() {
  const parser = new DOMParser()
  const doc = parser.parseFromString(roomsPageTemplate, 'text/html')
  const pageRoot = doc.body.firstElementChild as HTMLElement

  if (!pageRoot) {
    throw new Error('Не удалось загрузить шаблон RoomsPage')
  }

  const roomsListEl = pageRoot.querySelector('.rooms-page__list')! as HTMLElement
  const roomsListFiltersEl = pageRoot.querySelector(
    '.rooms-page__filters'
  )! as HTMLElement
  const roomsListEmptyEl = pageRoot.querySelector('.rooms-page__empty')! as HTMLElement

  const skeleton = createSkeleton({ size: 'l' })

  const handleSearch = debounce((query: string) => {
    setRooms(roomsListEl, roomsListEmptyEl, query)
  }, 400)

  const searchField = createInputField({
    label: 'Поиск',
    name: 'search',
    placeholder: 'Поиск по названию',
    required: false,
    type: 'text',
    onInput(value) {
      roomsListEmptyEl.style.display = 'none'
      roomsListEl.innerHTML = `
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
        ${skeleton.outerHTML}
      `
      handleSearch(value)
    }
  })

  const createModal = createRoomModal()

  const button = createButton({
    text: 'Создать комнату',
    size: 'm',
    width: 'fit-content',
    onCLick: () => {
      createModal.open()
    }
  })
  button.style.flexShrink = '0'

  roomsListFiltersEl.appendChild(searchField.element)
  roomsListFiltersEl.appendChild(button)

  setRooms(roomsListEl, roomsListEmptyEl)

  return pageRoot
}
