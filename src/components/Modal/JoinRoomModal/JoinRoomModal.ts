import './JoinRoomModal.scss'

import { joinRoom } from '@/api/rooms'
import { createButton } from '@/components/Button/Button'
import { createInputField } from '@/components/Input/Input'
import { router } from '@/main'

import { createBaseModal } from '../BaseModal/BaseModal'

export function createJoinRoomModal() {
  const modalRoot = document.createElement('form')
  modalRoot.classList.add('join-room-modal')

  const baseModalEl = createBaseModal({
    content: modalRoot,
    closable: true,
    title: 'присоединиться к комнате'
  })

  const codeInput = createInputField({
    required: true,
    label: 'код комнаты',
    id: 'room-code',
    name: 'room-code',
    placeholder: 'Введите код комнаты'
  })

  const submitBtn = createButton({
    text: 'присоединиться',
    size: 'm',
    type: 'secondary',
    width: '100%'
  })

  modalRoot.addEventListener('submit', (event: Event) => {
    event.preventDefault()
    event.stopImmediatePropagation()

    const value = codeInput.getValue()
    joinRoom({ code: value })
      .then(({ room }) => {
        router.navigate(`/rooms/${room.id}`)
        baseModalEl.close()
      })
      .catch(() => {
        codeInput.setError('Не удалось найти комнату по введённому коду')
      })
  })

  modalRoot.appendChild(codeInput.element)
  modalRoot.appendChild(submitBtn)
  return baseModalEl
}
