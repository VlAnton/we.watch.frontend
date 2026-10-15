import './Button.scss'

import buttonTemplate from './Button.html?raw'

interface ButtonProps<TData = void> {
  text: string
  size?: 's' | 'm' | 'l'
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
        break
      case 'l':
        buttonRoot.style.height = '65px'
        break
    }
  }

  if (props.width) {
    buttonRoot.style.width = props.width
  }

  buttonRoot.textContent = props.text

  if (props.onCLick) buttonRoot.addEventListener('click', props.onCLick)

  return buttonRoot
}
