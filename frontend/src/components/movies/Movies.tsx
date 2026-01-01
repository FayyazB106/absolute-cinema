import { useEffect, useState } from 'react';
import MoviesAdd from './MoviesAdd';
import MoviesView from './MoviesView';
import { Film } from 'lucide-react';
import PlusButton from '../shared/PlusButton';
import type { Movie, Rating, Status } from '../../types/movie';
import { movieService } from '../../services/movieService';
import Title from '../shared/Title';

export default function Movies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch everything in parallel
            const [moviesData, ratingsData, statusesData] = await Promise.all([
                movieService.getMovies(),
                movieService.getRatings(),
                movieService.getStatuses()
            ]);

            setMovies(moviesData);
            setRatings(ratingsData);
            setStatuses(statusesData);
        } catch (err) {
            console.error("Data loading failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const getRatingName = (id: number) => {
        return ratings.find(m => m.id === id)?.maturity_rating || '';
    };

    const getStatusName = (id: number) => {
        return statuses.find(m => m.id === id)?.status || '';
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'released': return 'bg-green-600 text-white';
            case 'coming soon': return 'bg-blue-600 text-white';
            case 'unavailable': return 'bg-amber-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

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
                <Title text="Movies Library" />
                <PlusButton onClick={() => setIsAddModalOpen(true)} />
            </div>

            <div className="grid grid-cols-6 gap-6">
                {movies.map(movie => (
                    <div
                        key={movie.id}
                        onClick={() => handleViewMovie(movie.id)}
                        className={`flex flex-col h-full transition-all duration-200 rounded-xl border ${movie.is_featured ? "border-amber-400 border-2 hover:border-amber-400" : "border-gray-200 hover:border-blue-400"} cursor-pointer hover:scale-105`}
                    >
                        {movie.poster_full_url ? (
                            <img src={movie.poster_full_url} alt={movie.name_en} className="aspect-[2/3] w-full rounded-t-lg object-cover" />
                        ) : (
                            <div className="aspect-[2/3] w-full rounded-t-xl bg-gray-200 flex flex-col items-center justify-center border-b border-gray-300">
                                <Film className="text-gray-400 mb-2" size={40} />
                                <span className="text-gray-500 font-bold text-lg">N/A</span>
                            </div>
                        )}
                        <div className='h-full bg-white p-6 flex flex-col justify-between gap-2 text-center rounded-b-xl'>
                            <h3 className="text-lg font-bold line-clamp-2">{movie.name_en}</h3>
                            <div className='flex flex-wrap gap-2 justify-center'>
                                {(() => {
                                    const ratingLabel = getRatingName(movie.maturity_id);
                                    if (ratingLabel.toUpperCase().startsWith('R')) {
                                        return (
                                            <p className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black">
                                                {ratingLabel}
                                            </p>
                                        );
                                    }
                                })()}
                            </div>
                            <div className='flex flex-wrap gap-2 justify-center'>
                                {(() => {
                                    const statusLabel = getStatusName(movie.status_id);
                                    if (!statusLabel) return null;
                                    return (
                                        <p className={`${getStatusStyles(statusLabel)} px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>
                                            {statusLabel}
                                        </p>
                                    );
                                })()}
                            </div>
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
                    onSuccess={movieService.getMovies}
                />
            )}

            <MoviesView
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                movieId={selectedMovieId}
                onMovieDeleted={movieService.getMovies}
            />
        </div>
    );
}