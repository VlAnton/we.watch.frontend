import { createAuthModal } from '@/components/Modal/AuthModal/AuthModal'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'

import { renderRoomsPage } from '../RoomsPage/RoomsPage'

export function renderAuthPage() {
  const pageRoot = document.createElement('div')
  pageRoot.style.width = '100%'

  const mockedRoomsPage = renderRoomsPage({ isMocked: true })

  pageRoot.appendChild(mockedRoomsPage.element)

  const authModalEl = createAuthModal({
    onSuccess(user) {
      toast.success(`Рады видеть вас, ${user.username}!`, {
        title: 'Вход выполнен'
      })

      authModalEl.close()
      router.navigate('/rooms')
    },
    onError(message) {
      toast.error(message, {
        title: 'Ошибка входа'
      })
    }
  })

  pageRoot.appendChild(authModalEl.element)
  authModalEl.open()

  return pageRoot
}
