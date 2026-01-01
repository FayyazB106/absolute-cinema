import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';
import PlusButton from './shared/PlusButton';
import type { Genre } from '../types/movie';
import Title from './shared/Title';

export default function Genres() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [newGenre, setNewGenre] = useState({ name_en: '', name_ar: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name_en: '', name_ar: '' });

    const fetchGenres = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/genres`);
            const data = await res.json();
            setGenres(data);
        } catch (err) {
            console.error("Failed to fetch genres", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGenres(); }, []);

    const handleAdd = async () => {
        if (!newGenre.name_en || !newGenre.name_ar) return alert("Fill both names");
        const res = await fetch(`${API_BASE_URL}/genres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGenre),
        });
        if (res.ok) {
            setNewGenre({ name_en: '', name_ar: '' });
            fetchGenres();
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/genres/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditingId(null);
            fetchGenres();
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) {
            await fetch(`${API_BASE_URL}/genres/${id}`, { method: 'DELETE' });
            fetchGenres();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <Title text="Genres" />
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Row */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 mb-6 shadow-sm">
                    <input
                        placeholder="Name"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newGenre.name_en}
                        onChange={(e) => setNewGenre({ ...newGenre, name_en: e.target.value })}
                    />
                    <input
                        placeholder="الاسم"
                        dir="rtl"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newGenre.name_ar}
                        onChange={(e) => setNewGenre({ ...newGenre, name_ar: e.target.value })}
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
                                <tr><td colSpan={3} className="text-center py-10 animate-pulse text-gray-400">Loading genres...</td></tr>
                            ) : genres.map(genre => (
                                <tr key={genre.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === genre.id ? (
                                            <input
                                                value={editForm.name_en}
                                                onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : genre.name_en}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 text-right" dir="rtl">
                                        {editingId === genre.id ? (
                                            <input
                                                value={editForm.name_ar}
                                                onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                                className="border rounded px-2 py-1 w-full text-right"
                                            />
                                        ) : genre.name_ar}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {editingId === genre.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(genre.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(genre.id);
                                                            setEditForm({ name_en: genre.name_en, name_ar: genre.name_ar });
                                                        }}
                                                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(genre.id, genre.name_en)}
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