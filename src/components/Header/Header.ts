import './Header.scss'

import logoutSvg from '@/assets/icons/logout.svg?raw'
import { effect } from '@/state/reactivity'

import { createIconButton } from '../IconButton/IconButton'
import { createTab } from '../Tab/Tab'
import headerTemplate from './Header.html?raw'

export interface HeaderProps {
  onLogout?: () => void
  onNavigateHome?: () => void
  getCurrentRoute?: () => string | null
}

const headerTemplateEl = document.createElement('template')
headerTemplateEl.innerHTML = headerTemplate

export function createHeader(props: HeaderProps = {}): HTMLElement {
  const header = headerTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const headerActionsEl = header.querySelector<HTMLElement>('.app-header__actions')!
  const headerTabsEl = header.querySelector<HTMLElement>('.app-header__tabs')!
  const logoLink = header.querySelector<HTMLAnchorElement>('.app-header__logo')!

  const roomsTab = createTab({
    text: 'комнаты',
    href: '/rooms',
    size: 's'
  })
  const moviesTab = createTab({
    text: 'фильмы',
    href: '/movies',
    size: 's'
  })

  headerTabsEl.appendChild(roomsTab.element)
  headerTabsEl.appendChild(moviesTab.element)

  const tabs = [
    { instance: roomsTab, href: '/rooms' },
    { instance: moviesTab, href: '/movies' }
  ]

  effect(() => {
    const path = props.getCurrentRoute?.()
    if (!path) return

    for (const { instance, href } of tabs) {
      const isActive = path.startsWith(href)
      instance.toggleActive(isActive)
      console.log(instance.isActive)
    }
  })

  const logoutBtn = createIconButton({
    icon: logoutSvg,
    size: 'm',
    type: 'transparent',
    onClick: props.onLogout
  })

  logoLink.addEventListener('click', (e) => {
    e.preventDefault()
    if (props.onNavigateHome) {
      props.onNavigateHome()
    } else {
      window.location.href = '/'
    }
  })

  headerActionsEl.appendChild(logoutBtn.element)

  return header
}
