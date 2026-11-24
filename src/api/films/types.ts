export interface TMDBSearchResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface MovieItem {
  movieId: number
  title: string
  posterPath: string
}

export interface TMDBCastItem {
  id: number
  name: string
}

export interface TMDBMovieDetails {
  success: boolean
  data: {
    movieId: number
    title: string
    posterPath?: string | null
    overview: string
    originalTitle: string
    genres: {
      id: number
      name: string
    }[]
    countries: string
    rating: number
    votes: number
    releaseDate?: string | null
    tagline: string
    cast: TMDBCastItem[]
    directors: string
    writers: string
    producers: string
    cinematographers: string
    editors: string
    budgetUsd: string
    runtimeMinutes: string
  }
}
