export type MovieErrors = Record<string, string>;

export const validateMovie = (formData: any): MovieErrors => {
    const newErrors: MovieErrors = {};
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

    return newErrors;
};

export const validateImage = (file: File, config: { width?: number, minH?: number, maxH?: number, exactH?: number }): Promise<string | null> => {
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

export const validateSimpleTableItem = (data: { name_en: string, name_ar: string }) => {
    const errors: Record<string, string> = {};
    if (!data.name_en.trim()) errors.name_en = 'Required';
    if (!data.name_ar.trim()) errors.name_ar = 'Required';
    return errors;
};

export const validateRating = (data: any) => {
    const errors: Record<string, string> = {};
    if (!data.maturity_rating?.trim()) errors.maturity_rating = 'Required';
    if (!data.ranking || data.ranking < 1) errors.ranking = 'Invalid ranking';
    return errors;
};