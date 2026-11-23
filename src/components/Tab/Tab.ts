import './Tab.scss'

import { router } from '@/main'
import { effect, reactive } from '@/state/reactivity'

interface Props {
  text: string
  size: 's' | 'm' | 'l'
  type?: 'button' | 'link'
  href?: string
}

export function createTab(props: Props) {
  const tabType = props.type ?? 'a'
  const tabEl = document.createElement(tabType)

  const tabClass = props.type ?? 'link'

  tabEl.classList.add(tabClass, `${tabClass}--${props.size}`, 'tab')
  tabEl.textContent = props.text
  if (tabType === 'a') {
    ;(tabEl as HTMLLinkElement).href = props.href ?? '#'
  }

  const state = reactive({
    isActive: false
  })

  const cleanup = effect(() => {
    tabEl.classList.toggle('tab--active', state.isActive)
  })

  if (props.type === 'button') {
    tabEl.addEventListener('click', () => {
      if (props.href) {
        router.navigate(props.href)
        return
      }
      state.isActive = true
    })
  }

  return {
    element: tabEl,
    get isActive(): boolean {
      return state.isActive
    },
    set isActive(value: boolean) {
      state.isActive = value
    },
    toggleActive: (isActive: boolean) => {
      state.isActive = isActive
    },
    cleanup
  }
}
