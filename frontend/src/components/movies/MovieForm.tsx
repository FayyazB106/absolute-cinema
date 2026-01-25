import { useRef } from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import MultiSelect from '../shared/MultiSelect';
import type { MovieFormProps } from '../../types/movieForm';
import { validateImage } from '../../utils/validation';
import Asterisk from '../shared/Asterisk';
import { useTranslation } from 'react-i18next';

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
    submitLabel = "submit",
    isSubmitting = false
}: MovieFormProps) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
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
                <h2 className={subTitleStyle}>{t("movie_form.basic_info")}</h2>
                <div dir="ltr" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelStyle}>Name <Asterisk /></label>
                        <input
                            name="name_en"
                            type="text"
                            placeholder="Name"
                            className={`border rounded p-3 text-left ${errors.name_en ? 'border-red-500' : ''}`}
                            value={formData.name_en}
                            onChange={handleChange}
                            required
                        />
                        {errors.name_en && <span className={errorStyle}>{errors.name_en}</span>}
                    </div>
                    <div dir="rtl" className="flex flex-col">
                        <label className={labelStyle}>الاسم <Asterisk /></label>
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
                        <label className={labelStyle}>Description <Asterisk /></label>
                        <textarea
                            name="desc_en"
                            placeholder="Description"
                            className={`border rounded p-3 h-24 text-left ${errors.desc_en ? 'border-red-500' : ''}`}
                            value={formData.desc_en}
                            onChange={handleChange}
                            required
                        />
                        {errors.desc_en && <span className={errorStyle}>{errors.desc_en}</span>}
                    </div>
                    <div dir="rtl" className="flex flex-col">
                        <label className={labelStyle}>الوصف <Asterisk /></label>
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
                <h2 className={subTitleStyle}>{t("movie_form.metadata")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="flex flex-col">
                        <label className={labelStyle}>{t("movie_form.release_date")} <Asterisk /></label>
                        <input
                            name="release_date"
                            type="date"
                            className={`border rounded p-2 h-[51px] ${errors.release_date ? 'border-red-500' : ''}`}
                            value={formData.release_date}
                            onChange={handleChange}
                            required
                        />
                        {errors.release_date && <span className={errorStyle}>{errors.release_date}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>{t("movie_form.imdb")}</label>
                        <input
                            name="imdb_url"
                            type="url"
                            placeholder="https://imdb.com/title/tt..."
                            className={`border rounded p-2 h-[51px] ${errors.imdb_url ? 'border-red-500' : ''}`}
                            value={formData.imdb_url}
                            onChange={handleChange}
                        />
                        {errors.imdb_url && <span className={errorStyle}>{errors.imdb_url}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>{t("movie_form.duration")}</label>
                        <input
                            name="duration"
                            type="number"
                            min="0"
                            step="1"
                            onKeyDown={(e) => { if (['-', '.', ',', 'e', 'E'].includes(e.key)) { e.preventDefault(); } }}
                            placeholder="120"
                            className={`border rounded p-2 h-[51px] ${errors.duration ? 'border-red-500' : ''}`}
                            value={formData.duration}
                            onChange={handleChange}
                        />
                        {errors.duration && <span className={errorStyle}>{errors.duration}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>{t("movie_form.maturity_rating")} <Asterisk /></label>
                        <div className="relative flex items-center h-full">
                            <select
                                name="maturity_id"
                                className={`border rounded p-2 hover:bg-gray-50 appearance-none outline-none w-full h-full ${errors.maturity_id ? 'border-red-500' : ''}`}
                                value={formData.maturity_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("movie_form.select_placeholder")}</option>
                                {options.maturity_ratings.sort((a, b) => a.ranking - b.ranking).map(m =>
                                    <option key={m.id} value={m.id}>{m.maturity_rating}</option>
                                )}
                            </select>
                            <div className={`absolute ${isEnglish ? "right-2" : "left-2"} pointer-events-none`}>
                                <ChevronDown size={18} />
                            </div>
                        </div>
                        {errors.maturity_id && <span className={errorStyle}>{errors.maturity_id}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelStyle}>{t("movie_form.status")} <Asterisk /></label>
                        <div className="relative flex items-center h-full">
                            <select
                                name="status_id"
                                className={`border rounded p-2 hover:bg-gray-50 appearance-none outline-none w-full h-full ${errors.status_id ? 'border-red-500' : ''}`}
                                value={formData.status_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("movie_form.select_placeholder")}</option>
                                {options.statuses.sort((a, b) => a.name_en.localeCompare(b.name_en)).map(s =>
                                    <option key={s.id} value={s.id}>{isEnglish ? s.name_en : s.name_ar}</option>
                                )}
                            </select>
                            <div className={`absolute ${isEnglish ? "right-2" : "left-2"} pointer-events-none`}>
                                <ChevronDown size={18} />
                            </div>
                        </div>
                        {errors.status_id && <span className={errorStyle}>{errors.status_id}</span>}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className={subTitleStyle}>{t("movie_form.crew_and_genres")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MultiSelect
                        label={t("movie_form.starring")}
                        options={options.actors}
                        selected={formData.actors}
                        onChange={(selected) => setFormData({ ...formData, actors: selected })}
                        placeholder={t("movie_form.select_placeholder")}
                    />
                    <MultiSelect
                        label={t("movie_form.director")}
                        options={options.directors}
                        selected={formData.directors}
                        onChange={(selected) => setFormData({ ...formData, directors: selected })}
                        placeholder={t("movie_form.select_placeholder")}
                    />
                    <MultiSelect
                        label={t("movie_form.genres")}
                        options={options.genres}
                        selected={formData.genres}
                        onChange={(selected) => setFormData({ ...formData, genres: selected })}
                        placeholder={t("movie_form.select_placeholder")}
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className={subTitleStyle}>{t("movie_form.languages")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <MultiSelect
                            label={t("movie_form.languages")}
                            options={options.languages}
                            selected={formData.languages}
                            onChange={(selected) => {
                                setFormData({ ...formData, languages: selected });
                                if (errors.languages) setErrors({ ...errors, languages: '' });
                            }}
                            placeholder={t("movie_form.select_placeholder")}
                            error={errors.languages}
                            required
                        />
                        {errors.languages && <span className={errorStyle}>{errors.languages}</span>}
                    </div>
                    <MultiSelect
                        label={t("movie_form.subtitles")}
                        options={options.languages}
                        selected={formData.subtitles}
                        onChange={(selected) => setFormData({ ...formData, subtitles: selected })}
                        placeholder={t("movie_form.select_placeholder")}
                    />
                </div>
            </section>

            <section className="space-y-4 border-t pt-6">
                <h2 className={subTitleStyle}>{t("movie_form.media")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Poster Upload */}
                    <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl hover:bg-gray-50">
                        <label className="cursor-pointer text-center w-full flex flex-col gap-1">
                            <Upload className="mx-auto text-gray-400" size={32} />
                            <p className="font-bold">{t("movie_form.main_poster")}</p>
                            <p className="text-xs text-gray-500">{t("movie_form.requirements")}</p>
                            <p className="text-xs text-gray-500">{t("movie_form.poster_size")}</p>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        const error = await validateImage(file, { width: 1000, minH: 1400, maxH: 1600 });
                                        if (error) {
                                            // Parse the error string: "validation.exact_width|1000|1024"
                                            const parts = error.split('|');
                                            const key = parts[0];
                                            const params: any = {};

                                            if (parts.length > 1) {
                                                // Map parameters based on the error type
                                                if (key === 'validation.exact_width') {
                                                    params.width = parts[1];
                                                    params.current = parts[2];
                                                } else if (key === 'validation.min_height') {
                                                    params.minH = parts[1];
                                                } else if (key === 'validation.max_height') {
                                                    params.maxH = parts[1];
                                                } else if (key === 'validation.exact_height') {
                                                    params.exactH = parts[1];
                                                }
                                            }

                                            const translatedError = t(key, params) as string;
                                            setErrors({ ...errors, poster_url: translatedError });
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
                            <p className="font-bold">{t("movie_form.featured_banner")}</p>
                            <p className="text-xs text-gray-500">{t("movie_form.requirements")}</p>
                            <p className="text-xs text-gray-500">{t("movie_form.banner_size")}</p>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        const error = await validateImage(file, { width: 1920, exactH: 1080 });
                                        if (error) {
                                            // Parse the error string: "validation.exact_width|1920|1024"
                                            const parts = error.split('|');
                                            const key = parts[0];
                                            const params: any = {};

                                            if (parts.length > 1) {
                                                // Map parameters based on the error type
                                                if (key === 'validation.exact_width') {
                                                    params.width = parts[1];
                                                    params.current = parts[2];
                                                } else if (key === 'validation.min_height') {
                                                    params.minH = parts[1];
                                                } else if (key === 'validation.max_height') {
                                                    params.maxH = parts[1];
                                                } else if (key === 'validation.exact_height') {
                                                    params.exactH = parts[1];
                                                }
                                            }

                                            const translatedError = t(key, params) as string;
                                            setErrors({ ...errors, featured_poster_url: translatedError });
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
                    <label className="text-lg font-bold">{t("movie_form.featured")}</label>
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
                        <span className={
                            `inline-block h-4 w-4 transform rounded-full bg-white transition 
                            ${formData.is_featured ? (isEnglish ? 'translate-x-6' : '-translate-x-6') : (isEnglish ? 'translate-x-1' : '-translate-x-1')}`
                        } />
                    </button>
                    {!existingFeaturedPoster && !featuredFile && !formData.is_featured && (
                        <span className="text-xs text-gray-500 ml-2">{t("movie_form.no_banner")}</span>
                    )}
                </div>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 flex justify-center items-center bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 max-w-35 disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />) : t(`movie_form.${submitLabel}`)}
                </button>
            </div>
        </div>
    );
}