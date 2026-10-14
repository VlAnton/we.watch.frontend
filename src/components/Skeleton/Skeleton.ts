import './Skeleton.scss'

import skeletonTemplate from './Skeleton.html?raw'

interface SkeletonProps {
  size: 's' | 'm' | 'l'
}

export function createSkeleton(props: SkeletonProps) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(skeletonTemplate, 'text/html')
  const skeletonEl = doc.body.firstElementChild as HTMLElement

  switch (props.size) {
    case 's':
      skeletonEl.style.height = '40px'
      break
    case 'm':
      skeletonEl.style.height = '60px'
      break
    case 'l':
      skeletonEl.style.height = '80px'
      break
  }

  return skeletonEl
}
