import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';

interface Director {
    id: number;
    name_en: string;
    name_ar: string;
}

export default function Directors() {
    const [directors, setDirectors] = useState<Director[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDirector, setNewDirector] = useState({ name_en: '', name_ar: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name_en: '', name_ar: '' });

    const fetchDirectors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/directors`);
            const data = await res.json();
            setDirectors(data);
        } catch (err) {
            console.error("Failed to fetch directors", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDirectors(); }, []);

    const handleAdd = async () => {
        if (!newDirector.name_en || !newDirector.name_ar) return alert("Fill both names");
        const res = await fetch(`${API_BASE_URL}/directors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDirector),
        });
        if (res.ok) {
            setNewDirector({ name_en: '', name_ar: '' });
            fetchDirectors();
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/directors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditingId(null);
            fetchDirectors();
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) {
            await fetch(`${API_BASE_URL}/directors/${id}`, { method: 'DELETE' });
            fetchDirectors();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">Directors</h1>
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Row */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 mb-6 shadow-sm">
                    <input
                        placeholder="Name"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newDirector.name_en}
                        onChange={(e) => setNewDirector({ ...newDirector, name_en: e.target.value })}
                    />
                    <input
                        placeholder="الاسم"
                        dir="rtl"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newDirector.name_ar}
                        onChange={(e) => setNewDirector({ ...newDirector, name_ar: e.target.value })}
                    />
                    <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition">
                        <Plus size={18} /> Add
                    </button>
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
                                <tr><td colSpan={3} className="text-center py-10 animate-pulse text-gray-400">Loading directors...</td></tr>
                            ) : directors.map(director => (
                                <tr key={director.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === director.id ? (
                                            <input
                                                value={editForm.name_en}
                                                onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : director.name_en}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 text-right" dir="rtl">
                                        {editingId === director.id ? (
                                            <input
                                                value={editForm.name_ar}
                                                onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                                className="border rounded px-2 py-1 w-full text-right"
                                            />
                                        ) : director.name_ar}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {editingId === director.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(director.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(director.id);
                                                            setEditForm({ name_en: director.name_en, name_ar: director.name_ar });
                                                        }}
                                                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(director.id, director.name_en)}
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
            </div>
        </div>
    );
}