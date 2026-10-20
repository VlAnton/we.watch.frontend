import './MainLayout.scss'

import { createHeader } from '@/components/Header/Header'

export interface MainLayoutInstance {
  element: HTMLElement
  setContent: (pageElement: HTMLElement) => void
}

export interface MainLayoutProps {
  onLogout: () => void
  onNavigateHome: () => void
}

export function createMainLayout(props: MainLayoutProps): MainLayoutInstance {
  const root = document.createElement('div')
  root.classList.add('main-layout')

  const contentSlot = document.createElement('div')
  contentSlot.classList.add('main-layout__content')

  const header = createHeader({
    onLogout: props.onLogout,
    onNavigateHome: props.onNavigateHome
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
