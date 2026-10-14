import './Input.scss'

import templateHtml from './Input.html?raw'

export interface InputFieldProps {
  id?: string
  name?: string
  label?: string
  type?: 'text' | 'password' | 'email' | 'number'
  placeholder?: string
  required?: boolean
  onInput?: (value: string) => void
}

export interface InputFieldInstance {
  element: HTMLElement
  input: HTMLInputElement
  hasErrors?: boolean
  getValue: () => string
  setValue: (value: string) => void
  setError: (msg: string) => void
  clearError: () => void
  setVisible: (visible: boolean) => void
}

export function createInputField(props: InputFieldProps): InputFieldInstance {
  const parser = new DOMParser()
  const doc = parser.parseFromString(templateHtml, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement

  if (!root) {
    throw new Error('Не удалось спарсить шаблон InputField')
  }

  let labelEl
  const inputEl = root.querySelector<HTMLInputElement>('.input-field__input')!
  const errorEl = root.querySelector<HTMLElement>('.input-field__error')!

  if (props.label) {
    labelEl = document.createElement('label')
    labelEl.classList.add('input-field__label')
    labelEl.textContent = props.label
    root.prepend(labelEl)
  }

  inputEl.type = props.type || 'text'
  if (props.id) {
    if (labelEl) {
      labelEl.htmlFor = props.id
    }
    inputEl.id = props.id
  }
  if (props.name) inputEl.name = props.name
  if (props.placeholder) inputEl.placeholder = props.placeholder
  if (props.required) inputEl.required = props.required

  inputEl.addEventListener('input', () => {
    root.classList.remove('has-error')
    errorEl.style.display = 'none'
    errorEl.textContent = ''
    props.onInput?.(inputEl.value)
  })

  return {
    element: root,
    input: inputEl,
    getValue: () => inputEl.value.trim(),
    setValue(val: string) {
      inputEl.value = val
    },
    setError(msg: string) {
      root.classList.add('has-error')
      this.hasErrors = true
      errorEl.textContent = msg
      errorEl.style.display = 'block'
    },
    clearError() {
      root.classList.remove('has-error')
      errorEl.textContent = ''
      errorEl.style.display = 'none'
      this.hasErrors = false
    },
    setVisible: (visible: boolean) => {
      root.style.display = visible ? 'flex' : 'none'
      inputEl.required = visible && Boolean(props.required)
    }
  }
}
