import { useEffect, useState } from 'react';
import AddMovie from './AddMovie';
import ViewMovie from './ViewMovie';
import { ChevronDown, Film, OctagonMinus, Search, Star, X } from 'lucide-react';
import PlusButton from '../shared/PlusButton';
import type { Language, Movie, Rating, Status } from '../../types/movie';
import { movieService } from '../../services/movieService';
import Title from '../shared/Title';
import { useTranslation } from 'react-i18next';

export default function Movies() {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
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
        const status = statuses.find(m => m.id === id);
        return { en: status?.name_en || '', ar: status?.name_ar || '' };
    };

    const getStatusStyles = (status: { en: string; ar: string }) => {
        switch (status.en.toLowerCase()) {
            case 'released': return 'bg-green-600 text-white';
            case 'coming soon': return 'bg-blue-600 text-white';
            case 'unavailable': return 'bg-amber-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    // Define status priority order (lower number = higher priority)
    const getStatusPriority = (statusId: number) => {
        const status = getStatusName(statusId);
        switch (status.en.toLowerCase()) {
            case 'released': return 1;
            case 'coming soon': return 2;
            case 'unavailable': return 3;
            default: return 4;
        }
    };

    const handleViewMovie = (movieId: number) => {
        setSelectedMovieId(movieId);
        setIsViewModalOpen(true);
    };

    const filteredItems = movies
        .filter(item => {
            // Filter items based on search term (English or Arabic)
            const matchesSearch = item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || item.name_ar.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter items with toggle
            const matchesFeatured = showFeaturedOnly ? item.is_featured : true;
            const matchesStatus = selectedStatus === "all" ? true : item.status_id === Number(selectedStatus);
            const matchesLanguage = selectedLanguage === "all" ? true : item.audio_languages?.some(lang => lang.id === Number(selectedLanguage));
            const matchesRestriced = isRestricted ? getRatingName(item.maturity_id).toUpperCase().startsWith('R') : true;

            return matchesSearch && matchesFeatured && matchesStatus && matchesLanguage && matchesRestriced;
        })
        .sort((a, b) => {
            // 1. Featured first
            if (a.is_featured !== b.is_featured) { return b.is_featured ? 1 : -1; }

            // 2. Status priority
            const statusDiff = getStatusPriority(a.status_id) - getStatusPriority(b.status_id);
            if (statusDiff !== 0) { return statusDiff; }

            // 3. Alphabetical by name_en
            return a.name_en.localeCompare(b.name_en);
        });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-10 space-y-4">
                <div className="w-12 h-12 border-4 db-spinner-blue rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <Title text={t("titles.movies")} />

                <div className='flex flex-row gap-5'>
                    {/* Search bar */}
                    <div className="relative w-full max-w-md mx-4">
                        <input
                            type="text"
                            placeholder={t("movies_library.search_placeholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-4 pr-10 db-input border db-border rounded-full db-focus-border outline-none shadow-sm transition-all placeholder:text-gray-400"
                        />
                        <div className={`absolute ${isEnglish ? "right-3" : "left-3"} top-2.5 flex items-center`}>
                            {searchTerm ? (
                                <button onClick={() => setSearchTerm("")} className="db-text-secondary hover:db-text cursor-pointer">
                                    <X size={18} />
                                </button>
                            ) : (
                                <div className="db-text-secondary">
                                    <Search size={18} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Featured Toggle Button */}
                    <button
                        onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer 
                            ${showFeaturedOnly ? "db-badge-amber shadow-inner" : "db-badge-white"}`}
                    >
                        <div className={`${showFeaturedOnly ? "db-fill-amber" : "db-fill-gray"}`}>
                            <Star size={18} />
                        </div>
                        <span className="text-sm font-semibold">{t("movies_library.featured")}</span>
                    </button>

                    {/* Restricted Toggle Button */}
                    <button
                        onClick={() => setIsRestricted(!isRestricted)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer 
                            ${isRestricted ? "db-badge-red shadow-inner" : "db-badge-white"}`}
                    >
                        <div className={`${isRestricted ? "db-fill-red" : "db-fill-gray"}`}>
                            <OctagonMinus size={18} />
                        </div>
                        <span className="text-sm font-semibold">{t("movies_library.restricted")}</span>
                    </button>

                    {/* Status Dropdown */}
                    <div className='relative flex items-center'>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="db-text-dropdown db-input border db-border p-2 px-6 rounded-full text-sm font-medium db-focus-ring appearance-none outline-none cursor-pointer"
                        >
                            <option value="all">{t("movies_library.all_statuses")}</option>
                            {statuses.map(s => (<option key={s.id} value={s.id}>{isEnglish ? s.name_en : s.name_ar}</option>))}
                        </select>
                        <div className={`absolute ${isEnglish ? "right-2" : "left-2"} pointer-events-none db-text-secondary`}>
                            <ChevronDown size={18} />
                        </div>
                    </div>

                    {/* Language Dropdown */}
                    <div className='relative flex items-center'>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="db-text-dropdown db-input border db-border p-2 px-6 rounded-full text-sm font-medium db-focus-ring appearance-none outline-none cursor-pointer"
                        >
                            <option value="all">{t("movies_library.all_languages")}</option>
                            {languages.map(l => (<option key={l.id} value={l.id}>{isEnglish ? l.name_en : l.name_ar}</option>))}
                        </select>
                        <div className={`absolute ${isEnglish ? "right-2" : "left-2"} pointer-events-none db-text-secondary`}>
                            <ChevronDown size={18} />
                        </div>
                    </div>

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
                            className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer"
                        >
                            {t("movies_library.clear_all")}
                        </button>
                    )}
                </div>

                <PlusButton title={t("movies_library.add_new_movie")} onClick={() => setIsAddModalOpen(true)} />
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
                            className={`flex flex-col h-full transition-all hover:shadow-xl rounded-xl ${movie.is_featured ? "ring-2 db-featuredRing" : "hover:ring-2 hover:ring-blue-400"} cursor-pointer hover:scale-105`}
                        >
                            {movie.poster_full_url ? (
                                <img src={movie.poster_full_url} alt={movie.name_en} className="aspect-[2/3] w-full rounded-t-xl object-cover" />
                            ) : (
                                <div className="aspect-[2/3] w-full rounded-t-xl db-noPoster flex flex-col items-center justify-center">
                                    <Film className="text-gray-400 mb-2" size={40} />
                                    <span className="text-gray-500 font-bold text-lg">N/A</span>
                                </div>
                            )}
                            <div className={`h-full db-movieBG p-6 flex flex-col justify-between gap-2 text-center ${hasRestrictedRating ? "" : "rounded-b-xl"}`}>
                                <h3 className="text-lg font-bold line-clamp-2">{isEnglish ? movie.name_en : movie.name_ar}</h3>
                                <div className='flex justify-center'>
                                    {statusLabel &&
                                        <p className={`${getStatusStyles(statusLabel)} px-3 py-1 rounded-full text-[10px] font-bold uppercase`}>
                                            {isEnglish ? statusLabel.en : statusLabel.ar}
                                        </p>
                                    }
                                </div>
                                <div className='flex flex-wrap justify-center gap-2'>
                                    {movie.audio_languages && (
                                        movie.audio_languages.map(lang => (
                                            <p
                                                key={lang.id}
                                                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase"
                                                style={{
                                                    backgroundColor: `#${lang.bg_color || '6b7280'}`,
                                                    color: `#${lang.text_color || 'ffffff'}`,
                                                    boxShadow: `0 0 0 2px #${lang.ring_color || '6b7280'}`
                                                }}
                                            >
                                                {isEnglish ? lang.name_en : lang.name_ar}
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
            {movies.length > 0 && filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Search size={50} className="mb-4 opacity-50" />
                    <p className="text-xl font-medium">
                        {t("movies_library.no_matches", { type: showFeaturedOnly ? t("movies_library.type_featured") : "" })}
                    </p>
                    <div className="flex gap-4 mt-4">
                        {(searchTerm || showFeaturedOnly) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setShowFeaturedOnly(false);
                                }}
                                className="text-blue-500 hover:underline font-semibold cursor-pointer"
                            >
                                {t("movies_library.reset_filters")}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {movies.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-xl">{t("movies_library.no_movies_found")}</p>
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