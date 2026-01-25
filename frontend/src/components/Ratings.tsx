import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check, Search, ChevronDown } from 'lucide-react';
import PlusButton from './shared/PlusButton';
import type { Rating } from '../types/movie';
import Title from './shared/Title';
import { movieService } from '../services/movieService';
import { validateRating } from '../utils/validation';
import { toast } from './shared/Toast';
import { confirmBulkDelete, confirmDelete, showErrorMessage, showSuccessMessage } from './shared/SweetAlert';
import { Trans, useTranslation } from 'react-i18next';

export default function Ratings() {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [bulkErrors, setBulkErrors] = useState<Record<number, Record<string, string>>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [newRatings, setNewRatings] = useState([
        {
            maturity_rating: '',
            name_en: '',
            name_ar: '',
            ranking: 1
        }
    ]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        maturity_rating: '',
        name_en: '',
        name_ar: '',
        ranking: 1
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const quickInputStyle = "flex-1 p-2 border border-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-0 outline-none placeholder:text-gray-400"
    const inputStyle = "border border-black rounded px-2 py-1 w-full placeholder:text-gray-400"
    const errorStyle = "text-red-500"

    const fetchRatings = async () => {
        try {
            const data = await movieService.getRatings();
            setRatings(data);
        } catch (err) {
            console.error("Failed to fetch maturity ratings", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRatings(); }, []);

    const addNewRow = () => {
        if (newRatings.length >= 5) {
            toast.error(t("table.max_rows"));
            return;
        }
        setNewRatings([...newRatings, { maturity_rating: '', name_en: '', name_ar: '', ranking: 1 }]);
    };

    const removeNewRow = (indexToRemove: number) => {
        const updatedItems = newRatings.filter((_, i) => i !== indexToRemove);
        setNewRatings(updatedItems);

        setBulkErrors(prevErrors => {
            const updatedErrors: Record<number, Record<string, string>> = {};
            Object.keys(prevErrors).forEach((key) => {
                const oldIndex = parseInt(key, 10);
                if (oldIndex < indexToRemove) {
                    updatedErrors[oldIndex] = prevErrors[oldIndex];
                } else if (oldIndex > indexToRemove) {
                    updatedErrors[oldIndex - 1] = prevErrors[oldIndex];
                }
            });
            return updatedErrors;
        });
    };

    const handleBulkSubmit = async () => {
        let hasLocalErrors = false;
        const newBulkErrors: Record<number, Record<string, string>> = {};

        newRatings.forEach((item, index) => {
            const errors = validateRating(item);
            if (Object.keys(errors).length > 0) {
                newBulkErrors[index] = errors;
                hasLocalErrors = true;
            }
        });

        if (hasLocalErrors) {
            setBulkErrors(newBulkErrors);
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t("table.submitting"));

        try {
            const results = await Promise.all(
                newRatings.map(async (item, index) => {
                    const res = await movieService.createRating(item);
                    if (res.ok) return { success: true, index };

                    if (res.status === 422) {
                        const data = await res.json();
                        const backendErrors: Record<string, string> = {};
                        Object.keys(data.errors).forEach(key => {
                            if (data.errors[key] && data.errors[key].length > 0) {
                                let msg = data.errors[key][0];
                                if (msg === "The maturity rating has already been taken.") {
                                    msg = t("table.error_unique_rating");
                                }
                                backendErrors[key] = msg;
                            }
                        });
                        return { success: false, index, errors: backendErrors };
                    }
                    return { success: false, index, errors: { general: "Server error" } };
                })
            );

            const backendBulkErrors: Record<number, Record<string, string>> = {};
            const successfulIndices = new Set<number>();
            let totalFailed = 0;

            results.forEach(res => {
                if (res.success) {
                    successfulIndices.add(res.index);
                } else if (res.errors) {
                    if (Object.keys(res.errors).length > 0) {
                        backendBulkErrors[res.index] = res.errors;
                        totalFailed++;
                    }
                }
            });

            if (successfulIndices.size > 0) {
                const count = successfulIndices.size;
                toast.success(t('table.rows_added', { count }), { id: toastId });
            }

            if (totalFailed > 0) {
                // Remove successful rows from the form and shift error indices
                const updatedNewRatings = newRatings.filter((_, i) => !successfulIndices.has(i));
                setNewRatings(updatedNewRatings);

                // Shift error indices to match the new positions after removing successful rows
                const shiftedErrors: Record<number, Record<string, string>> = {};
                Object.keys(backendBulkErrors).forEach(key => {
                    const oldIndex = parseInt(key, 10);
                    const removedBefore = Array.from(successfulIndices).filter(i => i < oldIndex).length;
                    const newIndex = oldIndex - removedBefore;
                    shiftedErrors[newIndex] = backendBulkErrors[oldIndex];
                });

                setBulkErrors(shiftedErrors);
                toast.error(t('table.rows_added_failed', { count: totalFailed }), { id: toastId });
                fetchRatings();
            } else {
                // All rows succeeded
                setNewRatings([{ maturity_rating: '', name_en: '', name_ar: '', ranking: 1 }]);
                setBulkErrors({});
                fetchRatings();
            }
        } catch (err) {
            console.error("Bulk add failed", err);
            toast.error(t('table.error_submit'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (id: number) => {
        const localErrors = validateRating(editForm);
        if (Object.keys(localErrors).length > 0) {
            setEditErrors(localErrors);
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t("table.submitting"));

        const res = await movieService.updateRating(id, editForm);
        if (res.ok) {
            setEditingId(null);
            setEditErrors({});
            fetchRatings();
            toast.success(t("table.row_updated"), { id: toastId });
            setIsSubmitting(false);
        } else if (res.status === 422) {
            const data = await res.json();
            const backendErrors: any = {};
            Object.keys(data.errors).forEach(key => {
                let msg = data.errors[key][0];
                // CUSTOM ERROR MESSAGE LOGIC
                if (msg === "The maturity rating has already been taken.") {
                    msg = t("table.errorNameRating");
                }
                backendErrors[key] = msg;
            });
            setEditErrors(backendErrors);
            toast.dismiss(toastId);
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete({ itemName: name });
        if (result.isConfirmed) {
            try {
                await movieService.deleteRating(id);
                fetchRatings();
                showSuccessMessage(t("swal.deleted_text"));
            } catch (error) {
                showErrorMessage(t("swal.error_general"));
            }
        }
    };

    const toggleRowSelection = (id: number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === ratings.length && selectedRows.size > 0) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(ratings.map(rating => rating.id)));
        }
    };

    const handleDeleteSelected = async () => {
        const count = selectedRows.size;
        const result = await confirmBulkDelete(count);

        if (result.isConfirmed) {
            try {
                const deletePromises = Array.from(selectedRows).map(id => movieService.deleteRating(id));

                const responses = await Promise.all(deletePromises);

                // Check if all responses were successful
                if (responses.every(res => res.ok)) {
                    setSelectedRows(new Set());
                    fetchRatings();
                    showSuccessMessage(t('table.rows_deleted', { count }));
                } else {
                    throw new Error(t("table.rows_deleted_fail_some"));
                }
            } catch (error) {
                showErrorMessage(t("table.rows_deleted_fail_try_again"));
            }
        }
    };

    // Filter items based on maturity rating
    const filteredItems = ratings.filter(item => item.maturity_rating.toLowerCase().includes(searchTerm.toLowerCase()));

    // Calculate pagination
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <Title text={t("titles.ratings")} />
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Section */}
                <div className="db-quickAdd p-4 rounded-xl mb-6 shadow-sm relative">
                    <div className="flex flex-col gap-4" dir='ltr'>
                        {newRatings.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start relative pb-4">
                                <div className="flex flex-col flex-1 min-w-0">
                                    <input
                                        placeholder="Ranking"
                                        type="number"
                                        className={`${quickInputStyle} ${bulkErrors[index]?.ranking ? 'border-red-500' : ''}`}
                                        value={item.ranking}
                                        onChange={(e) => {
                                            const updated = [...newRatings];
                                            updated[index].ranking = Number(e.target.value);
                                            setNewRatings(updated);
                                            if (bulkErrors[index]) {
                                                const newErrs = { ...bulkErrors };
                                                if (newErrs[index]) {
                                                    delete newErrs[index].ranking;
                                                    if (Object.keys(newErrs[index]).length === 0) { delete newErrs[index]; }
                                                    setBulkErrors(newErrs);
                                                }
                                            }
                                        }}
                                    />
                                    {bulkErrors[index]?.ranking && <span className={errorStyle}>{t(bulkErrors[index].ranking)}</span>}
                                </div>

                                <div className="flex flex-col flex-1 min-w-0">
                                    <input
                                        placeholder={t("table.rating_placeholder")}
                                        className={`${quickInputStyle} ${bulkErrors[index]?.maturity_rating ? 'border-red-500' : ''}`}
                                        value={item.maturity_rating}
                                        onChange={(e) => {
                                            const updated = [...newRatings];
                                            updated[index].maturity_rating = e.target.value;
                                            setNewRatings(updated);
                                            if (bulkErrors[index]) {
                                                const newErrs = { ...bulkErrors };
                                                if (newErrs[index]) {
                                                    delete newErrs[index].maturity_rating;
                                                    if (Object.keys(newErrs[index]).length === 0) { delete newErrs[index]; }
                                                    setBulkErrors(newErrs);
                                                }
                                            }
                                        }}
                                    />
                                    {bulkErrors[index]?.maturity_rating && <span className={errorStyle}>{t(bulkErrors[index].maturity_rating)}</span>}
                                </div>

                                <div className="flex flex-col flex-1 min-w-0">
                                    <input
                                        placeholder="Name"
                                        className={`${quickInputStyle} ${bulkErrors[index]?.name_en ? 'border-red-500' : ''}`}
                                        value={item.name_en}
                                        onChange={(e) => {
                                            const updated = [...newRatings];
                                            updated[index].name_en = e.target.value;
                                            setNewRatings(updated);
                                            if (bulkErrors[index]) {
                                                const newErrs = { ...bulkErrors };
                                                if (newErrs[index]) {
                                                    delete newErrs[index].name_en;
                                                    if (Object.keys(newErrs[index]).length === 0) { delete newErrs[index]; }
                                                    setBulkErrors(newErrs);
                                                }
                                            }
                                        }}
                                    />
                                    {bulkErrors[index]?.name_en && <span className={errorStyle}>{t(bulkErrors[index].name_en)}</span>}
                                </div>

                                <div className="flex flex-col flex-1 min-w-0">
                                    <input
                                        placeholder="الاسم"
                                        className={`${quickInputStyle} ${bulkErrors[index]?.name_ar ? 'border-red-500' : ''}`}
                                        value={item.name_ar}
                                        dir="rtl"
                                        onChange={(e) => {
                                            const updated = [...newRatings];
                                            updated[index].name_ar = e.target.value;
                                            setNewRatings(updated);
                                            if (bulkErrors[index]) {
                                                const newErrs = { ...bulkErrors };
                                                if (newErrs[index]) {
                                                    delete newErrs[index].name_ar;
                                                    if (Object.keys(newErrs[index]).length === 0) { delete newErrs[index]; }
                                                    setBulkErrors(newErrs);
                                                }
                                            }
                                        }}
                                    />
                                    {bulkErrors[index]?.name_ar && <span className={errorStyle}>{t(bulkErrors[index].name_ar)}</span>}
                                </div>

                                {/* Submit All Button */}
                                {index === 0 && (
                                    <PlusButton title={t("table.submit")} disabled={isSubmitting} onClick={handleBulkSubmit} />
                                )}

                                {/* Remove row button */}
                                {index > 0 && (
                                    <button onClick={() => removeNewRow(index)} className="db-deleteButton p-3 rounded-full transition cursor-pointer">
                                        <Trash2 size={24} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add New Row Button */}
                    <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 group">
                        <div className="relative cursor-pointer flex items-center justify-center w-10 h-10 transition-all duration-500 ease-in-out">
                            {/* The Small Blue Dot (Visible when NOT hovered) */}
                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-sm transition-all dark-duration ease-in-out group-hover:opacity-0 group-hover:scale-0 opacity-100 scale-100" />

                            {/* The Plus Button (Visible ONLY on hover) */}
                            <div className="absolute transition-all dark-duration ease-in-out opacity-0 scale-50 rotate-[-90deg] group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0">
                                <PlusButton title={t("table.add_row")} onClick={addNewRow} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="db-tableBG rounded-xl shadow-md border border-black overflow-hidden">
                    {selectedRows.size > 1 && (
                        <div className="db-quickAdd border-b p-4 flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {t('table.selected', { count: selectedRows.size })}
                            </span>
                            <button onClick={handleDeleteSelected} className="px-2 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center gap-2 cursor-pointer">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}

                    <div className="relative db-tableSearchBar">
                        <input
                            type="text"
                            placeholder={t("table.search_rating")}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full p-2 pl-4 pr-10 focus:ring-2 focus:ring-blue-400 outline-none shadow-sm placeholder:text-gray-400"
                        />

                        <div className="absolute right-3 top-2.5 flex items-center">
                            {searchTerm ? (
                                // Close/Clear Button (Visible when text exists)
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setCurrentPage(1);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            ) : (
                                // Search Icon (Visible when empty)
                                <div className="text-gray-400"><Search size={18} /></div>
                            )}
                        </div>
                    </div>

                    <table className="w-full text-left" dir='ltr'>
                        <thead className="db-tableHeader border-b border-black">
                            <tr>
                                <th className="px-4 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === paginatedItems.length && paginatedItems.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 font-bold text-center">{t("table.ranking")}</th>
                                <th className="px-6 py-4 font-bold text-center">{t("table.rating")}</th>
                                <th className="px-6 py-4 font-bold">Name</th>
                                <th className="px-6 py-4 font-bold text-right">الاسم</th>
                                <th className="px-6 py-4 font-bold text-center w-32">{t("table.actions")}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-10">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedItems.length > 0 ? (
                                paginatedItems.map(ratings => (
                                    <tr key={ratings.id} className="db-tableRows transition border-black">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(ratings.id)}
                                                onChange={() => toggleRowSelection(ratings.id)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {editingId === ratings.id ? (
                                                <div className='flex flex-col'>
                                                    <input
                                                        value={editForm.ranking}
                                                        type="number"
                                                        onChange={(e) => {
                                                            setEditForm({ ...editForm, ranking: Number(e.target.value) });
                                                            if (editErrors.ranking) setEditErrors({ ...editErrors, ranking: '' });
                                                        }}
                                                        className={inputStyle}
                                                    />
                                                    {editErrors.ranking && (<span className="text-xs text-red-500 text-left">{t(editErrors.ranking)}</span>)}
                                                </div>
                                            ) : ratings.ranking}
                                        </td>
                                        <td className="px-6 py-4 text-center align-middle">
                                            {editingId === ratings.id ? (
                                                <div className='flex flex-col'>
                                                    <input
                                                        value={editForm.maturity_rating}
                                                        onChange={(e) => {
                                                            setEditForm({ ...editForm, maturity_rating: e.target.value });
                                                            // Clear error as user types
                                                            if (editErrors.maturity_rating) setEditErrors({ ...editErrors, maturity_rating: '' });
                                                        }}
                                                        className={inputStyle}
                                                    />
                                                    {editErrors.maturity_rating && (<span className="text-xs text-red-500 text-left">{t(editErrors.maturity_rating)}</span>)}
                                                </div>
                                            ) : ratings.maturity_rating}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === ratings.id ? (
                                                <div className='flex flex-col'>
                                                    <input
                                                        value={editForm.name_en}
                                                        onChange={(e) => {
                                                            setEditForm({ ...editForm, name_en: e.target.value });
                                                            if (editErrors.name_en) setEditErrors({ ...editErrors, name_en: '' });
                                                        }}
                                                        className={inputStyle}
                                                    />
                                                    {editErrors.name_en && (<span className="text-xs text-red-500 text-left">{t(editErrors.name_en)}</span>)}
                                                </div>
                                            ) : ratings.name_en}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === ratings.id ? (
                                                <div className='flex flex-col'>
                                                    <input
                                                        value={editForm.name_ar}
                                                        onChange={(e) => {
                                                            setEditForm({ ...editForm, name_ar: e.target.value });
                                                            if (editErrors.name_ar) setEditErrors({ ...editErrors, name_ar: '' });
                                                        }}
                                                        className={inputStyle}
                                                        dir="rtl"
                                                    />
                                                    {editErrors.name_ar && (<span className="text-xs text-red-500 text-left">{t(editErrors.name_ar)}</span>)}
                                                </div>
                                            ) : ratings.name_ar}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {editingId === ratings.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdate(ratings.id)}
                                                            className="text-green-600 hover:bg-green-50 p-2 rounded-full cursor-pointer"
                                                            title={t("buttons.confirm")}
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="text-gray-600 hover:bg-gray-50 p-2 rounded-full cursor-pointer"
                                                            title={t("buttons.cancel")}
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(ratings.id);
                                                                setEditForm({ ...ratings });
                                                            }}
                                                            className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition cursor-pointer"
                                                            title={t("buttons.edit")}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ratings.id, ratings.maturity_rating)}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition cursor-pointer"
                                                            title={t("buttons.delete")}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <Search size={40} className="opacity-20" />
                                            <p dir={isEnglish ? "ltr" : "rtl"} className="text-lg font-medium">{t('table.no_results', { query: searchTerm })}</p>
                                            <p className="text-sm">{t("table.no_results_guide")}</p>
                                            <button onClick={() => setSearchTerm("")} className="mt-2 text-blue-500 hover:underline text-sm font-semibold cursor-pointer">
                                                {t("table.clear_search")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && ratings.length > 10 && (
                    <div className="mt-4 flex items-center justify-between p-4 rounded-lg border border-black shadow-sm">
                        <div className="relative flex items-center gap-2">
                            <span className="text-sm text-gray-600">{t("pagination.show")}:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className="border rounded px-3 py-1 text-sm outline-none appearance-none"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <div className={`absolute ${isEnglish ? "right-1" : "left-1"} pointer-events-none`}>
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        {endIndex !== 0 && (
                            <div className="text-sm">
                                <Trans
                                    i18nKey="pagination.showing"
                                    values={{ start: startIndex + 1, end: endIndex, total: totalItems }}
                                    components={{ 1: <span className="font-semibold" />, 2: <span className="font-semibold" />, 3: <span className="font-semibold" /> }}
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {t('pagination.previous')}
                            </button>
                            <div className="flex items-center px-3 text-sm">
                                <Trans
                                    i18nKey="pagination.page_info"
                                    values={{ current: currentPage, total: totalPages }}
                                    components={{ 1: <span className="font-semibold mx-1" />, 2: <span className="font-semibold mx-1" /> }}
                                />
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {t('pagination.next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}