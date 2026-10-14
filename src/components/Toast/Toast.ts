import './Toast.scss'

import errorSvg from '@/assets/icons/error.svg?raw'
import successSvg from '@/assets/icons/success.svg?raw'

import templateHtml from './Toast.html?raw'
import { ToastOptions, ToastType } from './types'

// Векторные иконки для статусов
const ICONS: Record<ToastType, string> = {
  success: successSvg,
  error: errorSvg
}

const DEFAULT_TITLES: Record<ToastType, string> = {
  success: 'Успешно',
  error: 'Ошибка'
}

let toastContainer: HTMLElement | null = null

// Инициализируем общий контейнер для всех тостов (ленивая инициализация)
function getOrCreateContainer(): HTMLElement {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

/**
 * Создает и показывает отдельное уведомление
 */
function showToast(type: ToastType, options: ToastOptions): HTMLElement {
  const container = getOrCreateContainer()

  const parser = new DOMParser()
  const doc = parser.parseFromString(templateHtml, 'text/html')
  const toastEl = doc.body.firstElementChild as HTMLElement

  if (!toastEl) {
    throw new Error('Не удалось загрузить шаблон Toast')
  }

  const iconEl = toastEl.querySelector<HTMLElement>('.toast__icon')!
  const titleEl = toastEl.querySelector<HTMLElement>('.toast__title')!
  const msgEl = toastEl.querySelector<HTMLElement>('.toast__message')!
  const closeBtn = toastEl.querySelector<HTMLButtonElement>('.toast__close-btn')!

  toastEl.classList.add(`toast--${type}`)
  iconEl.innerHTML = ICONS[type]
  titleEl.textContent = options.title ?? DEFAULT_TITLES[type]
  msgEl.textContent = options.message

  let timerId: number | null = null

  const removeToast = () => {
    if (timerId) window.clearTimeout(timerId)

    toastEl.classList.remove('toast--visible')
    toastEl.classList.add('toast--hiding')

    toastEl.addEventListener(
      'transitionend',
      () => {
        toastEl.remove()
      },
      { once: true }
    )
  }

  closeBtn.addEventListener('click', removeToast)

  const duration = options.duration ?? 4000
  if (duration > 0) {
    timerId = window.setTimeout(removeToast, duration)
  }

  container.appendChild(toastEl)

  requestAnimationFrame(() => {
    toastEl.classList.add('toast--visible')
  })

  return toastEl
}

export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'message'>) =>
    showToast('success', { message, ...options }),

  error: (message: string, options?: Omit<ToastOptions, 'message'>) =>
    showToast('error', { message, ...options })
}
