import './CreateRoomModal.scss'

import { createRoom } from '@/api/rooms'
import { createButton } from '@/components/Button/Button'
import { createInputField } from '@/components/Input/Input'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'

import { createBaseModal } from '../BaseModal/BaseModal'
import createRoomModalTemplate from './CreateRoomModal.html?raw'

export function createRoomModal() {
  const parser = new DOMParser()
  const doc = parser.parseFromString(createRoomModalTemplate, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement

  const modalInputs = root.querySelector('.modal-form__inputs')! as HTMLElement

  const nameInputEl = createInputField({
    required: true,
    label: 'Название комнаты',
    id: 'room-name',
    name: 'room-name',
    placeholder: 'Введите название комнаты'
  })

  const submitBtnEl = createButton({
    size: 'm',
    text: 'Создать'
  })

  root.appendChild(submitBtnEl)
  modalInputs.appendChild(nameInputEl.element)

  const modalEl = createBaseModal({
    title: 'создать комнату',
    content: root
  })

  root.addEventListener('submit', async (event: Event) => {
    event.preventDefault()

    const name = nameInputEl.getValue()
    try {
      const { room } = await createRoom({ name })
      const url = `/rooms/${room.id}`
      modalEl.close()
      toast.success('Успех', {
        title: `Комната ${room.name} успешно создана`
      })
      router.navigate(url)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка'
      toast.error(message, {
        title: 'Произошла ошибка при создании комнаты'
      })
    }
  })

  return modalEl
}
