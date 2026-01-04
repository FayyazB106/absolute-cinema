import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../../constants/api';
import PlusButton from '../shared/PlusButton';
import Title from '../shared/Title';

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

export default function SimpleTablePage({ title, endpoint, singularName }: SimpleTablePageProps) {
    const [items, setItems] = useState<TableItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name_en: '', name_ar: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name_en: '', name_ar: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const quickInputStyle = "flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-0 outline-none"
    const inputStyle = "border rounded px-2 py-1 w-full"

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

    const handleAdd = async () => {
        if (!newItem.name_en || !newItem.name_ar) return alert("Fill both names");
        const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem),
        });
        if (res.ok) {
            setNewItem({ name_en: '', name_ar: '' });
            fetchItems();
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditingId(null);
            fetchItems();
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const itemType = singularName || endpoint.slice(0, -1); // Remove 's' from plural
        if (window.confirm(`Delete ${itemType} "${name}"?`)) {
            await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
            fetchItems();
        }
    };

    // Calculate pagination
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

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
                {/* Quick Add Row */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 mb-6 shadow-sm">
                    <input
                        placeholder="Name"
                        className={quickInputStyle}
                        value={newItem.name_en}
                        onChange={(e) => setNewItem({ ...newItem, name_en: e.target.value })}
                    />
                    <input
                        placeholder="الاسم"
                        dir="rtl"
                        className={quickInputStyle}
                        value={newItem.name_ar}
                        onChange={(e) => setNewItem({ ...newItem, name_ar: e.target.value })}
                    />
                    <PlusButton onClick={handleAdd} />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Name</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-right">الاسم</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-center w-32">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-10 animate-pulse text-gray-400">Loading {endpoint}...</td></tr>
                            ) : paginatedItems.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === item.id ? (
                                            <input
                                                value={editForm.name_en}
                                                onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                                className={inputStyle}
                                            />
                                        ) : item.name_en}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 text-right">
                                        {editingId === item.id ? (
                                            <input
                                                value={editForm.name_ar}
                                                onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                                className={inputStyle}
                                                dir="rtl"
                                            />
                                        ) : item.name_ar}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {editingId === item.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(item.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(item.id);
                                                            setEditForm({ name_en: item.name_en, name_ar: item.name_ar });
                                                        }}
                                                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.name_en)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                                className="px-4 py-2 border rounded-lg text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-3 text-sm">
                                Page <span className="font-semibold mx-1">{currentPage}</span> of <span className="font-semibold ml-1">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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