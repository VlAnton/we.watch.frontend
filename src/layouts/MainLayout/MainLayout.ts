import './MainLayout.scss'

import { createHeader } from '@/components/Header/Header'

export interface MainLayoutInstance {
  element: HTMLElement
  setContent: (pageElement: HTMLElement) => void
}

export interface MainLayoutProps {
  onLogout: () => void
  onNavigateHome: () => void
  getCurrentRoute?: () => string | null
}

export function createMainLayout(props: MainLayoutProps): MainLayoutInstance {
  const root = document.createElement('div')
  root.classList.add('main-layout')

  const contentSlot = document.createElement('div')
  contentSlot.classList.add('main-layout__content')

  const header = createHeader({
    onLogout: props.onLogout,
    onNavigateHome: props.onNavigateHome,
    getCurrentRoute: props.getCurrentRoute
  })
  root.appendChild(header)
  root.appendChild(contentSlot)

  return {
    element: root,
    setContent: (pageElement: HTMLElement) => {
      contentSlot.innerHTML = ''
      contentSlot.appendChild(pageElement)
    }
  }
}
