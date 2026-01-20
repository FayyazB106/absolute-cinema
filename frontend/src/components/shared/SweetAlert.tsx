import Swal from 'sweetalert2';
import i18next from 'i18next';

// Helper to ensure we always get a string for SweetAlert
const t = (key: string, options?: any): string => i18next.t(key, options) as string;

interface DeleteConfirmProps {
    title?: string;
    itemType?: string;
    itemName: string;
}

export const confirmDelete = async ({ title, itemType, itemName
}: DeleteConfirmProps) => {
    return await Swal.fire({
        title: title || t('swal.are_you_sure'),
        text: t('swal.confirm_delete_text', { type: itemType || t('swal.item'), name: itemName }),
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: t('swal.confirm_button'),
        cancelButtonText: t('swal.cancel_button'),
    });
};

export const confirmBulkDelete = async (count: number) => {
    return await Swal.fire({
        title: t('swal.are_you_sure'),
        text: t('swal.confirm_bulk_text', { count }),
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: t('swal.confirm_bulk_button', { count }),
        cancelButtonText: t('swal.cancel_button'),
    });
};

export const confirmMovieDelete = async (movieName: string) => {
    return await Swal.fire({
        title: t('swal.delete_movie_title'),
        text: t('swal.delete_movie_text', { name: movieName }),
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: t('swal.confirm_button_movie'),
        cancelButtonText: t('swal.cancel_button'),
    });
};

export const showMovieSuccess = () => {
    Swal.fire({
        title: t("swal.movie_added_title"),
        icon: 'success',
    });
};

export const showSuccessMessage = (message: string) => {
    Swal.fire({
        title: t("swal.deleted_title"),
        text: message,
        icon: 'success',
    });
};

export const showErrorMessage = (message: string) => {
    Swal.fire({
        title: t("swal.error_title"),
        text: message,
        icon: 'error',
    });
};