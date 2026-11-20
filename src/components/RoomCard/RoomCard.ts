import './RoomCard.scss'

import { deleteRoom } from '@/api/rooms'
import { Room } from '@/api/rooms/types'
import crossSvg from '@/assets/icons/close.svg?raw'

import { createIconButton } from '../IconButton/IconButton'
import { toast } from '../Toast/Toast'
import roomCardTemplate from './RoomCard.html?raw'

const roomCardTemplateEl = document.createElement('template')
roomCardTemplateEl.innerHTML = roomCardTemplate

export function createRoomCard(props: Room & { onRoomDelete: () => void }) {
  const roomCardEl = roomCardTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLAnchorElement

  roomCardEl.href = `/rooms/${props.id}`

  const cardTitle = roomCardEl.querySelector<HTMLElement>('.room-card__title')!
  const cardActions = roomCardEl.querySelector<HTMLElement>('.room-card__actions')!
  const cardMemberCountContainer = roomCardEl.querySelector<HTMLElement>(
    '.room-card__members-count'
  )!
  const cardMoviesCountContainer = roomCardEl.querySelector<HTMLElement>(
    '.room-card__movies-count'
  )!

  cardTitle.textContent = props.name
  cardMemberCountContainer.textContent = `${props.membersCount} участник${props.membersCount === 1 ? '' : 'ов'}`
  cardMoviesCountContainer.textContent = `${props.moviesCount} филь${props.moviesCount === 1 ? 'м' : 'мов'}`

  const deleteButton = createIconButton({
    icon: crossSvg,
    type: 'secondary',
    size: 's',
    onClick: async (event?: MouseEvent) => {
      event?.preventDefault()
      event?.stopPropagation()

      try {
        await deleteRoom(props.id)
        await props.onRoomDelete()
        toast.success(`комната «${props.name.toLowerCase()}» успешно удалена`, {
          title: 'успех'
        })
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'ошибка при удалении комнаты', {
          title: 'ошибка'
        })
      }
    }
  })

  cardActions.appendChild(deleteButton.element)

  return roomCardEl
}
