import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import MovieForm from './MovieForm';
import type { Options } from '../../types/movie';
import { INITIAL_MOVIE_FORM_STATE, type MovieFormData } from '../../types/movieForm';
import { movieService } from '../../services/movieService';
import { validateMovie } from '../../utils/validation';
import { toast } from '../shared/Toast';
import { useTranslation } from 'react-i18next';
import { showMovieSuccess } from '../shared/SweetAlert';

interface AddMovieProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMovie({ isOpen, onClose, onSuccess }: AddMovieProps) {
    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<Options | null>(null);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<MovieFormData>(INITIAL_MOVIE_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            movieService.getOptions()
                .then(data => setOptions(data))
                .catch(err => console.error("Error fetching options", err))
                .finally(() => setIsOptionsLoading(false));
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        const validationErrors = validateMovie(formData);
        const translatedErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach((key) => { translatedErrors[key] = t(validationErrors[key]); });
        setErrors(translatedErrors);
        
        if (Object.keys(validationErrors).length > 0) {
            modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t("movie_form.adding"));
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

            const response = await movieService.createMovie(data);

            if (response.ok) {
                toast.dismiss(toastId);
                showMovieSuccess();
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
                toast.error(t("movie_form.validation_error"), { id: toastId });
            }
        } catch (err) {
            console.error("Submission Error:", err);
            toast.error(t("movie_form.add_error"), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <div ref={modalRef} className="db-movieBG rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="sticky top-0 db-movieBG border-b db-border px-8 py-4 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-extrabold db-text">{t("movie_form.add_movie")}</h1>
                    <button onClick={onClose} className="db-btn-close db-text">
                        <X size={24} />
                    </button>
                </div>

                {isOptionsLoading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 db-spinner-border mb-4" />
                    </div>
                ) : !options ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 db-spinner-border mb-4" />
                    </div>
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
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}