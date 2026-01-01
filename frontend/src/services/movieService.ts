import { API_BASE_URL } from '../constants/api';
import type { Movie, Rating, Status, Options, MovieDetails } from '../types/movie';

export const movieService = {
    // Fetch all movies
    getMovies: async (): Promise<Movie[]> => {
        const res = await fetch(`${API_BASE_URL}/movies`);
        if (!res.ok) throw new Error('Failed to fetch movies');
        return res.json();
    },

    // Fetch single movie details
    getMovieById: async (id: number): Promise<MovieDetails> => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}`);
        if (!res.ok) throw new Error('Failed to fetch movie details');
        return res.json();
    },

    // Fetch all ratings
    getRatings: async (): Promise<Rating[]> => {
        const res = await fetch(`${API_BASE_URL}/ratings`);
        if (!res.ok) throw new Error('Failed to fetch ratings');
        return res.json();
    },

    // Fetch all statuses
    getStatuses: async (): Promise<Status[]> => {
        const res = await fetch(`${API_BASE_URL}/statuses`);
        if (!res.ok) throw new Error('Failed to fetch statuses');
        return res.json();
    },

    // Fetch everything needed for dropdowns in one go
    getOptions: async (): Promise<Options> => {
        const res = await fetch(`${API_BASE_URL}/movie-options`);
        if (!res.ok) throw new Error('Failed to fetch options');
        return res.json();
    },

    // Create Movie
    createMovie: async (formData: FormData) => {
        const res = await fetch(`${API_BASE_URL}/movies`, {
            method: 'POST',
            // NOTE: Do NOT set Content-Type header manually when sending FormData
            // The browser will automatically set it to 'multipart/form-data' with the correct boundary
            body: formData,
        });
        return res;
    },

    // Update Movie
    updateMovie: async (id: number, formData: FormData): Promise<Response> => {
        formData.append('_method', 'PUT');
        const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
            method: 'POST',
            // NOTE: Do NOT set Content-Type header manually when sending FormData
            // The browser will automatically set it to 'multipart/form-data' with the correct boundary
            body: formData,
        });
        return res;
    },

    // Delete Movie
    deleteMovie: async (id: number): Promise<Response> => {
        const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
            method: 'DELETE',
        });
        return res;
    }
};