import { getMe } from '@/api/auth'

import type { CleanupFn, Route, RouteParams } from './types'

export class Router {
  private routes: Route[] = []
  private rootElement: HTMLElement
  private currentCleanup: CleanupFn | null = null

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement

    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname)
    })

    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a')
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.hasAttribute('target') &&
        !target.hasAttribute('download')
      ) {
        e.preventDefault()
        this.navigate(target.pathname + target.search)
      }
    })
  }

  public addRoute(route: Route): this {
    this.routes.push(route)
    return this
  }

  public navigate(url: string): void {
    if (window.location.pathname + window.location.search === url) return

    window.history.pushState({}, '', url)
    this.handleRoute(window.location.pathname)
  }

  public start(): void {
    this.handleRoute(window.location.pathname)
  }

  private matchRoute(pattern: string, path: string): RouteParams | null {
    const patternSegments = pattern.split('/').filter(Boolean)
    const pathSegments = path.split('/').filter(Boolean)

    if (patternSegments.length !== pathSegments.length) {
      return null
    }

    const params: RouteParams = {}

    for (let i = 0; i < patternSegments.length; i++) {
      const pSeg = patternSegments[i]
      const actualSeg = pathSegments[i]

      if (pSeg.startsWith(':')) {
        const paramName = pSeg.slice(1)
        params[paramName] = decodeURIComponent(actualSeg)
      } else if (pSeg !== actualSeg) {
        return null
      }
    }

    return params
  }

  private async handleRoute(pathname: string): Promise<void> {
    let matchedRoute: Route | null = null
    let params: RouteParams = {}

    for (const route of this.routes) {
      const matched = this.matchRoute(route.path, pathname)
      if (matched !== null) {
        matchedRoute = route
        params = matched
        break
      }
    }

    if (!matchedRoute) {
      const notFoundRoute = this.routes.find((r) => r.path === '*')
      if (notFoundRoute) {
        matchedRoute = notFoundRoute
      } else {
        this.rootElement.innerHTML = '<h2>404 — Страница не найдена</h2>'
        return
      }
    }

    if (matchedRoute.isProtected) {
      try {
        await getMe()
      } catch {
        this.navigate('/auth')
        return
      }
    }

    if (this.currentCleanup) {
      this.currentCleanup()
      this.currentCleanup = null
    }

    if (matchedRoute.title) {
      document.title = `${matchedRoute.title} | We.Watch`
    }

    this.rootElement.innerHTML = ''

    const searchParams = new URLSearchParams(window.location.search)
    const result = matchedRoute.render({ params, query: searchParams })

    if (result instanceof HTMLElement) {
      this.rootElement.appendChild(result)
    } else {
      this.rootElement.appendChild(result.element)
      if (result.cleanup) {
        this.currentCleanup = result.cleanup
      }
    }
  }
}
