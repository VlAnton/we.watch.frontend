import './Header.scss'

import logoutSvg from '@/assets/icons/logout.svg?raw'

import { createIconButton } from '../IconButton/IconButton'
import { createTab } from '../Tab/Tab'
import headerTemplate from './Header.html?raw'

export interface HeaderProps {
  onLogout?: () => void
  onNavigateHome?: () => void
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
    size: 'm'
  })
  const moviesTab = createTab({
    text: 'фильмы',
    href: '/movies',
    size: 'm'
  })
  headerTabsEl.appendChild(roomsTab)
  headerTabsEl.appendChild(moviesTab)

  if (window.location.href.includes(roomsTab.href)) {
    roomsTab.classList.add('link__tab--active')
  } else {
    moviesTab.classList.add('link__tab--active')
  }

  headerTabsEl.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const clickedTab = target.closest<HTMLAnchorElement>('a')

    if (!clickedTab || !headerTabsEl.contains(clickedTab)) {
      return
    }

    const clickedHref = clickedTab.getAttribute('href')
    if (!clickedHref) {
      return
    }

    const allTabs = headerTabsEl.querySelectorAll<HTMLAnchorElement>('a')
    allTabs.forEach((tab) => {
      if (tab.getAttribute('href') === clickedHref) {
        tab.classList.add('link__tab--active')
      } else {
        tab.classList.remove('link__tab--active')
      }
    })
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
