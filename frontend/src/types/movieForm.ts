export interface MovieFormData {
    name_en: string;
    name_ar: string;
    desc_en: string;
    desc_ar: string;
    release_date: string;
    imdb_url: string;
    duration: string;
    maturity_id: string;
    status_id: string;
    genres: string[];
    actors: string[];
    directors: string[];
    languages: string[];
    subtitles: string[];
    is_featured: boolean;
}

export const INITIAL_MOVIE_FORM_STATE: MovieFormData = {
    name_en: '',
    name_ar: '',
    desc_en: '',
    desc_ar: '',
    release_date: '',
    imdb_url: '',
    duration: '',
    maturity_id: '',
    status_id: '',
    genres: [],
    actors: [],
    directors: [],
    languages: [],
    subtitles: [],
    is_featured: false
};