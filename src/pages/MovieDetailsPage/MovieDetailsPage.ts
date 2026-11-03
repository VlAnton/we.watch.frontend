import { getMovieDetails } from '@/api/films'
import { getRoomDetails } from '@/api/rooms'
import { toast } from '@/components/Toast/Toast'
import { router } from '@/main'

import pageTemplate from './MovieDetailsPage.html?raw'

export async function renderMovieDetailsPage() {
  const parser = new DOMParser()
  const doc = parser.parseFromString(pageTemplate, 'text/html')
  const pageRoot = doc.body.firstElementChild as HTMLElement

  const pageTitleEl = pageRoot.querySelector<HTMLElement>('.page__title')!
  const pageOverviewEl = pageRoot.querySelector<HTMLElement>(
    '.movie-details-page__overview'
  )!
  const breadcrumbsEl = pageRoot.querySelector<HTMLElement>('.breadcrumbs')!
  const roomId = parseInt(router.params.roomId, 10)
  const movieId = parseInt(router.params.movieId, 10)
  let room

  try {
    const roomDetails = await getRoomDetails(roomId)
    room = roomDetails.room

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.message)
  }
  router.setBreadcrumbs(breadcrumbsEl, room?.name)

  try {
    const { success, data: movieDetails } = await getMovieDetails(movieId)
    if (!success) {
      throw new Error('попробуйте перезагрузить страницу')
    }
    pageTitleEl.textContent = movieDetails.title
    pageOverviewEl.textContent = movieDetails.overview ?? ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    toast.error(err.message, {
      title: 'ошибка загрузки данных о фильме'
    })
  }

  return pageRoot
}
