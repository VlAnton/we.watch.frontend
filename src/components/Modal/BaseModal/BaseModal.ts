import './BaseModal.scss'

import closeSvg from '@/assets/icons/close.svg?raw'
import { createIconButton } from '@/components/IconButton/IconButton'

import baseModalTemplate from './BaseModal.html?raw'

export interface BaseModalProps {
  title: string
  content?: HTMLElement | string
  closable?: boolean
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

const modalTemplateEl = document.createElement('template')
modalTemplateEl.innerHTML = baseModalTemplate

export function createBaseModal({
  title = '',
  content = '',
  closable = true,
  onClose,
  onOpen
}: BaseModalProps): BaseModalInstance {
  const root = modalTemplateEl.content.firstElementChild!.cloneNode(true) as HTMLElement

  if (!root) {
    throw new Error('Не удалось загрузить шаблон BaseModal')
  }

  const titleEl = root.querySelector<HTMLElement>('.modal__title')!
  const bodyEl = root.querySelector<HTMLElement>('.modal__content')!
  const backdrop = root.querySelector<HTMLElement>('.modal__backdrop')!
  const headerEl = root.querySelector<HTMLElement>('.modal__header')!

  if (closable) {
    const closeBtnEl = createIconButton({
      icon: closeSvg,
      size: 'm',
      type: 'primary',
      onClick() {
        close()
      }
    })

    headerEl.appendChild(closeBtnEl.element)
  }

  titleEl.textContent = title

  const setContent = (content: HTMLElement | string) => {
    if (typeof content === 'string') {
      bodyEl.innerHTML = content
    } else {
      bodyEl.innerHTML = ''
      bodyEl.appendChild(content)
    }
  }

  if (content) {
    setContent(content)
  }

  const open = () => {
    if (!document.body.contains(root)) {
      document.body.appendChild(root)
    }

    root.classList.add('modal--open')
    root.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    onOpen?.()
  }

  const close = () => {
    root.classList.remove('modal--open')
    root.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    onClose?.()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && root.classList.contains('modal--open')) {
      close()
    }
  }

  if (closable) {
    backdrop.addEventListener('click', close)
    document.addEventListener('keydown', handleKeyDown)
  }

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
