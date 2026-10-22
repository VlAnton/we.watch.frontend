import './Image.scss'

import { getPosterUrl, type PosterSize } from '@/utils/movie' // используем ранее созданный хелпер URL TMDB

export interface PosterProps {
  posterPath: string | null | undefined
  title: string
  targetSize?: PosterSize
}

export function createPoster({
  posterPath,
  title,
  targetSize = 'w342'
}: PosterProps): HTMLElement {
  const container = document.createElement('div')
  container.className = 'lqip-container'

  const shimmer = document.createElement('div')
  shimmer.className = 'lqip-container__shimmer'
  container.appendChild(shimmer)

  const thumbImg = document.createElement('img')
  thumbImg.className = 'lqip-container__thumb'
  thumbImg.alt = ''
  thumbImg.setAttribute('aria-hidden', 'true')
  thumbImg.src = getPosterUrl(posterPath, 'w92')

  const fullImg = document.createElement('img')
  fullImg.className = 'lqip-container__full'
  fullImg.alt = title
  fullImg.loading = 'lazy'
  fullImg.decoding = 'async'

  const onFullLoaded = () => {
    fullImg.classList.add('lqip-container__full--loaded')
    thumbImg.classList.add('lqip-container__thumb--hidden')

    setTimeout(() => {
      shimmer.remove()
      thumbImg.remove()
    }, 500)
  }

  fullImg.addEventListener('load', onFullLoaded)

  fullImg.addEventListener('error', () => {
    shimmer.remove()
    thumbImg.remove()
    fullImg.src = '/placeholder-poster.png'
    fullImg.classList.add('lqip-container__full--loaded')
  })

  fullImg.src = getPosterUrl(posterPath, targetSize)

  if (fullImg.complete && fullImg.naturalWidth > 0) {
    onFullLoaded()
  }

  container.appendChild(thumbImg)
  container.appendChild(fullImg)

  return container
}
