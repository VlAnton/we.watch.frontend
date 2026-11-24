import './ContextMenu.scss'

import { effect, reactive } from '@/state/reactivity'

interface ContextMenuProps<T> {
  renderItem?: (item: T) => HTMLElement
  onSelect?: (event: MouseEvent) => void | Promise<void>
}

export function createContextMenu<T>(props: ContextMenuProps<T>) {
  const contextMenu = document.createElement('div')
  contextMenu.className = 'context-menu'

  const state = reactive({
    opened: false,
    items: [] as T[]
  })

  const toggleEffect = effect(() => {
    contextMenu.style.display = state.opened ? 'flex' : 'none'
  })

  const setItemsEffect = effect(() => {
    contextMenu.innerHTML = ''
    const fragment = document.createDocumentFragment()

    state.items.forEach((item) => {
      if (!props.renderItem) {
        return
      }
      const itemEl = props.renderItem(item)

      fragment.appendChild(itemEl)
    })

    contextMenu.appendChild(fragment)
  })

  if (props.onSelect) {
    contextMenu.addEventListener('click', props.onSelect)
  }

  return {
    element: contextMenu,
    setItems(items: T[]) {
      state.items = items
    },
    open() {
      state.opened = true
    },
    close() {
      state.opened = false
    },
    cleanup() {
      toggleEffect()
      setItemsEffect()
    }
  }
}
