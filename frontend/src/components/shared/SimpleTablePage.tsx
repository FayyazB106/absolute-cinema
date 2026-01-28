import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check, Search, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';
import PlusButton from '../shared/PlusButton';
import Title from '../shared/Title';
import { validateSimpleTableItem } from '../../utils/validation';
import { toast } from '../shared/Toast';
import { confirmBulkDelete, confirmDelete, showErrorMessage, showSuccessMessage } from './SweetAlert';
import { Trans, useTranslation } from 'react-i18next';

interface TableItem {
    id: number;
    name_en: string;
    name_ar: string;
}

interface SimpleTablePageProps {
    title: string;
    endpoint: string; // e.g., 'actors', 'directors', 'genres'
    singularName?: string; // For delete confirmation, e.g., 'actor'
}

export default function SimpleTablePage({ title, endpoint }: SimpleTablePageProps) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
    const [items, setItems] = useState<TableItem[]>([]);
    const [bulkErrors, setBulkErrors] = useState<Record<number, Record<string, string>>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [newItems, setNewItems] = useState([{ name_en: '', name_ar: '' }]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name_en: '', name_ar: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const quickInputStyle = "flex-1 p-2 db-input border db-border rounded-lg db-focus-ring focus:border-0 outline-none placeholder:text-gray-400"
    const inputStyle = "db-input border db-border rounded px-2 py-1 w-full placeholder:text-gray-400"
    const errorStyle = "text-xs db-error text-left"

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/${endpoint}`);
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error(`Failed to fetch ${endpoint}`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [endpoint]);

    const addNewRow = () => {
        if (newItems.length >= 5) {
            toast.error(t("table.max_rows"));
            return;
        }
        setNewItems([...newItems, { name_en: '', name_ar: '' }]);
    };

    const handleBulkSubmit = async () => {
        let hasLocalErrors = false;
        const newBulkErrors: Record<number, Record<string, string>> = {};

        // Track values to detect duplicates
        const enValues = newItems.map(i => i.name_en.trim().toLowerCase());
        const arValues = newItems.map(i => i.name_ar.trim().toLowerCase());

        newItems.forEach((item, index) => {
            const errors = validateSimpleTableItem(item);

            // Check for duplicate in the current list of new items
            if (item.name_en && enValues.filter(v => v === item.name_en.trim().toLowerCase()).length > 1) {
                errors.name_en = t("table.error_duplicate_quick_add");
            }
            if (item.name_ar && arValues.filter(v => v === item.name_ar.trim().toLowerCase()).length > 1) {
                errors.name_ar = t("table.error_duplicate_quick_add");
            }

            // If there are errors, add them to the bulk errors for this specific row
            if (Object.keys(errors).length > 0) {
                newBulkErrors[index] = errors;
                hasLocalErrors = true;
            }
        });

        // If there are local validation errors, update the error state and return early
        if (hasLocalErrors) {
            setBulkErrors(newBulkErrors);
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t("table.submitting"));

        try {
            const results = await Promise.all(
                newItems.map(async (item, index) => {
                    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item),
                    });

                    if (res.ok) return { success: true, index };

                    if (res.status === 422) {
                        const data = await res.json();
                        const backendErrors: Record<string, string> = {};

                        // Only include errors for fields that actually have errors
                        Object.keys(data.errors).forEach(key => {
                            if (data.errors[key] && data.errors[key].length > 0) {
                                let msg = data.errors[key][0];
                                if (msg.includes("already been taken")) {
                                    msg = t("table.error_unique_name");
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
                    // Only add errors if there are actual errors to show
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
                const updatedNewItems = newItems.filter((_, i) => !successfulIndices.has(i));
                setNewItems(updatedNewItems);

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
                fetchItems();
            } else {
                // All rows succeeded
                setNewItems([{ name_en: '', name_ar: '' }]);
                setBulkErrors({});
                fetchItems();
            }
        } catch (err) {
            console.error("Bulk add failed", err);
            toast.error(t('table.error_submit'), { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeNewRow = (indexToRemove: number) => {
        // Remove the item from the inputs
        const updatedItems = newItems.filter((_, i) => i !== indexToRemove);
        setNewItems(updatedItems);

        // Clear and shift the errors
        setBulkErrors(prevErrors => {
            const updatedErrors: Record<number, Record<string, string>> = {};

            // Iterate through the keys of the previous error state
            Object.keys(prevErrors).forEach((key) => {
                const oldIndex = parseInt(key, 10);

                if (oldIndex < indexToRemove) {
                    // Keep errors for rows before the deleted one
                    updatedErrors[oldIndex] = prevErrors[oldIndex];
                } else if (oldIndex > indexToRemove) {
                    // Shift errors down for rows after the deleted one
                    updatedErrors[oldIndex - 1] = prevErrors[oldIndex];
                }
                // If oldIndex === indexToRemove, it is simply excluded (deleted)
            });

            return updatedErrors;
        });
    };

    const handleUpdate = async (id: number) => {
        const localErrors = validateSimpleTableItem(editForm);
        if (Object.keys(localErrors).length > 0) {
            setEditErrors(localErrors);
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(t("table.submitting"));

        const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });

        if (res.ok) {
            setEditingId(null);;
            setEditErrors({});
            fetchItems();
            toast.success(t("table.row_updated"), { id: toastId });
            setIsSubmitting(false);
        } else if (res.status === 422) {
            const data = await res.json();
            const backendErrors: any = {};
            Object.keys(data.errors).forEach(key => {
                let msg = data.errors[key][0];
                // CUSTOM ERROR MESSAGE LOGIC
                if (msg.includes("already been taken")) {
                    msg = t("table.error_unique_name");
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
                await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
                fetchItems();
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
        if (selectedRows.size === paginatedItems.length && selectedRows.size > 0) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedItems.map(item => item.id)));
        }
    };

    const handleDeleteSelected = async () => {
        const count = selectedRows.size;
        const result = await confirmBulkDelete(count);

        if (result.isConfirmed) {
            try {
                const deletePromises = Array.from(selectedRows).map(id =>
                    fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' })
                );

                const responses = await Promise.all(deletePromises);

                // Check if all responses were successful
                if (responses.every(res => res.ok)) {
                    setSelectedRows(new Set());
                    fetchItems();
                    showSuccessMessage(t('table.rows_deleted', { count }));
                } else {
                    throw new Error(t("table.rows_deleted_fail_some"));
                }
            } catch (error) {
                showErrorMessage(t("table.rows_deleted_fail_try_again"));
            }
        }
    };

    // Filter items based on search term (English or Arabic)
    const filteredItems = items.filter(item =>
        item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name_ar.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <Title text={title} />
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Section */}
                <div className="db-quickAdd p-4 rounded-xl mb-6 shadow-sm relative border db-border">
                    <div className="flex flex-col gap-4" dir='ltr'>
                        {newItems.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start relative pb-4">
                                <div className="flex flex-col flex-1 min-w-0">
                                    <input
                                        placeholder="Name"
                                        className={`${quickInputStyle} ${bulkErrors[index]?.name_en ? 'border-red-500' : ''}`}
                                        value={item.name_en}
                                        onChange={(e) => {
                                            const updated = [...newItems];
                                            updated[index].name_en = e.target.value;
                                            setNewItems(updated);
                                            // Clear error for this field only when user starts typing
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
                                    {bulkErrors[index]?.name_en && (<span className={errorStyle}>{t(bulkErrors[index].name_en)}</span>)}
                                </div>

                                <div className="flex flex-col flex-1 min-w-0">
                                    <input
                                        placeholder="الاسم"
                                        dir="rtl"
                                        className={`${quickInputStyle} ${bulkErrors[index]?.name_ar ? 'border-red-500' : ''}`}
                                        value={item.name_ar}
                                        onChange={(e) => {
                                            const updated = [...newItems];
                                            updated[index].name_ar = e.target.value;
                                            setNewItems(updated);
                                            // Clear error for this field only when user starts typing
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
                                    {bulkErrors[index]?.name_ar && (<span className={errorStyle}>{t(bulkErrors[index].name_ar)}</span>)}
                                </div>

                                {/* Submit All Button */}
                                {index === 0 && (<PlusButton title={t("table.submit")} disabled={isSubmitting} onClick={handleBulkSubmit} />)}

                                {/* Remove row button*/}
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
                        <div className="relative cursor-pointer flex items-center justify-center w-10 h-10 transition-all ease-in-out">
                            {/* The Small Blue Dot (Visible when NOT hovered) */}
                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-sm transition-all dark-transition ease-in-out group-hover:opacity-0 group-hover:scale-0 opacity-100 scale-100" />

                            {/* The Plus Button (Visible ONLY on hover) */}
                            <div className="absolute transition-all dark-transition ease-in-out opacity-0 scale-50 rotate-[-90deg] group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0">
                                <PlusButton title={t("table.add_row")} onClick={addNewRow} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="db-tableBG rounded-xl shadow-md db-border border overflow-hidden">
                    {selectedRows.size > 1 && (
                        <div className="db-quickAdd border-b db-divider p-4 flex items-center justify-between">
                            <span className="text-sm font-medium db-text">
                                {t('table.selected', { count: selectedRows.size })}
                            </span>
                            <button onClick={handleDeleteSelected} className="px-2 py-2 db-delete-batch flex items-center gap-2 cursor-pointer">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}

                    <div className="relative db-tableSearchBar border-b db-divider">
                        <input
                            type="text"
                            placeholder={t("table.search_name")}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full p-2 pl-4 pr-10 db-input db-focus-ring outline-none shadow-sm placeholder:text-gray-400"
                        />

                        <div className={`absolute ${isEnglish ? "right-3" : "left-3"} top-2.5 flex items-center`}>
                            {searchTerm ? (
                                // Close/Clear Button (Visible when text exists)
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setCurrentPage(1);
                                    }}
                                    className="db-text-secondary hover:db-text cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            ) : (
                                // Search Icon (Visible when empty)
                                <div className="db-text-secondary"><Search size={18} /></div>
                            )}
                        </div>
                    </div>

                    <table className="w-full text-left" dir='ltr'>
                        <thead className="db-tableHeader border-b db-divider">
                            <tr>
                                <th className="px-4 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === paginatedItems.length && paginatedItems.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 cursor-pointer db-checkbox"
                                    />
                                </th>
                                <th className="px-6 py-4 font-bold db-text">Name</th>
                                <th className="px-6 py-4 font-bold text-right db-text">الاسم</th>
                                <th className="px-6 py-4 font-bold text-center w-32 db-text">{t("table.actions")}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y db-divider">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 animate-pulse">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-10 h-10 border-4 db-spinner rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedItems.length > 0 ? (
                                paginatedItems.map(item => (
                                    <tr key={item.id} className="db-tableRows transition">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(item.id)}
                                                onChange={() => toggleRowSelection(item.id)}
                                                className="w-4 h-4 cursor-pointer db-checkbox"
                                            />
                                        </td>
                                        <td className="px-6 py-4 db-text">
                                            {editingId === item.id ? (
                                                <div className='flex flex-col'>
                                                    <input
                                                        value={editForm.name_en}
                                                        onChange={(e) => {
                                                            setEditForm({ ...editForm, name_en: e.target.value });
                                                            if (editErrors.name_en) setEditErrors({ ...editErrors, name_en: '' });
                                                        }}
                                                        className={inputStyle}
                                                    />
                                                    {editErrors.name_en && (<span className="text-xs db-error text-left">{t(editErrors.name_en)}</span>)}
                                                </div>
                                            ) : item.name_en}
                                        </td>
                                        <td className="px-6 py-4 text-right db-text">
                                            {editingId === item.id ? (
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
                                                    {editErrors.name_ar && (<span className="text-xs db-error text-left">{t(editErrors.name_ar)}</span>)}
                                                </div>
                                            ) : item.name_ar}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {editingId === item.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdate(item.id)}
                                                            className="db-action-success p-2 rounded-full cursor-pointer transition"
                                                            title={t("buttons.confirm")}
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="db-text-secondary hover:db-hover p-2 rounded-full cursor-pointer transition"
                                                            title={t("buttons.cancel")}
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(item.id);
                                                                setEditForm({ name_en: item.name_en, name_ar: item.name_ar });
                                                            }}
                                                            className="db-action-warning p-2 rounded-full transition cursor-pointer"
                                                            title={t("buttons.edit")}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.name_en)}
                                                            className="db-deleteButton p-2 rounded-full transition cursor-pointer"
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
                                    <td colSpan={4} className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center db-text-secondary gap-2">
                                            <Search size={40} className="opacity-20" />
                                            <p dir={isEnglish ? "ltr" : "rtl"} className="text-lg font-medium">{t('table.no_results', { query: searchTerm })}</p>
                                            <p className="text-sm">{t("table.no_results_guide")}</p>
                                            <button onClick={() => setSearchTerm("")} className="mt-2 db-link-reset text-sm font-semibold cursor-pointer">
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
                {!loading && items.length > 10 && (
                    <div className="mt-4 flex items-center justify-between p-4 rounded-lg db-border border shadow-sm db-tableBG">
                        <div className="relative flex items-center gap-2">
                            <span className="text-sm db-text">{t("pagination.show")}:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className="db-input db-border border rounded px-3 py-1 text-sm outline-none appearance-none"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <div className={`absolute ${isEnglish ? "right-1" : "left-1"} pointer-events-none db-text-secondary`}>
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        {endIndex !== 0 && (
                            <div className="text-sm db-text">
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
                                className="px-4 py-2 db-border border rounded-lg text-sm font-medium transition db-text db-hover-light disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {t('pagination.previous')}
                            </button>
                            <div className="flex items-center px-3 text-sm db-text">
                                <Trans
                                    i18nKey="pagination.page_info"
                                    values={{ current: currentPage, total: totalPages }}
                                    components={{ 1: <span className="font-semibold mx-1" />, 2: <span className="font-semibold mx-1" /> }}
                                />
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 db-border border rounded-lg text-sm font-medium transition db-text hover:db-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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