export interface ApiErrorResponse {
  error?: string | Array<{ message: string; path?: string[] }>
  message?: string
}
