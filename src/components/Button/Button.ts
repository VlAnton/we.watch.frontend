import { parseSvg } from '@/utils/svg'

import buttonTemplate from './Button.html?raw'

interface ButtonProps<TData = void> {
  text: string
  size?: 's' | 'm' | 'l'
  type?: 'primary' | 'secondary' | 'secondary-altered' | 'transparent' | 'outlined'
  icon?: string | SVGElement | HTMLElement
  width?: string
  onClick?: (event?: MouseEvent) => void | Promise<TData>
}

const buttonTemplateEl = document.createElement('template')
buttonTemplateEl.innerHTML = buttonTemplate

export function createButton(props: ButtonProps) {
  const buttonRoot = buttonTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement
  const buttonText = buttonRoot.querySelector<HTMLElement>('.button__text')!
  const buttonIcon = buttonRoot.querySelector<HTMLElement>('.button__icon-container')!

  const buttonSize = props.size ?? 'm'

  buttonRoot.classList.add(`button--${buttonSize}`)

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
    case 'outlined':
      buttonRoot.style.backgroundColor = 'transparent'
      buttonRoot.style.color = '#3c7eea'
      buttonRoot.style.border = '1px solid #3c7eea'
      break
    case 'transparent':
      buttonRoot.style.backgroundColor = 'transparent'
      buttonRoot.style.color = '#3c7eea'
  }

  if (props.width) {
    buttonRoot.style.width = props.width
  }

  if (props.icon) {
    if (typeof props.icon === 'string') {
      const svgNode = parseSvg(props.icon)
      buttonIcon.appendChild(svgNode)
    } else {
      buttonIcon.appendChild(props.icon)
    }
    buttonIcon.style.display = 'inline-flex'
  }

  buttonText.textContent = props.text

  if (props.onClick) buttonRoot.addEventListener('click', props.onClick)

  return buttonRoot
}
