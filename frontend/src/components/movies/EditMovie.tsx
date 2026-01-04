import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import MovieForm from './MovieForm';
import type { Options } from '../../types/movie';
import { INITIAL_MOVIE_FORM_STATE, type MovieFormData } from '../../types/movieForm';
import { movieService } from '../../services/movieService';
import { validateMovie } from '../../utils/validation';

interface EditMovieProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    movie: any;
}

export default function EditMovie({ isOpen, onClose, onSuccess, movie }: EditMovieProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<Options | null>(null);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<MovieFormData>(INITIAL_MOVIE_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && movie) {
            movieService.getOptions()
                .then(data => setOptions(data))
                .catch(err => console.error("Error fetching options", err))
                .finally(() => setIsOptionsLoading(false));

            // Populate form with existing movie data
            setFormData({
                name_en: movie.name_en || '',
                name_ar: movie.name_ar || '',
                desc_en: movie.desc_en || '',
                desc_ar: movie.desc_ar || '',
                release_date: movie.release_date || '',
                duration: movie.duration || '',
                maturity_id: movie.maturity_id?.toString() || '',
                status_id: movie.status_id?.toString() || '',
                imdb_url: movie.imdb_url || '',
                genres: movie.genres?.map((g: any) => g.id.toString()) || [],
                actors: movie.actors?.map((a: any) => a.id.toString()) || [],
                directors: movie.directors?.map((d: any) => d.id.toString()) || [],
                languages: movie.audio_languages?.map((l: any) => l.id.toString()) || [],
                subtitles: movie.subtitles?.map((s: any) => s.id.toString()) || [],
                is_featured: movie.is_featured === 1 || movie.is_featured === true,
            });
        }
    }, [isOpen, movie]);

    const handleSubmit = async () => {
        const validationErrors = validateMovie(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(item => data.append(`${key}[]`, item));
                } else if (typeof value === 'boolean') {
                    data.append(key, value ? '1' : '0');
                } else if (key === 'duration' && (value === '' || value === null)) {
                    data.append(key, '0');
                } else {
                    data.append(key, value.toString());
                }
            });

            if (posterFile) data.append('poster_url', posterFile);
            if (featuredFile) data.append('featured_poster_url', featuredFile);

            const response = await movieService.updateMovie(movie.id, data);

            if (response.ok) {
                setPosterFile(null);
                setFeaturedFile(null);
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    const backendErrors: Record<string, string> = {};
                    Object.keys(errorData.errors).forEach(key => {
                        backendErrors[key] = errorData.errors[key][0];
                    });
                    setErrors(backendErrors);
                    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }
                alert("Validation Error: Please check the form for errors");
            }
        } catch (err) {
            console.error("Update Error:", err);
            alert("Error updating movie");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !movie) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="sticky top-0 bg-white border-b px-8 py-4 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-extrabold">Edit Movie</h1>
                    <button onClick={onClose} className="hover:bg-gray-200 rounded-full p-2">
                        <X size={24} />
                    </button>
                </div>

                {isOptionsLoading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4" />
                        <p className="text-gray-500 font-medium">Loading...</p>
                    </div>
                ) : !options ? (
                    <div className="p-10 text-center">Loading...</div>
                ) : (
                    <div className="p-8">
                        <MovieForm
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                            setErrors={setErrors}
                            options={options}
                            posterFile={posterFile}
                            setPosterFile={setPosterFile}
                            featuredFile={featuredFile}
                            setFeaturedFile={setFeaturedFile}
                            existingFeaturedPoster={movie.featured_poster_url}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}