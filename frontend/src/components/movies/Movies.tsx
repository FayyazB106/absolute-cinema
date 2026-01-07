import { useEffect, useState } from 'react';
import AddMovie from './AddMovie';
import ViewMovie from './ViewMovie';
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
        return statuses.find(m => m.id === id)?.name_en || '';
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'released': return 'bg-green-600 text-white';
            case 'coming soon': return 'bg-blue-600 text-white';
            case 'unavailable': return 'bg-amber-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getLanguageStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'english': return 'bg-white text-red-600 ring-2 ring-blue-800';
            case 'arabic': return 'bg-green-600 text-white';
            case 'french': return 'bg-blue-800 text-white ring-2 ring-red-600';
            case 'spanish': return 'bg-[#AD1519] text-[#FABD00] ring-2 ring-[#FABD00]';
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
                {movies.map(movie => {
                    const statusLabel = getStatusName(movie.status_id);
                    const ratingLabel = getRatingName(movie.maturity_id);
                    const isRestricted = ratingLabel.toUpperCase().startsWith('R');

                    return (
                        <div
                            key={movie.id}
                            onClick={() => handleViewMovie(movie.id)}
                            className={`flex flex-col h-full transition-all duration-200 hover:shadow-xl rounded-xl ${movie.is_featured ? "ring-2 ring-amber-400 hover:ring-amber-500" : "hover:ring-2 hover:ring-blue-400"} cursor-pointer hover:scale-105`}
                        >
                            {movie.poster_full_url ? (
                                <img src={movie.poster_full_url} alt={movie.name_en} className="aspect-[2/3] w-full rounded-t-xl object-cover" />
                            ) : (
                                <div className="aspect-[2/3] w-full rounded-t-xl bg-gray-200 flex flex-col items-center justify-center border-b border-gray-300">
                                    <Film className="text-gray-400 mb-2" size={40} />
                                    <span className="text-gray-500 font-bold text-lg">N/A</span>
                                </div>
                            )}
                            <div className={`h-full bg-white p-6 flex flex-col justify-between gap-2 text-center ${isRestricted ? "" : "rounded-b-xl"}`}>
                                <h3 className="text-lg font-bold line-clamp-2">{movie.name_en}</h3>
                                <div className='flex justify-center'>
                                    {statusLabel &&
                                        <p className={`${getStatusStyles(statusLabel)} px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>
                                            {statusLabel}
                                        </p>
                                    }
                                </div>
                                <div className='flex flex-wrap justify-center gap-2'>
                                    {movie.audio_languages && (
                                        movie.audio_languages.map(lang => (
                                            <p key={lang.id} className={`${getLanguageStyles(lang.name_en)} px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>
                                                {lang.name_en}
                                            </p>
                                        ))
                                    )}
                                </div>
                            </div>
                            {isRestricted &&
                                <div className='bg-red-600 text-white rounded-b-xl text-md font-bold text-center'>
                                    <p>{ratingLabel}</p>
                                </div>
                            }
                        </div>
                    );
                })}
            </div>

            {movies.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-xl">No movies found. Add your first movie!</p>
                </div>
            )}

            {isAddModalOpen && (
                <AddMovie
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={loadData}
                />
            )}

            <ViewMovie
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                movieId={selectedMovieId}
                onMovieDeleted={loadData}
            />
        </div>
    );
}