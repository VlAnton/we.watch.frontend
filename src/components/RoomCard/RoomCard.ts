import './RoomCard.scss'

import { deleteRoom, leaveRoom } from '@/api/rooms'
import { Room } from '@/api/rooms/types'
import crossSvg from '@/assets/icons/close.svg?raw'
import leaveSvg from '@/assets/icons/leave.svg?raw'

import { createIconButton } from '../IconButton/IconButton'
import { createConfirmModal } from '../Modal/ConfirmModal/ConfirmModal'
import { toast } from '../Toast/Toast'
import roomCardTemplate from './RoomCard.html?raw'

const roomCardTemplateEl = document.createElement('template')
roomCardTemplateEl.innerHTML = roomCardTemplate

interface CreateRoomProps extends Room {
  isRoomOwner: boolean
  onRoomAction?: () => void
}

export function createRoomCard(props: CreateRoomProps) {
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

  const confirmModal = createConfirmModal({
    title: props.isRoomOwner
      ? 'вы уверены что хотите удалить комнату?'
      : 'вы уверены что хотите выйти из комнаты?',
    confirmText: props.isRoomOwner ? 'удалить' : 'выйти',
    async onConfirm() {
      try {
        let message
        if (props.isRoomOwner) {
          await deleteRoom(props.id)
          message = `комната «${props.name.toLowerCase()}» успешно удалена`
        } else {
          await leaveRoom(props.id)
          message = `комната «${props.name.toLowerCase()}» успешно покинута`
        }
        await props.onRoomAction?.()
        toast.success(message ?? 'операция успешно выполнена', {
          title: 'успех'
        })
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'ошибка при удалении комнаты', {
          title: 'ошибка'
        })
      } finally {
        confirmModal.close()
      }
    }
  })

  const deleteButton = createIconButton({
    icon: props.isRoomOwner ? crossSvg : leaveSvg,
    type: 'secondary',
    size: 's',
    onClick: async (event?: MouseEvent) => {
      event?.preventDefault()
      event?.stopPropagation()

      confirmModal.open()
    }
  })

  cardActions.appendChild(deleteButton.element)

  return roomCardEl
}
