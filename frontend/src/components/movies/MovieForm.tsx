import { useRef } from 'react';
import { Upload } from 'lucide-react';
import MultiSelect from '../shared/MultiSelect';
import type { MovieFormProps } from '../../types/movieForm';
import { validateImage } from '../../utils/validation';

export default function MovieForm({
    formData,
    setFormData,
    errors,
    setErrors,
    options,
    posterFile,
    setPosterFile,
    featuredFile,
    setFeaturedFile,
    existingFeaturedPoster,
    onSubmit,
    submitLabel = "Submit",
    isSubmitting = false
}: MovieFormProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const subTitleStyle = "text-xl font-bold text-blue-700 text-center"
    const labelStyle = "font-bold text-md"
    const errorStyle = "text-red-500 mt-1"
    const fileStyle = "mt-2 text-sm text-green-600 font-medium truncate max-w-[200px]"

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let { name, value } = e.target;
        if (name === 'duration') {
            value = value.replace(/\D/g, '');
        }

        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    return (
        <div ref={modalRef} className="space-y-8">
            <section className="space-y-4">
                <h2 className={subTitleStyle}>Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelStyle}>Name *</label>
                        <input
                            name="name_en"
                            type="text"
                            placeholder="Name"
                            className={`border rounded p-3 ${errors.name_en ? 'border-red-500' : ''}`}
                            value={formData.name_en}
                            onChange={handleChange}
                            required
                        />
                        {errors.name_en && <span className={errorStyle}>{errors.name_en}</span>}
                    </div>
                    <div dir="rtl" className="flex flex-col">
                        <label className={labelStyle}>الاسم *</label>
                        <input
                            name="name_ar"
                            type="text"
                            placeholder="الاسم"
                            className={`border rounded p-3 text-right ${errors.name_ar ? 'border-red-500' : ''}`}
                            value={formData.name_ar}
                            onChange={handleChange}
                            required
                        />
                        {errors.name_ar && <span className={errorStyle}>{errors.name_ar}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>Description *</label>
                        <textarea
                            name="desc_en"
                            placeholder="Description"
                            className={`border rounded p-3 h-24 ${errors.desc_en ? 'border-red-500' : ''}`}
                            value={formData.desc_en}
                            onChange={handleChange}
                            required
                        />
                        {errors.desc_en && <span className={errorStyle}>{errors.desc_en}</span>}
                    </div>
                    <div dir="rtl" className="flex flex-col">
                        <label className={labelStyle}>الوصف *</label>
                        <textarea
                            name="desc_ar"
                            placeholder="الوصف"
                            className={`border rounded p-3 h-24 ${errors.desc_ar ? 'border-red-500' : ''}`}
                            value={formData.desc_ar}
                            onChange={handleChange}
                            required
                        />
                        {errors.desc_ar && <span className={errorStyle}>{errors.desc_ar}</span>}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className={subTitleStyle}>Metadata</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="flex flex-col">
                        <label className={labelStyle}>Release Date *</label>
                        <input
                            name="release_date"
                            type="date"
                            className={`border rounded p-2 ${errors.release_date ? 'border-red-500' : ''}`}
                            value={formData.release_date}
                            onChange={handleChange}
                            required
                        />
                        {errors.release_date && <span className={errorStyle}>{errors.release_date}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>IMDB URL</label>
                        <input
                            name="imdb_url"
                            type="url"
                            placeholder="https://imdb.com/title/tt..."
                            className={`border rounded p-2 ${errors.imdb_url ? 'border-red-500' : ''}`}
                            value={formData.imdb_url}
                            onChange={handleChange}
                        />
                        {errors.imdb_url && <span className={errorStyle}>{errors.imdb_url}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>Duration (minutes)</label>
                        <input
                            name="duration"
                            type="number"
                            min="0"
                            step="1"
                            onKeyDown={(e) => { if (['-', '.', ',', 'e', 'E'].includes(e.key)) { e.preventDefault(); } }}
                            placeholder="120"
                            className={`border rounded p-2 ${errors.duration ? 'border-red-500' : ''}`}
                            value={formData.duration}
                            onChange={handleChange}
                        />
                        {errors.duration && <span className={errorStyle}>{errors.duration}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>Maturity Rating *</label>
                        <select
                            name="maturity_id"
                            className={`border rounded p-2 hover:bg-gray-50 ${errors.maturity_id ? 'border-red-500' : ''}`}
                            value={formData.maturity_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select...</option>
                            {options.maturity_ratings.sort((a, b) => a.ranking - b.ranking).map(m =>
                                <option key={m.id} value={m.id}>{m.maturity_rating}</option>
                            )}
                        </select>
                        {errors.maturity_id && <span className={errorStyle}>{errors.maturity_id}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>Status *</label>
                        <select
                            name="status_id"
                            className={`border rounded p-2 hover:bg-gray-50 ${errors.status_id ? 'border-red-500' : ''}`}
                            value={formData.status_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select...</option>
                            {options.statuses.sort((a, b) => a.name_en.localeCompare(b.name_en)).map(s =>
                                <option key={s.id} value={s.id}>{s.name_en}</option>
                            )}
                        </select>
                        {errors.status_id && <span className={errorStyle}>{errors.status_id}</span>}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className={subTitleStyle}>Cast, Crew & Genres</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MultiSelect
                        label="Starring"
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
                    <MultiSelect
                        label="Genres"
                        options={options.genres}
                        selected={formData.genres}
                        onChange={(selected) => setFormData({ ...formData, genres: selected })}
                        placeholder="Select..."
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className={subTitleStyle}>Languages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <MultiSelect
                            label="Languages *"
                            options={options.languages}
                            selected={formData.languages}
                            onChange={(selected) => {
                                setFormData({ ...formData, languages: selected });
                                if (errors.languages) setErrors({ ...errors, languages: '' });
                            }}
                            placeholder="Select..."
                            error={errors.languages}
                        />
                        {errors.languages && <span className={errorStyle}>{errors.languages}</span>}
                    </div>
                    <MultiSelect
                        label="Subtitles"
                        options={options.languages}
                        selected={formData.subtitles}
                        onChange={(selected) => setFormData({ ...formData, subtitles: selected })}
                        placeholder="Select..."
                    />
                </div>
            </section>

            <section className="space-y-4 border-t pt-6">
                <h2 className={subTitleStyle}>Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Poster Upload */}
                    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl hover:bg-gray-50">
                        <label className="cursor-pointer text-center w-full flex flex-col gap-1">
                            <Upload className="mx-auto text-gray-400" size={32} />
                            <p className="font-bold">Main Poster</p>
                            <p className="text-xs text-gray-500">JPG, JPEG, PNG (Max 2MB)</p>
                            <p className="text-xs text-gray-500">Must be 1000 x 1500</p>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        const error = await validateImage(file, { width: 1000, minH: 1400, maxH: 1600 });
                                        if (error) {
                                            setErrors({ ...errors, poster_url: error });
                                            setPosterFile(null);
                                        } else {
                                            setPosterFile(file);
                                            setErrors({ ...errors, poster_url: '' });
                                        }
                                    }
                                }}
                            />
                        </label>
                        {errors.poster_url && <span className={errorStyle}>{errors.poster_url}</span>}
                        {posterFile && <p className={fileStyle}>{posterFile.name}</p>}
                    </div>

                    {/* Featured Poster Upload */}
                    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl hover:bg-gray-50">
                        <label className="cursor-pointer text-center w-full flex flex-col gap-1">
                            <Upload className="mx-auto text-gray-400" size={32} />
                            <p className="font-bold">Featured Banner</p>
                            <p className="text-xs text-gray-500">JPG, JPEG, PNG (Max 2MB)</p>
                            <p className="text-xs text-gray-500">Must be 1920 x 1080</p>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        const error = await validateImage(file, { width: 1920, exactH: 1080 });
                                        if (error) {
                                            setErrors({ ...errors, featured_poster_url: error });
                                            setFeaturedFile(null);
                                        } else {
                                            setFeaturedFile(file);
                                            setErrors({ ...errors, featured_poster_url: '' });
                                        }
                                    }
                                }}
                            />
                        </label>
                        {errors.featured_poster_url && <span className={errorStyle}>{errors.featured_poster_url}</span>}
                        {featuredFile && <p className={fileStyle}>{featuredFile.name}</p>}
                    </div>
                </div>
            </section>

            <div className="flex flex-row justify-between gap-4">
                <div className='flex flex-row gap-2 items-center'>
                    <label className="text-lg font-bold">Featured</label>
                    <button
                        type="button"
                        onClick={() => {
                            const hasFeaturedPoster = existingFeaturedPoster || featuredFile;
                            if (hasFeaturedPoster || formData.is_featured) {
                                setFormData({ ...formData, is_featured: !formData.is_featured });
                            }
                        }}
                        disabled={!existingFeaturedPoster && !featuredFile && !formData.is_featured}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_featured ? 'bg-blue-600' : 'bg-gray-300'} ${!existingFeaturedPoster && !featuredFile && !formData.is_featured ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    {!existingFeaturedPoster && !featuredFile && !formData.is_featured && (
                        <span className="text-xs text-gray-500 ml-2">Upload featured banner first</span>
                    )}
                </div>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 flex justify-center items-center bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 max-w-35 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                        submitLabel
                    )}
                </button>
            </div>
        </div>
    );
}