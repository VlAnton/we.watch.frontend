export function setCurrentBreadcrumb(
  breadcrumbsEl: HTMLElement,
  currentBreadcrumbName: string
) {
  const currentBreadcrumbEl = document.createElement('a')
  currentBreadcrumbEl.classList.add(
    'link',
    'link__breadcrumb',
    'link__breadcrumb--disabled'
  )
  currentBreadcrumbEl.textContent = currentBreadcrumbName
  breadcrumbsEl.appendChild(currentBreadcrumbEl)
}
