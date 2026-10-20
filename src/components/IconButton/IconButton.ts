import './IconButton.scss'

import { parseSvg } from '@/utils/svg'

import buttonTemplate from './IconButton.html?raw'

interface ButtonProps<TData = void> {
  icon: string | SVGElement | HTMLElement
  size?: 's' | 'm' | 'l'
  type?: 'primary' | 'secondary' | 'secondary-altered'
  onClick?: (event?: MouseEvent) => void | Promise<TData>
}

export function createIconButton(props: ButtonProps) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(buttonTemplate, 'text/html')
  const buttonRoot = doc.body.firstElementChild as HTMLElement

  if (props.icon) {
    const iconContainer = buttonRoot.querySelector<HTMLElement>(
      '.icon-button__container'
    )!

    if (typeof props.icon === 'string') {
      const svgNode = parseSvg(props.icon)
      iconContainer.appendChild(svgNode)
    } else {
      iconContainer.appendChild(props.icon)
    }
  }

  switch (props.size) {
    case 's':
      buttonRoot.style.height = '30px'
      buttonRoot.style.width = '30px'
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
      break
    case 'secondary':
      buttonRoot.style.backgroundColor = '#ff45e6'
      break
    case 'secondary-altered':
      buttonRoot.style.backgroundColor = '#f3b9eb'
  }

  if (props.onClick) buttonRoot.addEventListener('click', props.onClick)

  return buttonRoot
}
