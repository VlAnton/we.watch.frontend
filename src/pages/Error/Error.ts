import './Error.scss'

import { HttpError } from '@/api/error'
import error404Image from '@/assets/icons/404.png'

import errorPageTemplate from './Error.html?raw'

const pageTemplateEl = document.createElement('template')
pageTemplateEl.innerHTML = errorPageTemplate

export function renderErrorPage(app: HTMLDivElement, error: HttpError): void {
  app.innerHTML = ''
  const pageRoot = pageTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  if (!pageRoot) {
    throw new Error('Не удалось спарсить шаблон страницы ошибки')
  }

  const errorText = pageRoot.querySelector('.error-page__text') as HTMLElement
  const errorMessage = pageRoot.querySelector('.error-page__message') as HTMLElement
  const errorImg = pageRoot.querySelector('.error-page__icon') as HTMLImageElement

  if (error.status === 404) {
    errorImg.src = error404Image
  }

  errorText.textContent = `Ошибка ${error.status}`
  errorMessage.textContent = error.message

  app.appendChild(pageRoot)
}
