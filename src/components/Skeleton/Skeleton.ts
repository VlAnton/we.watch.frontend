import './Skeleton.scss'

import skeletonTemplate from './Skeleton.html?raw'

interface SkeletonProps {
  height: string
}

const skeletonTemplateEl = document.createElement('template')
skeletonTemplateEl.innerHTML = skeletonTemplate

export function createSkeleton(props: SkeletonProps) {
  const skeletonEl = skeletonTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  skeletonEl.style.height = props.height

  return skeletonEl
}
