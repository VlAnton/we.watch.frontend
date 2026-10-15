import './BaseModal.scss'

import closeSvg from '@/assets/icons/close.svg?raw'
import { createIconButton } from '@/components/IconButton/IconButton'

import baseModalTemplate from './BaseModal.html?raw'

export interface BaseModalProps {
  title: string
  content?: HTMLElement | string
  onClose?: () => void
  onOpen?: () => void
}

export interface BaseModalInstance {
  element: HTMLElement
  open: () => void
  close: () => void
  setTitle: (title: string) => void
  setContent: (content: HTMLElement | string) => void
  destroy: () => void
}

export function createBaseModal(props: BaseModalProps): BaseModalInstance {
  const parser = new DOMParser()
  const doc = parser.parseFromString(baseModalTemplate, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement

  if (!root) {
    throw new Error('Не удалось загрузить шаблон BaseModal')
  }

  const titleEl = root.querySelector<HTMLElement>('.modal__title')!
  const bodyEl = root.querySelector<HTMLElement>('.modal__content')!
  const backdrop = root.querySelector<HTMLElement>('.modal__backdrop')!
  const headerEl = root.querySelector<HTMLElement>('.modal__header')!

  const closeBtnEl = createIconButton({
    icon: closeSvg,
    size: 'm',
    onClick() {
      close()
    }
  })

  headerEl.appendChild(closeBtnEl)

  titleEl.textContent = props.title

  const setContent = (content: HTMLElement | string) => {
    if (typeof content === 'string') {
      bodyEl.innerHTML = content
    } else {
      bodyEl.innerHTML = ''
      bodyEl.appendChild(content)
    }
  }

  if (props.content) {
    setContent(props.content)
  }

  const open = () => {
    if (!document.body.contains(root)) {
      document.body.appendChild(root)
    }

    root.classList.add('modal--open')
    root.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    props.onOpen?.()
  }

  const close = () => {
    root.classList.remove('modal--open')
    root.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    props.onClose?.()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && root.classList.contains('modal--open')) {
      close()
    }
  }

  backdrop.addEventListener('click', close)
  document.addEventListener('keydown', handleKeyDown)

  const destroy = () => {
    document.removeEventListener('keydown', handleKeyDown)
    root.remove()
    document.body.style.overflow = ''
  }

  return {
    element: root,
    open,
    close,
    setTitle: (text: string) => {
      titleEl.textContent = text
    },
    setContent,
    destroy
  }
}
