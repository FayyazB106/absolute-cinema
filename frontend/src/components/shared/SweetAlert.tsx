import Swal from 'sweetalert2';
import i18next from 'i18next';

// Helper to ensure we always get a string for SweetAlert
const t = (key: string, options?: any): string => i18next.t(key, options) as string;

// Helper to detect dark mode
const isDarkMode = (): boolean => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
};

// Helper to get appropriate colors based on dark mode
const getSwalColors = () => {
    const dark = isDarkMode();
    return {
        background: dark ? '#1e293b' : '#ffffff',
        color: dark ? '#e2e8f0' : '#1f2937',
        confirmButton: dark ? '#ef4444' : '#dc2626',
        cancelButton: dark ? '#6b7280' : '#9ca3af',
        iconColor: dark ? '#ef4444' : '#dc2626',
        backdrop: 'rgba(15, 23, 42, 1)',
    };
};

interface DeleteConfirmProps {
    title?: string;
    itemType?: string;
    itemName: string;
}

export const confirmDelete = async ({ title, itemType, itemName
}: DeleteConfirmProps) => {
    const colors = getSwalColors();
    return await Swal.fire({
        title: title || t('swal.are_you_sure'),
        text: t('swal.confirm_delete_text', { type: itemType || t('swal.item'), name: itemName }),
        icon: 'warning',
        iconColor: colors.iconColor,
        showCancelButton: true,
        confirmButtonColor: colors.confirmButton,
        cancelButtonColor: colors.cancelButton,
        confirmButtonText: t('swal.confirm_button'),
        cancelButtonText: t('swal.cancel_button'),
        background: colors.background,
        color: colors.color,
    });
};

export const confirmBulkDelete = async (count: number) => {
    const colors = getSwalColors();
    return await Swal.fire({
        title: t('swal.are_you_sure'),
        text: t('swal.confirm_bulk_text', { count }),
        icon: 'warning',
        iconColor: colors.iconColor,
        showCancelButton: true,
        confirmButtonColor: colors.confirmButton,
        cancelButtonColor: colors.cancelButton,
        confirmButtonText: t('swal.confirm_bulk_button', { count }),
        cancelButtonText: t('swal.cancel_button'),
        background: colors.background,
        color: colors.color,
    });
};

export const confirmMovieDelete = async (movieName: string) => {
    const colors = getSwalColors();
    return await Swal.fire({
        title: t('swal.delete_movie_title'),
        text: t('swal.delete_movie_text', { name: movieName }),
        icon: 'warning',
        iconColor: colors.iconColor,
        showCancelButton: true,
        confirmButtonColor: colors.confirmButton,
        cancelButtonColor: colors.cancelButton,
        confirmButtonText: t('swal.confirm_button_movie'),
        cancelButtonText: t('swal.cancel_button'),
        background: colors.background,
        color: colors.color,
    });
};

export const showMovieSuccess = () => {
    const colors = getSwalColors();
    Swal.fire({
        title: t("swal.movie_added_title"),
        icon: 'success',
        background: colors.background,
        color: colors.color,
    });
};

export const showSuccessMessage = (message: string) => {
    const colors = getSwalColors();
    Swal.fire({
        title: t("swal.deleted_title"),
        text: message,
        icon: 'success',
        background: colors.background,
        color: colors.color,
    });
};

export const showErrorMessage = (message: string) => {
    const colors = getSwalColors();
    Swal.fire({
        title: t("swal.error_title"),
        text: message,
        icon: 'error',
        background: colors.background,
        color: colors.color,
    });
};

export const showMobileWarning = () => {
    return Swal.fire({
        title: t('swal.mobile_warning_title') || 'Desktop Recommended',
        text: t('swal.mobile_warning_text') || 'This dashboard is not optimized for mobile screens.',
        icon: 'error',
        confirmButtonText: 'Country Roads, Take Me Home',
        confirmButtonColor: '#2563eb',
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: `rgba(15, 23, 42, 1)`
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/';
        }
    });
};