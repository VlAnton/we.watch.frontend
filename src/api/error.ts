export class HttpError extends Error {
  public status: number
  public payload?: unknown

  constructor(status: number, message: string, payload?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.payload = payload
  }
}
