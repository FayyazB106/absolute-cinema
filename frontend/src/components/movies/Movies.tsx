import { useEffect, useState } from 'react';
import AddMovie from './AddMovie';
import ViewMovie from './ViewMovie';
import { Film, OctagonMinus, Search, Star, X } from 'lucide-react';
import PlusButton from '../shared/PlusButton';
import type { Language, Movie, Rating, Status } from '../../types/movie';
import { movieService } from '../../services/movieService';
import Title from '../shared/Title';

export default function Movies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
    const [isRestricted, setIsRestricted] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch everything in parallel
            const [moviesData, ratingsData, statusesData, languagesData] = await Promise.all([
                movieService.getMovies(),
                movieService.getRatings(),
                movieService.getStatuses(),
                movieService.getLanguages()
            ]);

            setMovies(moviesData);
            setRatings(ratingsData);
            setStatuses(statusesData);
            setLanguages(languagesData)
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

    const getLanguageStyles = (langauge: string) => {
        switch (langauge.toLowerCase()) {
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


    const filteredItems = movies.filter(item => {
        // Filter items based on search term (English or Arabic)
        const matchesSearch = item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || item.name_ar.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter items with toggle
        const matchesFeatured = showFeaturedOnly ? item.is_featured : true;
        const matchesStatus = selectedStatus === "all" ? true : item.status_id === Number(selectedStatus);
        const matchesLanguage = selectedLanguage === "all" ? true : item.audio_languages?.some(lang => lang.name_en === selectedLanguage);
        const matchesRestriced = isRestricted ? getRatingName(item.maturity_id).toUpperCase().startsWith('R') : true;

        return matchesSearch && matchesFeatured && matchesStatus && matchesLanguage && matchesRestriced;
    });
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <Title text="Movies Library" />

                <div className='flex flex-row gap-5'>
                    {/* Search bar */}
                    <div className="relative w-full max-w-md mx-4">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 border rounded-full focus:border-blue-400 outline-none shadow-sm transition-all"
                        />
                        <div className="absolute right-3 top-2.5 flex items-center">
                            {searchTerm ? (
                                <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={18} />
                                </button>
                            ) : (
                                <div className="text-gray-400">
                                    <Search size={18} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Featured Toggle Button */}
                    <button
                        onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showFeaturedOnly
                            ? "bg-amber-100 border-amber-400 text-amber-700 shadow-inner"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <div className={`${showFeaturedOnly ? "fill-amber-500 text-amber-500" : "text-gray-400"}`}>
                            <Star size={18} />
                        </div>
                        <span className="text-sm font-semibold">Featured</span>
                    </button>

                    {/* Restricted Toggle Button */}
                    <button
                        onClick={() => setIsRestricted(!isRestricted)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isRestricted
                            ? "bg-red-100 border-red-400 text-red-700 shadow-inner"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <div className={`${isRestricted ? "fill-red-500 text-red-500" : "text-gray-400"}`}>
                            <OctagonMinus size={18} />
                        </div>
                        <span className="text-sm font-semibold">Restricted</span>
                    </button>

                    {/* Status Dropdown */}
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                        className="text-gray-600 p-2 px-4 rounded-full border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-400 outline-none bg-white cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        {statuses.map(s => (
                            <option key={s.id} value={s.id}>{s.name_en}</option>
                        ))}
                    </select>

                    {/* Language Dropdown */}
                    <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="text-gray-600 p-2 px-4 rounded-full border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-400 outline-none bg-white cursor-pointer"
                    >
                        <option value="all">All Languages</option>
                        {languages.map(s => (
                            <option key={s.id} value={s.id}>{s.name_en}</option>
                        ))}
                    </select>

                    {/* Clear All Filters Button (Visible only when filtering) */}
                    {(searchTerm || showFeaturedOnly || isRestricted || selectedStatus !== "all" || selectedLanguage !== "all") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setShowFeaturedOnly(false);
                                setIsRestricted(false);
                                setSelectedStatus("all");
                                setSelectedLanguage("all");
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider whitespace-nowrap"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <PlusButton onClick={() => setIsAddModalOpen(true)} />
            </div>

            <div className="grid grid-cols-6 gap-6">
                {filteredItems.map(movie => {
                    const statusLabel = getStatusName(movie.status_id);
                    const ratingLabel = getRatingName(movie.maturity_id);
                    const hasRestrictedRating = ratingLabel.toUpperCase().startsWith('R');

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
                            {hasRestrictedRating && <div className='bg-red-600 text-white rounded-b-xl text-md font-bold text-center'>{ratingLabel}</div>}
                        </div>
                    );
                })}
            </div>

            {/* No Results State */}
            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-xl font-medium">
                        No {showFeaturedOnly ? "featured " : ""}movies match your criteria
                    </p>
                    <div className="flex gap-4 mt-4">
                        {(searchTerm || showFeaturedOnly) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setShowFeaturedOnly(false);
                                }}
                                className="text-blue-500 hover:underline font-semibold"
                            >
                                Reset all filters
                            </button>
                        )}
                    </div>
                </div>
            )}

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