import { useEffect, useState } from 'react';
import { X, Calendar, Clock, Globe, Star, Users, Video, Film, Subtitles, Trash2, ImageIcon, UserRound } from 'lucide-react';
import { Pencil } from 'lucide-react';
import EditMovie from './EditMovie';
import type { MovieDetails } from '../../types/movie';
import { movieService } from '../../services/movieService';
import { confirmMovieDelete, showErrorMessage, showSuccessMessage } from '../shared/SweetAlert';
import { useTranslation } from 'react-i18next';

interface ViewMovieProps {
    isOpen: boolean;
    onClose: () => void;
    movieId: number | null;
    onMovieDeleted: () => void;
}

export default function ViewMovie({ isOpen, onClose, movieId, onMovieDeleted }: ViewMovieProps) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    useEffect(() => {
        if (isOpen && movieId) {
            setLoading(true);
            setError(null);

            movieService.getMovieById(movieId)
                .then(data => {
                    setMovie(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Could not fetch movie details", err);
                    setError(t("movies_library.error_load_details"));
                    setLoading(false);
                });
        }
    }, [isOpen, movieId]);

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmMovieDelete(name);

        if (result.isConfirmed) {
            try {
                await movieService.deleteMovie(id);
                onMovieDeleted();
                onClose();
                showSuccessMessage(t("movies_library.success_remove"));
            } catch (error) {
                showErrorMessage(t("movies_library.error_general"));
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <div className="db-movieBG rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                {/* The Image Preview Popup (Overlay) */}
                {previewImage && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-10" onClick={() => setPreviewImage(null)}>
                        <button onClick={() => setPreviewImage(null)} className="absolute top-5 right-5 text-white p-2 rounded-full db-overlay-button">
                            <X size={32} />
                        </button>
                        <div className="text-center" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-white text-xl font-bold mb-4">{previewImage.title}</h3>
                            <img src={previewImage.url} alt="Preview" className="max-w-full max-h-[70vh]" />
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="sticky top-0 db-view-header text-white px-8 py-6 flex flex-col gap-5 rounded-t-xl">
                    <div className="flex flex-row justify-end gap-2">
                        <button
                            onClick={() => movie && handleDelete(movie.id, movie.name_en)}
                            className="text-white db-btn-delete rounded-full transition flex items-center gap-2 text-sm font-medium p-3 cursor-pointer"
                            title={t("buttons.delete")}
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="text-white db-btn-edit rounded-full transition flex items-center gap-2 text-sm font-medium p-3 cursor-pointer"
                            title={t("buttons.edit")}
                        >
                            <Pencil size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white db-overlay-button rounded-full transition flex items-center gap-2 text-sm font-medium p-3 border cursor-pointer"
                            title={t("buttons.close")}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div>
                        <div className="flex-1">
                            {loading ? (
                                <div className="h-8 bg-white bg-opacity-20 rounded w-64 animate-pulse"></div>
                            ) : movie ? (
                                <div className='text-center'>
                                    <h1 className="text-3xl font-extrabold mb-2">{isEnglish ? movie.name_en : movie.name_ar}</h1>
                                    <h2 className="text-xl opacity-90">{isEnglish ? movie.name_ar : movie.name_en}</h2>
                                    {Boolean(movie.is_featured) && (
                                        <span className="db-accent-amber font-bold py-2 flex items-center justify-center gap-1">
                                            <Star size={16} /> {t("movies_library.featured")}
                                        </span>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="h-4 db-pulse rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 db-pulse rounded w-1/2 animate-pulse"></div>
                            <div className="h-4 db-pulse rounded w-5/6 animate-pulse"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 db-action-danger text-xl font-semibold">
                            <p>{error}</p>
                        </div>
                    ) : movie ? (
                        <div className="space-y-6">

                            {/* Quick Info Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="db-info-box-blue p-4 rounded-lg text-center">
                                    <div className="flex justify-center items-center gap-2 db-info-blue-text mb-1">
                                        <Calendar size={18} />
                                        <span className="text-xs font-semibold uppercase">{t("movies_library.release_date")}</span>
                                    </div>
                                    <p className="text-lg font-bold db-text">
                                        {new Date(movie.release_date).toLocaleDateString(isEnglish ? "en-GB" : "ar-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="db-info-box p-4 rounded-lg text-center">
                                    <div className="flex justify-center items-center gap-2 db-info-purple-text mb-1">
                                        <Clock size={18} />
                                        <span className="text-xs font-semibold uppercase">{t("movies_library.duration")}</span>
                                    </div>
                                    <p className="text-lg font-bold db-text">{t("movies_library.duration_minutes", { count: movie.duration })}</p>
                                </div>

                                <div className="db-success-box p-4 rounded-lg text-center">
                                    <div className="flex justify-center items-center gap-2 db-info-green-text mb-1">
                                        <UserRound size={18} />
                                        <span className="text-xs font-semibold uppercase">{t("movies_library.maturity_rating")}</span>
                                    </div>
                                    <p className="text-lg font-bold db-text">{movie.maturity_ratings?.maturity_rating}</p>
                                </div>

                                <div className="db-info-box-orange p-4 rounded-lg text-center">
                                    <div className="flex justify-center items-center gap-2 db-info-orange-text mb-1">
                                        <Film size={18} />
                                        <span className="text-xs font-semibold uppercase">{t("movies_library.status")}</span>
                                    </div>
                                    <p className="text-lg font-bold db-text">{isEnglish ? movie.status?.name_en : movie.status?.name_ar}</p>
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="db-border border-t pt-6">
                                <h3 className="text-xl font-bold mb-3 db-text">{t("movies_library.description")}</h3>
                                <div className={`space-y-4 flex ${isEnglish ? "flex-col" : "flex-col-reverse" }`}>
                                    <div className="db-list-item p-4 rounded-lg text-left leading-relaxed db-text">{movie.desc_en}</div>
                                    <div className="db-list-item p-4 rounded-lg text-right leading-relaxed db-text">{movie.desc_ar}</div>
                                </div>
                            </div>

                            {/* Genres */}
                            {movie.genres && movie.genres.length > 0 && (
                                <div className="db-border border-t pt-6">
                                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 db-text">
                                        <Film size={20} /> {t("movies_library.genres")}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.map(genre => (
                                            <span key={genre.id} className="db-badge-blue px-4 py-2 rounded-full text-sm font-semibold">
                                                {isEnglish ? genre.name_en : genre.name_ar}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cast & Crew */}
                            <div className="db-border border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Actors */}
                                {movie.actors && movie.actors.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 db-text">
                                            <Users size={20} /> {t("movies_library.starring")}
                                        </h3>
                                        <ul className="space-y-2">
                                            {movie.actors.map(actor => (
                                                <li key={actor.id} className="db-list-item px-4 py-2 rounded-lg db-text">{isEnglish ? actor.name_en : actor.name_ar}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Directors */}
                                {movie.directors && movie.directors.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 db-text">
                                            <Video size={20} /> {t("movies_library.directed_by")}
                                        </h3>
                                        <ul className="space-y-2">
                                            {movie.directors.map(director => (
                                                <li key={director.id} className="db-list-item px-4 py-2 rounded-lg db-text">{isEnglish ? director.name_en : director.name_ar}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Languages & Subtitles */}
                            <div className="db-border border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Audio Languages */}
                                {movie.audio_languages && movie.audio_languages.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 db-text">
                                            <Globe size={20} /> {t("movies_library.languages")}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.audio_languages.map(lang => (
                                                <span key={lang.id} className="db-badge-green px-3 py-1 rounded-full text-sm font-semibold">
                                                    {isEnglish ? lang.name_en : lang.name_ar}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Subtitles */}
                                {movie.subtitles && movie.subtitles.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 db-text">
                                            <Subtitles size={20} /> {t("movies_library.subtitles")}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.subtitles.map(sub => (
                                                <span key={sub.id} className="db-badge-purple px-3 py-1 rounded-full text-sm font-semibold">
                                                    {isEnglish ? sub.name_en : sub.name_ar}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* IMDB Link + Posters + Metadata */}
                            <div className="db-border border-t pt-6 text-xs space-y-1 flex flex-row justify-between items-center db-text-secondary">
                                <div className="db-text-secondary">
                                    <p><strong>{t("movies_library.meta_created")}:</strong> {new Date(movie.created_at).toLocaleString(i18n.language)}</p>
                                    <p><strong>{t("movies_library.meta_updated")}:</strong> {new Date(movie.updated_at).toLocaleString(i18n.language)}</p>
                                    <p><strong>{t("movies_library.meta_id")}:</strong> {movie.id}</p>
                                    {/* Clickable Image Links */}
                                    <div className="flex gap-4 mt-3">
                                        {movie.poster_full_url && (
                                            <button
                                                onClick={() => setPreviewImage({ url: movie.poster_full_url!, title: t("movies_library.poster_main") })}
                                                className="flex items-center gap-1 db-link-blue db-link-blue-hover font-bold text-sm underline decoration-dotted cursor-pointer"
                                            >
                                                <ImageIcon size={14} /> {t("movies_library.view_poster")}
                                            </button>
                                        )}
                                        {movie.featured_full_url && (
                                            <button
                                                onClick={() => setPreviewImage({ url: movie.featured_full_url!, title: t("movies_library.poster_featured") })}
                                                className="flex items-center gap-1 db-link-blue db-link-blue-hover font-bold text-sm underline decoration-dotted cursor-pointer"
                                            >
                                                <ImageIcon size={14} /> {t("movies_library.view_featured")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {movie.imdb_url && (
                                    <div>
                                        <a
                                            href={movie.imdb_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-lg transition"
                                        >
                                            <Star size={20} /> {t("movies_library.view_imdb")}
                                        </a>
                                    </div>
                                )}

                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <EditMovie
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSuccess={() => {
                    setIsEditOpen(false);
                    // Reload the movie details
                    if (movieId) {
                        movieService.getMovieById(movieId)
                            .then(data => setMovie(data))
                            .catch(err => console.error("Failed to reload movie", err));
                    }
                    onMovieDeleted(); // This will refresh the movies list in the parent
                }}
                movie={movie}
            />
        </div>
    );
}