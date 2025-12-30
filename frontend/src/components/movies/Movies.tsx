import { useEffect, useState } from 'react';
import MoviesAdd from './MoviesAdd';
import MoviesView from './MoviesView';
import { API_BASE_URL } from '../../constants/api';
import { Film, Plus } from 'lucide-react';

interface Movie {
    id: number;
    name_en: string;
    name_ar: string;
    release_date: string;
    audio_languages: Array<{ id: number, name_en: string, code: string; }>;
    poster_full_url: string | null;
    is_featured: boolean;
}

// Main Movies Component
export default function Movies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

    const fetchMovies = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/movies`)
            .then(res => res.json())
            .then(data => {
                setMovies(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Could not fetch movies", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleViewMovie = (movieId: number) => {
        setSelectedMovieId(movieId);
        setIsViewModalOpen(true);
    };

    if (loading) {
        return <div className="p-10 text-center text-xl font-semibold">Loading Movies...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold">Movies Library</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white font-bold p-3 rounded-full hover:bg-blue-700 hover:scale-105 shadow-lg transform transition duration-200"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="grid grid-cols-6 gap-6">
                {movies.map(movie => (
                    <div
                        key={movie.id}
                        onClick={() => handleViewMovie(movie.id)}
                        className={`flex flex-col h-full transition-all duration-200 rounded-xl border ${movie.is_featured ? "border-amber-400 border-2 hover:border-amber-400" : "border-gray-200 hover:border-blue-400"} cursor-pointer hover:scale-105`}
                    >
                        {movie.poster_full_url ? (
                            <img
                                src={movie.poster_full_url}
                                alt={movie.name_en}
                                className="aspect-[2/3] w-full rounded-t-lg object-cover"
                            />
                        ) : (
                            <div className="aspect-[2/3] w-full rounded-t-xl bg-gray-200 flex flex-col items-center justify-center border-b border-gray-300">
                                <Film className="text-gray-400 mb-2" size={40} />
                                <span className="text-gray-500 font-bold text-lg">N/A</span>
                            </div>
                        )}
                        <div className='bg-white p-6 flex flex-col gap-2 text-center rounded-b-xl'>
                            <h3 className="text-lg font-bold line-clamp-2">{movie.name_en}</h3>
                            <p className="text-sm">
                                <span className="font-semibold">Release: </span>
                                {new Date(movie.release_date).toLocaleDateString("en-GB", {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                            <div className='flex flex-wrap gap-2 justify-center'>
                                {movie.audio_languages.map(lang => (
                                    <p key={lang.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        {lang.name_en}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {movies.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-xl">No movies found. Add your first movie!</p>
                </div>
            )}

            {isAddModalOpen && (
            <MoviesAdd
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchMovies}
            />
            )}

            <MoviesView
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                movieId={selectedMovieId}
                onMovieDeleted={fetchMovies}
            />
        </div>
    );
}