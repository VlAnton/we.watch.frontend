import buttonTemplate from './Button.html?raw'

interface ButtonProps<TData = void> {
  text: string
  size?: 's' | 'm' | 'l'
  type?: 'primary' | 'secondary' | 'secondary-altered' | 'transparent' | 'outlined'
  width?: string
  onCLick?: (event?: MouseEvent) => void | Promise<TData>
}

const buttonTemplateEl = document.createElement('template')
buttonTemplateEl.innerHTML = buttonTemplate

export function createButton(props: ButtonProps) {
  const buttonRoot = buttonTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

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

  buttonRoot.textContent = props.text

  if (props.onCLick) buttonRoot.addEventListener('click', props.onCLick)

  return buttonRoot
}
