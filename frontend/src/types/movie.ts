export interface Actor {
    id: number;
    name_en: string;
    name_ar: string;
}

export interface Director {
    id: number;
    name_en: string;
    name_ar: string;
}

export interface Genre {
    id: number;
    name_en: string;
    name_ar: string;
}

export interface Language {
    id: number;
    name_en: string;
    name_ar: string;
}

export interface Rating {
    id: number;
    ranking: number,
    maturity_rating: string;
    name_en: string;
    name_ar: string;
}

export interface Status {
    id: number;
    name_en: string;
    name_ar: string;
}

export interface Movie {
    id: number;
    name_en: string;
    name_ar: string;
    release_date: string;
    audio_languages: Language[];
    poster_full_url: string | null;
    is_featured: boolean;
    maturity_id: number;
    status_id: number;
}

export interface MovieDetails {
    id: number;
    name_en: string;
    name_ar: string;
    desc_en: string;
    desc_ar: string;
    release_date: string;
    duration: number;
    imdb_url: string;
    maturity_ratings: { id: number; maturity_rating: string };
    status: Status; // Unlike genres, actors, directors and languages, movies have one status so it should be single object, not array.
    genres: Genre[];
    actors: Actor[];
    directors: Director[];
    audio_languages: Language[];
    subtitles: Language[];
    poster_full_url: string | null;
    featured_full_url: string | null;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

// For dropdowns in the add and edit movie modals
export interface Options {
    genres: Genre[];
    actors: Actor[];
    directors: Director[];
    languages: Language[];
    maturity_ratings: Rating[];
    statuses: Status[];
}