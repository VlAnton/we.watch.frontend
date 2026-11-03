export interface TMDBSearchResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface MovieItem {
  id: number
  movieId: number
  title: string
  posterPath: string
}

export interface TMDBMovieDetails {
  success: boolean
  data: {
    id: number
    title: string
    poster_path?: string | null
    overview?: string | null
    original_title: string
    imdb_id?: string | null
    genres: {
      id: number
      name: string
    }[]
    production_countries: {
      iso_3166_1: string
      name: string
    }[]
    release_date?: string | null
    tagline?: string | null
  }
}
