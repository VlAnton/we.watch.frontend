import { getMe } from '@/api/auth'
import { HttpError } from '@/api/error'
import { createMainLayout, MainLayoutInstance } from '@/layouts/MainLayout/MainLayout'
import { renderErrorPage } from '@/pages/Error/Error'

import type { CleanupFn, Route, RouteParams } from './types'

export class Router {
  private routes: Route[] = []
  private rootElement: HTMLElement
  private currentCleanup: CleanupFn | null = null
  private mainLayout: MainLayoutInstance

  constructor(rootElement: HTMLElement, onLogout: () => void) {
    this.rootElement = rootElement

    this.mainLayout = createMainLayout({
      onLogout,
      onNavigateHome: () => this.navigate('/')
    })

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
    window.history.pushState({}, '', url)
    this.handleRoute(window.location.pathname)
  }

  public start(): void {
    this.handleRoute(window.location.pathname)
  }

  private matchRoute(pattern: string, path: string): RouteParams | null {
    // Специфика для главной
    if (pattern === '/' && path === '/') return {}

    const patternSegments = pattern.split('/').filter(Boolean)
    const pathSegments = path.split('/').filter(Boolean)

    if (patternSegments.length !== pathSegments.length) return null

    const params: RouteParams = {}
    for (let i = 0; i < patternSegments.length; i++) {
      if (patternSegments[i].startsWith(':')) {
        params[patternSegments[i].slice(1)] = decodeURIComponent(pathSegments[i])
      } else if (patternSegments[i] !== pathSegments[i]) {
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
      renderErrorPage(
        this.rootElement as HTMLDivElement,
        new HttpError(404, 'Страница не найдена')
      )
      return
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

    const pageElement = result instanceof HTMLElement ? result : result.element

    if (!pageElement) {
      console.warn('Страница ничего не вернула в render()!', matchedRoute.path)
      return
    }
    if (!(result instanceof HTMLElement) && result.cleanup) {
      this.currentCleanup = result.cleanup
    }

    const targetLayout = matchedRoute.layout ?? 'main'

    if (targetLayout === 'main') {
      this.rootElement.innerHTML = ''
      this.rootElement.appendChild(this.mainLayout.element)
      this.mainLayout.setContent(pageElement)
    } else {
      this.rootElement.innerHTML = ''
      this.rootElement.appendChild(pageElement)
    }
  }
}
