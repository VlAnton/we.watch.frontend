import './MovieCard.scss'

import { MovieItem } from '@/api/films/types'

import { createPoster } from '../Image/Image'
import movieCardTemplate from './MovieCard.html?raw'

type MovieCardProps = MovieItem

export function createMovieCard(props: MovieCardProps) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(movieCardTemplate, 'text/html')
  const movieCardEl = doc.body.firstElementChild as HTMLElement

  const cardTitle = movieCardEl.querySelector<HTMLElement>('.card__title')!
  const cardImgContainer = movieCardEl.querySelector<HTMLElement>(
    '.movie-card__img-container'
  )!
  const posterElement = createPoster({
    posterPath: props.posterPath,
    title: props.title,
    targetSize: 'w342'
  })

  cardTitle.innerHTML = props.title
  cardImgContainer.appendChild(posterElement)

  return movieCardEl
}
