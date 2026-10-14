import './Error.scss'

import { HttpError } from '@/api/error'
import error404Image from '@/assets/icons/404.png'

import errorPageTemplate from './Error.html?raw'

export function renderErrorPage(app: HTMLDivElement, error: HttpError): void {
  app.innerHTML = ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(errorPageTemplate, 'text/html')
  const errorPage = doc.body.firstElementChild as HTMLElement

  if (!errorPage) {
    throw new Error('Не удалось спарсить шаблон страницы ошибки')
  }

  const errorText = errorPage.querySelector('.error-page__text') as HTMLElement
  const errorMessage = errorPage.querySelector('.error-page__message') as HTMLElement
  const errorImg = errorPage.querySelector('.error-page__icon') as HTMLImageElement

  if (error.status === 404) {
    errorImg.src = error404Image
  }

  errorText.textContent = `Ошибка ${error.status}`
  errorMessage.textContent = error.message

  app.appendChild(errorPage)
}
