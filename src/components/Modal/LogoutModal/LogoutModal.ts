import './LogoutModal.scss'

import { logoutUser } from '@/api/auth'
import { createButton } from '@/components/Button/Button'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'

import { createBaseModal } from '../BaseModal/BaseModal'
import templateHtml from './LogoutModal.html?raw'

const logoutModalTemplateEl = document.createElement('template')
logoutModalTemplateEl.innerHTML = templateHtml

export function createLogoutModal() {
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
    title: 'уверены что хотите выйти?'
  })

  const declineBtn = createButton({
    text: 'Отменить',
    size: 'l',
    width: '100%',
    onCLick: () => {
      baseModalEl.close()
    }
  })
  const submitBtn = createButton({
    text: 'Выйти',
    size: 'l',
    type: 'secondary',
    width: '100%',
    onCLick: () => {
      logoutUser()
        .then(() => {
          router.navigate('/auth')
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : 'Ошибка сети', {
            title: 'Ошибка выхода из аккаунта'
          })
        })
    }
  })

  submitActionsEl.appendChild(declineBtn)
  submitActionsEl.appendChild(submitBtn)
  return baseModalEl
}
