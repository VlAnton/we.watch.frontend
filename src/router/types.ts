export type RouteParams = Record<string, string>

export interface RouteContext {
  params: RouteParams
  query: URLSearchParams
}

export type CleanupFn = () => void

export interface Route {
  path: string
  title?: string
  isProtected?: boolean
  render: (
    ctx: RouteContext
  ) => HTMLElement | { element: HTMLElement; cleanup?: CleanupFn }
}
