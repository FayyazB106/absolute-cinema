import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
    const [options, setOptions] = useState<Options | null>(null);
    const [formData, setFormData] = useState({
        name_en: '', name_ar: '',
        desc_en: '', desc_ar: '',
        release_date: '',
        imdb_url: '',
        duration: 0,
        maturity_id: '',
        status_id: '',
        genres: [] as string[],
        actors: [] as string[],
        directors: [] as string[],
        languages: [] as string[],
        subtitles: [] as string[]
    });

    useEffect(() => {
        if (isOpen) {
            fetch(`${API_BASE_URL}/movie-options`)
                .then(res => res.json())
                .then(data => setOptions(data))
                .catch(err => console.error("Could not fetch options", err));
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Movie Created Successfully!");
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    name_en: '', name_ar: '', desc_en: '', desc_ar: '',
                    release_date: '', imdb_url: '', duration: 0,
                    maturity_id: '', status_id: '',
                    genres: [], actors: [], directors: [], languages: [], subtitles: []
                });
            }
        } catch (err: any) {
            console.error("Validation Error:", err);
            alert("Error creating movie");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
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
                                    <input type="text" placeholder="Movie Name (EN)" className="border rounded p-3"
                                        value={formData.name_en}
                                        onChange={e => setFormData({ ...formData, name_en: e.target.value })} required />
                                    <input type="text" placeholder="اسم الفيلم (AR)" className="border rounded p-3 text-right" dir="rtl"
                                        value={formData.name_ar}
                                        onChange={e => setFormData({ ...formData, name_ar: e.target.value })} required />
                                    <textarea placeholder="Description (EN)" className="border rounded p-3 h-24"
                                        value={formData.desc_en}
                                        onChange={e => setFormData({ ...formData, desc_en: e.target.value })} required />
                                    <textarea placeholder="الوصف (AR)" className="border rounded p-3 h-24 text-right" dir="rtl"
                                        value={formData.desc_ar}
                                        onChange={e => setFormData({ ...formData, desc_ar: e.target.value })} required />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-blue-700 text-center">Metadata & Links</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Release Date</label>
                                        <input type="date" className="border rounded p-2"
                                            value={formData.release_date}
                                            onChange={e => setFormData({ ...formData, release_date: e.target.value })} required />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">IMDB URL</label>
                                        <input type="url" placeholder="https://imdb.com/..." className="border rounded p-2"
                                            value={formData.imdb_url}
                                            onChange={e => setFormData({ ...formData, imdb_url: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Duration</label>
                                        <input type="number" placeholder="120" className="border rounded p-2"
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Maturity</label>
                                        <select className="border rounded p-2" value={formData.maturity_id} onChange={e => setFormData({ ...formData, maturity_id: e.target.value })} required>
                                            <option value="">Select...</option>
                                            {options.maturity_ratings.map(m => <option key={m.id} value={m.id}>{m.maturity_rating}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold">Status</label>
                                        <select className="border rounded p-2" value={formData.status_id} onChange={e => setFormData({ ...formData, status_id: e.target.value })} required>
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

                            <div className="flex gap-4">
                                <button onClick={onClose} className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-xl hover:bg-gray-600">
                                    Cancel
                                </button>
                                <button onClick={handleSubmit} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">
                                    Save Movie
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}