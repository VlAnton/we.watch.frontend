export type ToastType = 'success' | 'error'

export interface ToastOptions {
  message: string
  title?: string
  duration?: number // Длительность показа в мс (по умолчанию 4000, 0 = не скрывать)
}
