export type MovieErrors = Record<string, string>;

export const validateMovie = (formData: any): MovieErrors => {
    const newErrors: MovieErrors = {};
    const imdbRegex = /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/i;

    if (!formData.name_en.trim()) newErrors.name_en = 'validation.required';
    if (!formData.name_ar.trim()) newErrors.name_ar = 'validation.required';
    if (!formData.desc_en.trim()) newErrors.desc_en = 'validation.required';
    if (!formData.desc_ar.trim()) newErrors.desc_ar = 'validation.required';
    if (!formData.release_date) newErrors.release_date = 'validation.required';
    if (!formData.maturity_id) newErrors.maturity_id = 'validation.required';
    if (!formData.status_id) newErrors.status_id = 'validation.required';
    if (formData.languages.length === 0) newErrors.languages = 'validation.min_one_lang';
    if (formData.imdb_url && !imdbRegex.test(formData.imdb_url)) { newErrors.imdb_url = 'validation.invalid_imdb'; }
    if (formData.duration !== '') {
        const durationNum = Number(formData.duration);
        if (durationNum < 0) { newErrors.duration = 'validation.positive_number'; }
        else if (!Number.isInteger(durationNum)) { newErrors.duration = 'validation.no_decimals'; }
    }

    return newErrors;
};

export const validateImage = (file: File, config: { width?: number, minH?: number, maxH?: number, exactH?: number }): Promise<string> => {
    return new Promise((resolve) => {
        // Check File Size (2MB)
        if (file.size > 2048 * 1024) {
            resolve("validation.file_too_large");
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
                    resolve(`validation.exact_width|${config.width}|${img.width}`);
                    return;
                }
                // Validate Height range
                if (config.minH && img.height < config.minH) {
                    resolve(`validation.min_height|${config.minH}`);
                    return;
                }
                if (config.maxH && img.height > config.maxH) {
                    resolve(`validation.max_height|${config.maxH}`);
                    return;
                }
                // Validate Exact Height
                if (config.exactH && img.height !== config.exactH) {
                    resolve(`validation.exact_height|${config.exactH}`);
                    return;
                }
                resolve(''); // No errors
            };
        };
    });
};

export const validateSimpleTableItem = (data: { name_en: string, name_ar: string }) => {
    const errors: Record<string, string> = {};
    if (!data.name_en.trim()) errors.name_en = 'validation.required';
    if (!data.name_ar.trim()) errors.name_ar = 'validation.required';
    return errors;
};

export const validateRating = (data: any) => {
    const errors: Record<string, string> = {};
    if (!data.maturity_rating?.trim()) errors.maturity_rating = 'validation.required';
    if (!data.ranking || data.ranking < 1) errors.ranking = 'validation.invalid_ranking';
    return errors;
};