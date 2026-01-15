import Swal from 'sweetalert2';

interface DeleteConfirmProps {
    title?: string;
    itemType?: string;
    itemName: string;
}

export const confirmDelete = async ({
    title = 'Are you sure?',
    itemType = 'item',
    itemName
}: DeleteConfirmProps) => {
    return await Swal.fire({
        title: title,
        text: `You are about to delete the ${itemType} "${itemName}"`,
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
    });
};

export const confirmBulkDelete = async (count: number) => {
    const label = count > 1 ? "items" : "item";

    return await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete ${count} selected ${label}. This action cannot be undone.`,
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Yes, delete ${count} items`,
        cancelButtonText: 'Cancel',
    });
};

export const confirmMovieDelete = async (movieName: string) => {
    return await Swal.fire({
        title: 'Delete Movie?',
        text: `You are about to permanently remove "${movieName}". This will delete all associated data.`,
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete movie',
        cancelButtonText: 'Cancel',
    });
};

export const showSuccessMessage = (message: string) => {
    Swal.fire('Deleted!', message, 'success');
};

export const showErrorMessage = (message: string = 'Something went wrong') => {
    Swal.fire('Error', message, 'error');
};