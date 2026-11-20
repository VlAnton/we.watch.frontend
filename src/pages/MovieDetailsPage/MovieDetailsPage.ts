import './MovieDetailsPage.scss'

import { getMovieDetails } from '@/api/films'
import { TMDBCastItem, TMDBMovieDetails } from '@/api/films/types'
import { getRoomDetails } from '@/api/rooms'
import { createPoster } from '@/components/Image/Image'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'
import { setCurrentBreadcrumb } from '@/utils/breadcrumbs'

import pageTemplate from './MovieDetailsPage.html?raw'

const pageTemplateEl = document.createElement('template')
pageTemplateEl.innerHTML = pageTemplate

type MovieInfoField = readonly [key: keyof TMDBMovieDetails['data'], label: string]

const MOVIE_INFO_FIELDS = [
  ['releaseDate', 'дата выхода'],
  ['genres', 'жанры'],
  ['tagline', 'слоган'],
  ['directors', 'режиссер'],
  ['writers', 'сценарист'],
  ['producers', 'продюсер'],
  ['cinematographers', 'оператор'],
  ['editors', 'монтажер'],
  ['budgetUsd', 'бюджет'],
  ['runtimeMinutes', 'время']
] as const satisfies readonly MovieInfoField[]

export async function renderMovieDetailsPage() {
  function setCast(cast: TMDBCastItem[]) {
    const fragment = document.createDocumentFragment()
    cast.forEach((actor) => {
      const actorLink = document.createElement('a')
      actorLink.classList.add('link', 'link__s', 'link__alternate')
      actorLink.textContent = actor.name
      fragment.appendChild(actorLink)
    })
    castEl.appendChild(fragment)
  }

  function setRating(rating: number, votes: number) {
    const ratingTextEl = document.createElement('h3')
    ratingTextEl.classList.add('movie-details-page__rating')
    ratingTextEl.textContent = rating.toString()
    ratingEl.appendChild(ratingTextEl)

    const votesEl = document.createElement('p')
    votesEl.classList.add('movie-details-page__votes')
    votesEl.textContent = `${votes} оценок`
    ratingEl.appendChild(votesEl)
  }

  function setMovieInfo(movieDetails: TMDBMovieDetails['data']) {
    const fragment = document.createDocumentFragment()
    MOVIE_INFO_FIELDS.forEach(([field, title]) => {
      const rowTitle = document.createElement('p')
      const fieldData =
        movieDetails[field] instanceof String
          ? movieDetails[field].toLowerCase()
          : (movieDetails[field]?.toString() ?? 'неизвестно')
      rowTitle.textContent = title

      const rowData = document.createElement('p')
      rowData.textContent = fieldData.toLowerCase()

      fragment.appendChild(rowTitle)
      fragment.appendChild(rowData)
    })
    pageInfoEl.appendChild(fragment)
  }

  const pageRoot = pageTemplateEl.content.firstElementChild!.cloneNode(
    true
  ) as HTMLElement

  const posterContainerEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__poster-container'
  )!
  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!
  const pageOverviewEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__overview'
  )!
  const pageOriginalTItleEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__original-title'
  )!
  const pageInfoEl = pageRoot.querySelector<HTMLElement>('.movie-details-page__info')!
  const ratingEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__rating-container'
  )!
  const castEl = pageRoot.querySelector<HTMLElement>('.movie-details-page__cast')!

  const breadcrumbsEl = pageRoot.querySelector<HTMLElement>('.breadcrumbs')!

  const roomId = parseInt(router.params.roomId, 10)
  const movieId = parseInt(router.params.movieId, 10)
  let room

  if (roomId) {
    try {
      const roomDetails = await getRoomDetails(roomId)
      room = roomDetails.room
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    }
  }
  router.setBreadcrumbs(breadcrumbsEl, room?.name)

  try {
    const { success, data: movieDetails } = await getMovieDetails(movieId)
    if (!success) {
      throw new Error('попробуйте перезагрузить страницу')
    }
    setCurrentBreadcrumb(breadcrumbsEl, movieDetails.title.toLowerCase())
    const posterEl = createPoster({
      posterPath: movieDetails.posterPath,
      title: movieDetails.title,
      targetSize: 'w342'
    })
    pageTitleEl.textContent = movieDetails.title
    pageOverviewEl.textContent = movieDetails.overview
    pageOriginalTItleEl.textContent = movieDetails.originalTitle
    posterContainerEl.appendChild(posterEl)
    setCast(movieDetails.cast)
    setRating(movieDetails.rating, movieDetails.votes)
    setMovieInfo(movieDetails)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    toast.error(err.message, {
      title: 'ошибка загрузки данных о фильме'
    })
  }

  return pageRoot
}
