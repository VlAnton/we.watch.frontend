import './MovieCard.scss'

import { MovieItem } from '@/api/films/types'
import { config } from '@/config'

import movieCardTemplate from './MovieCard.html?raw'

type MovieCardProps = MovieItem

export function createMovieCard(props: MovieCardProps) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(movieCardTemplate, 'text/html')
  const movieCardEl = doc.body.firstElementChild as HTMLElement

  const cardTitle = movieCardEl.querySelector<HTMLElement>('.card__title')!
  const cardImg = movieCardEl.querySelector<HTMLImageElement>('.movie-card__img')!

  cardTitle.innerHTML = props.title
  cardImg.src = `${config.images.tmdbBaseUrl}/${config.images.posterSmall}${props.posterPath}`

  return movieCardEl
}
