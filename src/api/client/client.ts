import { HttpError } from '../error'
import { ApiErrorResponse } from './types'

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response

  try {
    response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers
      },
      credentials: 'include'
    })
  } catch (error) {
    throw new HttpError(500, `Ошибка сети: ${error}`)
  }

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({}))
    let errorMessage = `Ошибка: ${response.status}`

    if (typeof errorData.error === 'string') {
      errorMessage = errorData.error
    } else if (Array.isArray(errorData.error) && errorData.error.length > 0) {
      errorMessage = errorData.error.map((issue) => issue.message).join(', ')
    } else if (errorData.message) {
      errorMessage = errorData.message
    }

    throw new HttpError(response.status, errorMessage)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}
