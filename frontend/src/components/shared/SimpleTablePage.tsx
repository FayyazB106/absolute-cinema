import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check, Search } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';
import PlusButton from '../shared/PlusButton';
import Title from '../shared/Title';
import { validateSimpleTableItem } from '../../utils/validation';
import { toast } from '../shared/Toast';
import Swal from 'sweetalert2';
import { confirmBulkDelete, confirmDelete, showErrorMessage, showSuccessMessage } from './DeleteModal';

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
    const [items, setItems] = useState<TableItem[]>([]);
    const [bulkErrors, setBulkErrors] = useState<Record<number, Record<string, string>>>({});
    const [limitError, setLimitError] = useState("");
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
    const quickInputStyle = "flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-0 outline-none"
    const inputStyle = "border rounded px-2 py-1 w-full"
    const errorStyle = "text-red-500"

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
            setLimitError("Maximum 5 rows allowed");
            setTimeout(() => setLimitError(""), 3000); // Auto-clear error
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
                errors.name_en = "Duplicate in list";
            }
            if (item.name_ar && arValues.filter(v => v === item.name_ar.trim().toLowerCase()).length > 1) {
                errors.name_ar = "Duplicate in list";
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
        const toastId = toast.loading('Submitting');

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
                                    msg = "Name must be unique";
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
                toast.success(`${count} new row${count > 1 ? 's' : ''} added`, { id: toastId });
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
                toast.error(`${totalFailed} row${totalFailed > 1 ? 's' : ''} failed. Please fix errors and resubmit.`, { id: toastId });
                fetchItems();
            } else {
                // All rows succeeded
                setNewItems([{ name_en: '', name_ar: '' }]);
                setBulkErrors({});
                fetchItems();
            }
        } catch (err) {
            console.error("Bulk add failed", err);
            toast.error("Error submitting rows", { id: toastId });
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
        const toastId = toast.loading('Submitting');

        const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });

        if (res.ok) {
            setEditingId(null);;
            setEditErrors({});
            fetchItems();
            toast.success("Row updated", { id: toastId });
            setIsSubmitting(false);
        } else if (res.status === 422) {
            const data = await res.json();
            const backendErrors: any = {};
            Object.keys(data.errors).forEach(key => {
                let msg = data.errors[key][0];
                // CUSTOM ERROR MESSAGE LOGIC
                if (msg === "The name en has already been taken." || msg === "The name ar has already been taken.") {
                    msg = "Name must be unique";
                }
                backendErrors[key] = msg;
            });
            setEditErrors(backendErrors);
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete({ itemName: name });
        if (result.isConfirmed) {
            try {
                await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
                fetchItems();
                Swal.fire('Deleted!', 'The item has been removed.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Something went wrong', 'error');
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
                    showSuccessMessage(`${count} item${count > 1 ? 's' : ''} deleted successfully.`);
                } else {
                    throw new Error("Some items failed to delete");
                }
            } catch (error) {
                showErrorMessage("Failed to delete some items. Please try again.");
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
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 shadow-sm relative">
                    <div className="flex flex-col gap-4">
                        {newItems.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start relative pb-4">
                                <div className="flex flex-col w-full relative">
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
                                    {bulkErrors[index]?.name_en && (<span className={errorStyle}>{bulkErrors[index].name_en}</span>)}
                                </div>

                                <div className="flex flex-col w-full relative">
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
                                    {bulkErrors[index]?.name_ar && (<span className={errorStyle}>{bulkErrors[index].name_ar}</span>)}
                                </div>

                                {/* Submit All Button */}
                                {index === 0 && (<PlusButton title="Submit All" disabled={isSubmitting} onClick={handleBulkSubmit} />)}

                                {/* Remove row button*/}
                                {index > 0 && (
                                    <button onClick={() => removeNewRow(index)} className="text-red-500 hover:bg-red-50 p-3 rounded-full transition cursor-pointer">
                                        <Trash2 size={24} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add New Row Button */}
                    <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 group">
                        <div onClick={addNewRow} className="relative cursor-pointer flex items-center justify-center w-10 h-10 transition-all duration-500 ease-in-out">
                            {/* The Small Blue Dot (Visible when NOT hovered) */}
                            <div className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-sm transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-0 opacity-100 scale-100" />

                            {/* The Plus Button (Visible ONLY on hover) */}
                            <div className="absolute transition-all duration-300 ease-in-out opacity-0 scale-50 rotate-[-90deg] group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0">
                                <PlusButton title="Add new row" onClick={addNewRow} />
                            </div>
                        </div>

                        {/* Limit Error Message */}
                        {limitError && (
                            <span className="text-red-600 text-sm font-bold mt-1 bg-white px-2 py-0.5 rounded-full shadow-sm border border-red-100 absolute top-full whitespace-nowrap">
                                {limitError}
                            </span>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                    {selectedRows.size > 0 && (
                        <div className="bg-blue-50 border-b p-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
                            </span>
                            <button onClick={handleDeleteSelected} className="px-2 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center gap-2 cursor-pointer">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full p-2 pl-4 pr-10 focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
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

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === paginatedItems.length && paginatedItems.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 font-bold text-gray-700">Name</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-right">الاسم</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-center w-32">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-10 animate-pulse text-gray-400">Loading {endpoint}...</td></tr>
                            ) : paginatedItems.length > 0 ? (
                                paginatedItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(item.id)}
                                                onChange={() => toggleRowSelection(item.id)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
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
                                                    {editErrors.name_en && (<span className="text-xs text-red-500 text-left">{editErrors.name_en}</span>)}
                                                </div>
                                            ) : item.name_en}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 text-right">
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
                                                    {editErrors.name_ar && (<span className="text-xs text-red-500 text-left">{editErrors.name_ar}</span>)}
                                                </div>
                                            ) : item.name_ar}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {editingId === item.id ? (
                                                    <>
                                                        <button onClick={() => handleUpdate(item.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full cursor-pointer">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full cursor-pointer">
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
                                                            className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition cursor-pointer"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.name_en)}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition cursor-pointer"
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
                                        <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <Search size={40} className="opacity-20" />
                                            <p className="text-lg font-medium">No results found for "{searchTerm}"</p>
                                            <p className="text-sm">Try checking your spelling or searching for something else.</p>
                                            <button onClick={() => setSearchTerm("")} className="mt-2 text-blue-500 hover:underline text-sm font-semibold cursor-pointer">
                                                Clear all filters
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
                    <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className="border rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalItems}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-3 text-sm">
                                Page <span className="font-semibold mx-1">{currentPage}</span> of <span className="font-semibold ml-1">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}