import './ConfirmModal.scss'

import { createButton } from '@/components/Button/Button'

import { createBaseModal } from '../BaseModal/BaseModal'
import templateHtml from './ConfirmModal.html?raw'

const logoutModalTemplateEl = document.createElement('template')
logoutModalTemplateEl.innerHTML = templateHtml

interface ConfirmModalProps {
  title: string
  confirmText: string
  onConfirm: () => void
}

export function createConfirmModal(props: ConfirmModalProps) {
  const modalRoot = logoutModalTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  if (!modalRoot) {
    throw new Error('Не удалось загрузить шаблон AuthPage')
  }

  const submitActionsEl = modalRoot.querySelector<HTMLElement>(
    '.confirm-modal__submit-actions'
  )!

  const baseModalEl = createBaseModal({
    content: modalRoot,
    closable: true,
    title: props.title
  })

  const declineBtn = createButton({
    text: 'Отменить',
    size: 'l',
    width: '100%',
    onClick: () => {
      baseModalEl.close()
    }
  })
  const submitBtn = createButton({
    text: props.confirmText,
    size: 'l',
    type: 'secondary',
    width: '100%',
    onClick: () => {
      props.onConfirm()
    }
  })

  submitActionsEl.appendChild(declineBtn)
  submitActionsEl.appendChild(submitBtn)
  return baseModalEl
}
