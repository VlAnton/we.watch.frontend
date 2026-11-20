interface Props {
  href: string
  text: string
  size: 's' | 'm' | 'l'
}

export function createTab(props: Props) {
  const tabEl = document.createElement('a')
  tabEl.classList.add('link', 'link__tab', `link__${props.size}`)
  tabEl.textContent = props.text
  tabEl.href = props.href

  return tabEl
}
