export type RouteParams = Record<string, string>

export type LayoutType = 'main' | 'none'

export interface RouteContext {
  params: RouteParams
  query: URLSearchParams
}

export type CleanupFn = () => void

export interface Route {
  path: string
  title?: string
  layout?: LayoutType // По умолчанию 'main'
  isProtected?: boolean
  render: (
    ctx: RouteContext
  ) => HTMLElement | { element: HTMLElement; cleanup?: CleanupFn }
}
