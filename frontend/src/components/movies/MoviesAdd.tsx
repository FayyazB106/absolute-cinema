import { useEffect, useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import MultiSelect from '../shared/MultiSelect';
import { API_BASE_URL } from '../../constants/api';

interface Options {
    genres: any[];
    actors: any[];
    directors: any[];
    languages: any[];
    maturity_ratings: any[];
    statuses: any[];
}

export default function MoviesAdd({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<Options | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name_en: '',
        name_ar: '',
        desc_en: '',
        desc_ar: '',
        release_date: '',
        imdb_url: '',
        duration: '',
        maturity_id: '',
        status_id: '',
        genres: [] as string[],
        actors: [] as string[],
        directors: [] as string[],
        languages: [] as string[],
        subtitles: [] as string[],
        is_featured: false
    });

    useEffect(() => {
        if (isOpen) {
            fetch(`${API_BASE_URL}/movie-options`)
                .then(res => res.json())
                .then(data => setOptions(data))
                .catch(err => console.error("Could not fetch options", err));
        }
    }, [isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = { ...errors };
        const imdbRegex = /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/i;

        if (!formData.name_en.trim()) newErrors.name_en = 'Required';
        if (!formData.name_ar.trim()) newErrors.name_ar = 'Required';
        if (!formData.desc_en.trim()) newErrors.desc_en = 'Required';
        if (!formData.desc_ar.trim()) newErrors.desc_ar = 'Required';
        if (!formData.release_date) newErrors.release_date = 'Required';
        if (!formData.maturity_id) newErrors.maturity_id = 'Required';
        if (!formData.status_id) newErrors.status_id = 'Required';
        if (formData.languages.length === 0) newErrors.languages = 'At least one language is required';
        if (formData.imdb_url && !imdbRegex.test(formData.imdb_url)) { newErrors.imdb_url = 'Invalid IMDb URL'; }
        if (formData.duration !== '') {
            const durationNum = Number(formData.duration);
            if (durationNum < 0) { newErrors.duration = 'Must be a positive number'; }
            else if (!Number.isInteger(durationNum)) { newErrors.duration = 'Decimals are not allowed'; }
        }

        setErrors(newErrors);
        const hasErrors = Object.values(newErrors).some(error => error !== '' && error !== null);
        return !hasErrors;
    };

    const validateImage = (file: File, config: { width?: number, minH?: number, maxH?: number, exactH?: number }): Promise<string | null> => {
        return new Promise((resolve) => {
            // 1. Check File Size (2MB)
            if (file.size > 2048 * 1024) {
                resolve("File is too large (Max 2MB)");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    // Validate Width
                    if (config.width && img.width !== config.width) {
                        resolve(`Width must be exactly ${config.width}px (Current: ${img.width}px)`);
                        return;
                    }
                    // Validate Height range
                    if (config.minH && img.height < config.minH) {
                        resolve(`Height must be at least ${config.minH}px`);
                        return;
                    }
                    if (config.maxH && img.height > config.maxH) {
                        resolve(`Height cannot exceed ${config.maxH}px`);
                        return;
                    }
                    // Validate Exact Height
                    if (config.exactH && img.height !== config.exactH) {
                        resolve(`Height must be exactly ${config.exactH}px`);
                        return;
                    }
                    resolve(null); // No errors
                };
            };
        });
    };

    const handleSubmit = async () => {
        setErrors({});
        if (!validateForm()) {
            modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        };
        try {
            // Create FormData object instead of JSON
            const data = new FormData();

            // Append text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(item => data.append(`${key}[]`, item));
                } else if (typeof value === 'boolean') {
                    // Convert true/false to 1/0 for the backend
                    data.append(key, value ? '1' : '0');
                } else if (key === 'duration' && (value === '' || value === null)) {
                    // If duration is an empty string, send '0' to the backend
                    data.append(key, '0');
                } else {
                    data.append(key, value.toString());
                }
            });

            // Append the physical files
            if (posterFile) data.append('poster_url', posterFile);
            if (featuredFile) data.append('featured_poster_url', featuredFile);

            const response = await fetch(`${API_BASE_URL}/movies`, {
                method: 'POST',
                // NOTE: Do NOT set Content-Type header manually when sending FormData
                // The browser will automatically set it to 'multipart/form-data' with the correct boundary
                body: data
            });

            if (response.ok) {
                alert("Movie Created Successfully!");
                // Reset files
                setPosterFile(null);
                setFeaturedFile(null);
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();

                // Handle backend validation errors
                if (errorData.errors) {
                    const backendErrors: Record<string, string> = {};
                    Object.keys(errorData.errors).forEach(key => {
                        backendErrors[key] = errorData.errors[key][0]; // Get first error message
                    });
                    setErrors(backendErrors);
                    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }

                alert("Validation Error: Please check the form for errors");
            }
        } catch (err: any) {
            console.error("Submission Error:", err);
            alert("Error creating movie");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="sticky top-0 bg-white border-b px-8 py-4 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-extrabold">Add New Movie</h1>
                    <button onClick={onClose} className="hover:bg-gray-200 rounded-full p-2">
                        <X size={24} />
                    </button>
                </div>

                {!options ? (
                    <div className="p-10 text-center">Loading...</div>
                ) : (
                    <div className="p-8">
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col">
                                        <input
                                            type="text"
                                            placeholder="Movie Name (EN) *"
                                            className={`border rounded p-3 ${errors.name_en ? 'border-red-500' : ''}`}
                                            value={formData.name_en}
                                            onChange={e => {
                                                setFormData({ ...formData, name_en: e.target.value });
                                                if (errors.name_en) setErrors({ ...errors, name_en: '' });
                                            }}
                                            required
                                        />
                                        {errors.name_en && <span className="text-red-500 text-sm mt-1">{errors.name_en}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <input
                                            type="text"
                                            placeholder="اسم الفيلم (AR) *"
                                            className={`border rounded p-3 text-right ${errors.name_ar ? 'border-red-500' : ''}`}
                                            value={formData.name_ar}
                                            onChange={e => {
                                                setFormData({ ...formData, name_ar: e.target.value });
                                                if (errors.name_ar) setErrors({ ...errors, name_ar: '' });
                                            }}
                                            dir="rtl"
                                            required
                                        />
                                        {errors.name_ar && <span className="text-red-500 text-sm mt-1">{errors.name_ar}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <textarea
                                            placeholder="Description (EN) *"
                                            className={`border rounded p-3 h-24 ${errors.desc_en ? 'border-red-500' : ''}`}
                                            value={formData.desc_en}
                                            onChange={e => {
                                                setFormData({ ...formData, desc_en: e.target.value });
                                                if (errors.desc_en) setErrors({ ...errors, desc_en: '' });
                                            }}
                                            required
                                        />
                                        {errors.desc_en && <span className="text-red-500 text-sm mt-1">{errors.desc_en}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <textarea
                                            placeholder="الوصف (AR) *"
                                            className={`border rounded p-3 h-24 ${errors.desc_ar ? 'border-red-500' : ''}`}
                                            value={formData.desc_ar}
                                            onChange={e => {
                                                setFormData({ ...formData, desc_ar: e.target.value });
                                                if (errors.desc_ar) setErrors({ ...errors, desc_ar: '' });
                                            }}
                                            dir="rtl"
                                            required
                                        />
                                        {errors.desc_ar && <span className="text-red-500 text-sm mt-1">{errors.desc_ar}</span>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Metadata & Links</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Release Date *</label>
                                        <input
                                            type="date"
                                            className={`border rounded p-2 ${errors.release_date ? 'border-red-500' : ''}`}
                                            value={formData.release_date}
                                            onChange={e => {
                                                setFormData({ ...formData, release_date: e.target.value });
                                                if (errors.release_date) setErrors({ ...errors, release_date: '' });
                                            }}
                                            required
                                        />
                                        {errors.release_date && <span className="text-red-500 text-sm mt-1">{errors.release_date}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">IMDB URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://imdb.com/..."
                                            className={`border rounded p-2 ${errors.imdb_url ? 'border-red-500' : ''}`}
                                            value={formData.imdb_url}
                                            onChange={e => setFormData({ ...formData, imdb_url: e.target.value })}
                                        />
                                        {errors.imdb_url && <span className="text-red-500 text-xs mt-1">{errors.imdb_url}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            onKeyDown={(e) => { if (['-', '.', ',', 'e', 'E'].includes(e.key)) { e.preventDefault(); } }} // Block minus sign, decimal point, and 'e'
                                            placeholder="120"
                                            className={`border rounded p-2 ${errors.duration ? 'border-red-500' : ''}`}
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        />
                                        {errors.duration && <span className="text-red-500 text-sm mt-1">{errors.duration}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Maturity Rating *</label>
                                        <select
                                            className={`border rounded p-2 hover:bg-gray-50 ${errors.maturity_id ? 'border-red-500' : ''}`}
                                            value={formData.maturity_id}
                                            onChange={e => {
                                                setFormData({ ...formData, maturity_id: e.target.value });
                                                if (errors.maturity_id) setErrors({ ...errors, maturity_id: '' });
                                            }}
                                            required
                                        >
                                            <option value="">Select...</option>
                                            {options.maturity_ratings.map(m => <option key={m.id} value={m.id}>{m.maturity_rating}</option>)}
                                        </select>
                                        {errors.maturity_id && <span className="text-red-500 text-sm mt-1">{errors.maturity_id}</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Status *</label>
                                        <select
                                            className={`border rounded p-2 hover:bg-gray-50 ${errors.status_id ? 'border-red-500' : ''}`}
                                            value={formData.status_id}
                                            onChange={e => {
                                                setFormData({ ...formData, status_id: e.target.value });
                                                if (errors.status_id) setErrors({ ...errors, status_id: '' });
                                            }}
                                            required
                                        >
                                            <option value="">Select...</option>
                                            {options.statuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
                                        </select>
                                        {errors.status_id && <span className="text-red-500 text-sm mt-1">{errors.status_id}</span>}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Cast, Crew & Genres</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <MultiSelect
                                        label="Genres"
                                        options={options.genres}
                                        selected={formData.genres}
                                        onChange={(selected) => setFormData({ ...formData, genres: selected })}
                                        placeholder="Select..."
                                    />
                                    <MultiSelect
                                        label="Actors"
                                        options={options.actors}
                                        selected={formData.actors}
                                        onChange={(selected) => setFormData({ ...formData, actors: selected })}
                                        placeholder="Select..."
                                    />
                                    <MultiSelect
                                        label="Directed By"
                                        options={options.directors}
                                        selected={formData.directors}
                                        onChange={(selected) => setFormData({ ...formData, directors: selected })}
                                        placeholder="Select..."
                                    />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Languages</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col">
                                        <MultiSelect
                                            label="Audio Languages *"
                                            options={options.languages}
                                            selected={formData.languages}
                                            onChange={(selected) => {
                                                setFormData({ ...formData, languages: selected });
                                                if (errors.languages) setErrors({ ...errors, languages: '' });
                                            }}
                                            placeholder="Select..."
                                            error={errors.languages}
                                        />
                                        {errors.languages && <span className="text-red-500 text-sm mt-1">{errors.languages}</span>}
                                    </div>
                                    <MultiSelect
                                        label="Subtitles Available"
                                        options={options.languages}
                                        selected={formData.subtitles}
                                        onChange={(selected) => setFormData({ ...formData, subtitles: selected })}
                                        placeholder="Select..."
                                    />
                                </div>
                            </section>

                            <section className="space-y-4 border-t pt-6">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Media Assets</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Main Poster Upload */}
                                    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl hover:bg-gray-50">
                                        <label className="cursor-pointer text-center w-full">
                                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                            <span className="block font-bold">Main Poster</span>
                                            <span className="block text-xs text-gray-500">JPG, JPEG, PNG (Max 2MB)</span>
                                            <span className="text-xs text-gray-500">Must be 1000 x 1500</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/jpeg,image/png,image/jpg"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    if (file) {
                                                        const error = await validateImage(file, { width: 1000, minH: 1400, maxH: 1600 });
                                                        if (error) {
                                                            setErrors(prev => ({ ...prev, poster_url: error }));
                                                            setPosterFile(null);
                                                        } else {
                                                            setPosterFile(file);
                                                            setErrors(prev => ({ ...prev, poster_url: '' }));
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                        {errors.poster_url && <span className="text-red-500 text-xs mt-2">{errors.poster_url}</span>}
                                        {posterFile && <p className="mt-2 text-sm text-green-600 font-medium truncate max-w-[200px]">{posterFile.name}</p>}
                                    </div>

                                    {/* Featured Poster Upload */}
                                    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl hover:bg-gray-50">
                                        <label className="cursor-pointer text-center w-full">
                                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                            <span className="block font-bold">Featured Banner</span>
                                            <span className="block text-xs text-gray-500">JPG, JPEG, PNG (Max 2MB)</span>
                                            <span className="text-xs text-gray-500">Must be 1920 x 1080</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/jpeg,image/png,image/jpg"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    if (file) {
                                                        const error = await validateImage(file, { width: 1920, exactH: 1080 });
                                                        if (error) {
                                                            setErrors(prev => ({ ...prev, featured_poster_url: error }));
                                                            setFeaturedFile(null);
                                                        } else {
                                                            setFeaturedFile(file);
                                                            setErrors(prev => ({ ...prev, featured_poster_url: '' }));
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                        {errors.featured_poster_url && <span className="text-red-500 text-xs mt-2">{errors.featured_poster_url}</span>}
                                        {featuredFile && <p className="mt-2 text-sm text-green-600 font-medium truncate max-w-[200px]">{featuredFile.name}</p>}
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-row justify-between gap-4">
                                <div className='flex flex-row gap-2 items-center'>
                                    <label className="text-lg font-bold">Featured</label>
                                    <button
                                        type="button"
                                        onClick={() => { if (featuredFile || formData.is_featured) { setFormData({ ...formData, is_featured: !formData.is_featured }); } }}
                                        disabled={!featuredFile && !formData.is_featured}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_featured ? 'bg-blue-600' : 'bg-gray-300'} ${!featuredFile && !formData.is_featured ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    {!featuredFile && !formData.is_featured && (
                                        <span className="text-xs text-gray-500 ml-2">Upload featured banner first</span>
                                    )}
                                </div>
                                <button onClick={handleSubmit} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 max-w-50">
                                    Add Movie
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}