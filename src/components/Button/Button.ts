import './Button.scss'

import buttonTemplate from './Button.html?raw'

interface ButtonProps<TData = void> {
  text: string
  size?: 's' | 'm' | 'l'
  type?: 'primary' | 'secondary' | 'secondary-altered' | 'transparent'
  width?: string
  onCLick?: (event?: MouseEvent) => void | Promise<TData>
}

export function createButton(props: ButtonProps) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(buttonTemplate, 'text/html')
  const buttonRoot = doc.body.firstElementChild as HTMLElement

  if (props.size) {
    switch (props.size) {
      case 's':
        buttonRoot.style.height = '30px'
        break
      case 'm':
        buttonRoot.style.height = '45px'
        buttonRoot.style.fontSize = '16px'
        buttonRoot.style.fontWeight = '600'
        break
      case 'l':
        buttonRoot.style.height = '65px'
        buttonRoot.style.fontSize = '18px'
        buttonRoot.style.fontWeight = '700'
        break
    }
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

  if (props.width) {
    buttonRoot.style.width = props.width
  }

  buttonRoot.textContent = props.text

  if (props.onCLick) buttonRoot.addEventListener('click', props.onCLick)

  return buttonRoot
}
