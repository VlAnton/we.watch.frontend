import './IconButton.scss'

import { parseSvg } from '@/utils/svg'

import buttonTemplate from './IconButton.html?raw'

type IconButtonType =
  'primary' | 'secondary' | 'secondary-altered' | 'transparent' | 'outlined'

interface IconButtonProps<TData = void> {
  icon: string | SVGElement | HTMLElement
  size?: 's' | 'm' | 'l'
  type?: IconButtonType
  onClick?: (event?: MouseEvent) => void | Promise<TData>
}

export interface IconButton {
  element: HTMLElement
  setIcon: (icon: string | SVGElement | HTMLElement) => void
  setType: (type: IconButtonType) => void
}

const iconButtonTemplateEl = document.createElement('template')
iconButtonTemplateEl.innerHTML = buttonTemplate

export function createIconButton(props: IconButtonProps): IconButton {
  function setIcon(icon: string | SVGElement | HTMLElement) {
    if (typeof icon === 'string') {
      const svgNode = parseSvg(icon)
      iconContainer.appendChild(svgNode)
    } else {
      iconContainer.appendChild(icon)
    }
  }

  function setType(type: IconButtonType) {
    switch (type) {
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
      case 'outlined':
        buttonRoot.style.backgroundColor = 'transparent'
        buttonRoot.style.color = '#3c7eea'
        buttonRoot.style.border = '1px solid #3c7eea'
        break
      case 'transparent':
        buttonRoot.style.backgroundColor = 'transparent'
        buttonRoot.style.color = '#3c7eea'
    }
  }
  const buttonRoot = iconButtonTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const iconContainer = buttonRoot.querySelector<HTMLElement>('.icon-button__container')!

  setIcon(props.icon)
  setType(props.type || 'primary')

  switch (props.size) {
    case 's':
      buttonRoot.style.height = '30px'
      buttonRoot.style.width = '30px'
      buttonRoot.style.borderRadius = '8px'
      break
    case 'm':
      buttonRoot.style.height = '45px'
      buttonRoot.style.width = '45px'
      break
    case 'l':
      buttonRoot.style.height = '60px'
      buttonRoot.style.width = '60px'
      break
  }

  if (props.onClick) buttonRoot.addEventListener('click', props.onClick)

  return {
    element: buttonRoot,
    setIcon(icon) {
      iconContainer.innerHTML = ''
      setIcon(icon)
    },
    setType(type) {
      setType(type)
    }
  }
}
