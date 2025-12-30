import { useEffect, useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
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

interface MoviesEditProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    movie: any;
}

export default function MoviesEdit({ isOpen, onClose, onSuccess, movie }: MoviesEditProps) {
    const [options, setOptions] = useState<Options | null>(null);
    const [saving, setSaving] = useState(false);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name_en: '', name_ar: '', desc_en: '', desc_ar: '',
        release_date: '', duration: 0, maturity_id: '', status_id: '', imdb_url: '',
        genres: [] as string[], actors: [] as string[], directors: [] as string[],
        languages: [] as string[], subtitles: [] as string[], is_featured: false
    });

    useEffect(() => {
        if (isOpen && movie) {
            fetch(`${API_BASE_URL}/movie-options`)
                .then(res => res.json())
                .then(data => setOptions(data))
                .catch(err => console.error("Error fetching options", err));

            setFormData({
                name_en: movie.name_en || '',
                name_ar: movie.name_ar || '',
                desc_en: movie.desc_en || '',
                desc_ar: movie.desc_ar || '',
                release_date: movie.release_date || '',
                duration: movie.duration || 0,
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];
                if (Array.isArray(value)) {
                    value.forEach(item => data.append(`${key}[]`, item));
                } else if (key === 'is_featured') {
                    // Ensure it is sent as '1' or '0' (Strings in FormData)
                    data.append('is_featured', formData.is_featured ? '1' : '0');
                } else {
                    data.append(key, value);
                }
            });

            if (posterFile) data.append('poster', posterFile);
            if (featuredFile) data.append('featured', featuredFile);

            data.append('_method', 'PUT');

            const res = await fetch(`${API_BASE_URL}/movies/${movie.id}`, {
                method: 'POST',
                body: data,
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                console.error("Server validation error:", errorData);
            }
        } catch (err) {
            console.error("Update failed", err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !movie) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 overflow-y-auto no-scrollbar">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="sticky top-0 bg-white border-b px-8 py-4 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-extrabold">Edit Movie</h1>
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
                                    <input name="name_en" placeholder="Movie Name (EN)" className="border rounded p-3"
                                        value={formData.name_en} onChange={handleChange} required />
                                    <input name="name_ar" placeholder="اسم الفيلم (AR)" className="border rounded p-3 text-right"
                                        value={formData.name_ar} onChange={handleChange} dir="rtl" required />
                                    <textarea name="desc_en" placeholder="Description (EN)" className="border rounded p-3 h-24"
                                        value={formData.desc_en} onChange={handleChange} required />
                                    <textarea name="desc_ar" placeholder="الوصف (AR)" className="border rounded p-3 h-24 text-right"
                                        value={formData.desc_ar} onChange={handleChange} dir="rtl" required />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Metadata & Links</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Release Date</label>
                                        <input type="date" name="release_date" className="border rounded p-2"
                                            value={formData.release_date} onChange={handleChange} required />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">IMDB URL</label>
                                        <input type="url" name="imdb_url" placeholder="https://imdb.com/..." className="border rounded p-2"
                                            value={formData.imdb_url} onChange={handleChange} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Duration</label>
                                        <input type="number" name="duration" placeholder="120" className="border rounded p-2"
                                            value={formData.duration} onChange={handleChange} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Maturity</label>
                                        <select name="maturity_id" className="border rounded p-2" value={formData.maturity_id} onChange={handleChange} required>
                                            <option value="">Select...</option>
                                            {options.maturity_ratings.map(m => <option key={m.id} value={m.id}>{m.maturity_rating}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Status</label>
                                        <select name="status_id" className="border rounded p-2" value={formData.status_id} onChange={handleChange} required>
                                            <option value="">Select...</option>
                                            {options.statuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
                                        </select>
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
                                        placeholder="Select genres..."
                                    />
                                    <MultiSelect
                                        label="Actors"
                                        options={options.actors}
                                        selected={formData.actors}
                                        onChange={(selected) => setFormData({ ...formData, actors: selected })}
                                        placeholder="Select actors..."
                                    />
                                    <MultiSelect
                                        label="Directed By"
                                        options={options.directors}
                                        selected={formData.directors}
                                        onChange={(selected) => setFormData({ ...formData, directors: selected })}
                                        placeholder="Select directors..."
                                    />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Languages</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <MultiSelect
                                        label="Audio Languages"
                                        options={options.languages}
                                        selected={formData.languages}
                                        onChange={(selected) => setFormData({ ...formData, languages: selected })}
                                        placeholder="Select audio languages..."
                                    />
                                    <MultiSelect
                                        label="Subtitles Available"
                                        options={options.languages}
                                        selected={formData.subtitles}
                                        onChange={(selected) => setFormData({ ...formData, subtitles: selected })}
                                        placeholder="Select subtitle languages..."
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
                                            <span className="text-xs text-gray-500">JPG, PNG (Max 2MB)</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={e => setPosterFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        {posterFile && <p className="mt-2 text-sm text-green-600 font-medium">{posterFile.name}</p>}
                                    </div>

                                    {/* Featured Poster Upload */}
                                    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl hover:bg-gray-50">
                                        <label className="cursor-pointer text-center w-full">
                                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                            <span className="block font-bold">Featured Banner</span>
                                            <span className="text-xs text-gray-500">Wide format recommended</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={e => setFeaturedFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        {featuredFile && <p className="mt-2 text-sm text-green-600 font-medium">{featuredFile.name}</p>}
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-row justify-between gap-4">
                                <div className='flex flex-row gap-2 items-center'>
                                    <label className="text-lg font-bold">Featured</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const hasFeaturedPoster = movie.featured_poster_url || featuredFile;
                                            if (hasFeaturedPoster || formData.is_featured) {
                                                setFormData({ ...formData, is_featured: !formData.is_featured });
                                            }
                                        }}
                                        disabled={!movie.featured_poster_url && !featuredFile && !formData.is_featured}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_featured ? 'bg-blue-600' : 'bg-gray-300'} ${!movie.featured_poster_url && !featuredFile && !formData.is_featured ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    {!movie.featured_poster_url && !featuredFile && !formData.is_featured && (
                                        <span className="text-xs text-gray-500 ml-2">Upload featured banner first</span>
                                    )}
                                </div>
                                <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 max-w-50">
                                    {saving ? <Loader2 className="animate-spin" /> : "Update Movie"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}