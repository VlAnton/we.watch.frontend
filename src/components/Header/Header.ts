import './Header.scss'

import logoutSvg from '@/assets/icons/logout.svg?raw'

import { createIconButton } from '../IconButton/IconButton'
import headerTemplate from './Header.html?raw'

export interface HeaderProps {
  onLogout?: () => void
  onNavigateHome?: () => void
}

export function createHeader(props: HeaderProps = {}): HTMLElement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(headerTemplate, 'text/html')
  const header = doc.body.firstElementChild as HTMLElement

  const headerActionsEl = header.querySelector<HTMLElement>('.app-header__actions')!
  const logoLink = header.querySelector<HTMLAnchorElement>('.app-header__logo')!
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
