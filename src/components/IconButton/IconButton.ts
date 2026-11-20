import './IconButton.scss'

import { parseSvg } from '@/utils/svg'

import buttonTemplate from './IconButton.html?raw'

interface ButtonProps<TData = void> {
  icon: string | SVGElement | HTMLElement
  size?: 's' | 'm' | 'l'
  type?: 'primary' | 'secondary' | 'secondary-altered' | 'transparent'
  onClick?: (event?: MouseEvent) => void | Promise<TData>
}

export interface IconButton {
  element: HTMLElement
  setIcon: (icon: string | SVGElement | HTMLElement) => void
}

const iconButtonTemplateEl = document.createElement('template')
iconButtonTemplateEl.innerHTML = buttonTemplate

export function createIconButton(props: ButtonProps): IconButton {
  const buttonRoot = iconButtonTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const iconContainer = buttonRoot.querySelector<HTMLElement>('.icon-button__container')!

  if (typeof props.icon === 'string') {
    const svgNode = parseSvg(props.icon)
    iconContainer.appendChild(svgNode)
  } else {
    iconContainer.appendChild(props.icon)
  }

  switch (props.size) {
    case 's':
      buttonRoot.style.height = '30px'
      buttonRoot.style.width = '30px'
      buttonRoot.style.borderRadius = '8px'
      break
    case 'm':
      buttonRoot.style.height = '40px'
      buttonRoot.style.width = '40px'
      break
    case 'l':
      buttonRoot.style.height = '60px'
      buttonRoot.style.width = '60px'
      break
  }

  switch (props.type) {
    case 'primary':
      buttonRoot.style.backgroundColor = '#407ddf'
      buttonRoot.style.color = '#fff'
      break
    case 'secondary':
      buttonRoot.style.backgroundColor = '#ff45e6'
      buttonRoot.style.color = '#fff'
      break
    case 'secondary-altered':
      buttonRoot.style.backgroundColor = '#f3b9eb'
      buttonRoot.style.color = '#fff'
      break
    case 'transparent':
      buttonRoot.style.backgroundColor = 'transparent'
      buttonRoot.style.color = '#3c7eea'
  }

  if (props.onClick) buttonRoot.addEventListener('click', props.onClick)

  return {
    element: buttonRoot,
    setIcon(icon) {
      iconContainer.innerHTML = ''
      if (typeof icon === 'string') {
        const svgNode = parseSvg(icon)
        iconContainer.appendChild(svgNode)
      } else {
        iconContainer.appendChild(icon)
      }
    }
  }
}
