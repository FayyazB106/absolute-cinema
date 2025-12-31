import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';

interface Ratings {
    id: number;
    ranking: number,
    maturity_rating: string;
    name_en: string;
    name_ar: string;
}

export default function Ratings() {
    const [ratings, setRatings] = useState<Ratings[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRatings, setNewRatings] = useState({
        maturity_rating: '',
        name_en: '',
        name_ar: '',
        ranking: 1
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        maturity_rating: '',
        name_en: '',
        name_ar: '',
        ranking: 1
    });

    const fetchRatings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/ratings`);
            const data = await res.json();
            setRatings(data);
        } catch (err) {
            console.error("Failed to fetch maturity ratings", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRatings(); }, []);

    const handleAdd = async () => {
        if (!newRatings.maturity_rating) return alert("Fill the field");
        const res = await fetch(`${API_BASE_URL}/ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRatings),
        });
        if (res.ok) {
            setNewRatings({ ...newRatings });
            fetchRatings();
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/ratings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditingId(null);
            fetchRatings();
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) {
            await fetch(`${API_BASE_URL}/ratings/${id}`, { method: 'DELETE' });
            fetchRatings();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">Maturity Ratings</h1>
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Row */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 mb-6 shadow-sm">
                    <input
                        placeholder="Maturity Rating"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newRatings.ranking}
                        onChange={(e) => setNewRatings({ ...newRatings, ranking: Number(e.target.value) })}
                    />
                    <input
                        placeholder="Maturity Rating"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newRatings.maturity_rating}
                        onChange={(e) => setNewRatings({ ...newRatings, maturity_rating: e.target.value })}
                    />
                    <input
                        placeholder="Name EN"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newRatings.name_en}
                        onChange={(e) => setNewRatings({ ...newRatings, name_en: e.target.value })}
                    />
                    <input
                        placeholder="Name AR"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newRatings.name_ar}
                        dir="rtl"
                        onChange={(e) => setNewRatings({ ...newRatings, name_ar: e.target.value })}
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
                                <th className="px-6 py-4 font-bold text-gray-700">Ranking</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Maturity Ratings</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Name EN</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Name AR</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-center w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-10 animate-pulse text-gray-400">Loading maturities...</td></tr>
                            ) : ratings.map(ratings => (
                                <tr key={ratings.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900 text-center">
                                        {editingId === ratings.id ? (
                                            <input
                                                value={editForm.ranking}
                                                onChange={(e) => setEditForm({ ...editForm, ranking: Number(e.target.value) })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : ratings.ranking}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 text-center">
                                        {editingId === ratings.id ? (
                                            <input
                                                value={editForm.maturity_rating}
                                                onChange={(e) => setEditForm({ ...editForm, maturity_rating: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : ratings.maturity_rating}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === ratings.id ? (
                                            <input
                                                value={editForm.name_en}
                                                onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : ratings.name_en}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900" dir="rtl">
                                        {editingId === ratings.id ? (
                                            <input
                                                value={editForm.name_ar}
                                                onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                                dir="rtl"
                                            />
                                        ) : ratings.name_ar}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {editingId === ratings.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(ratings.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(ratings.id);
                                                            setEditForm({ ...ratings });
                                                        }}
                                                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ratings.id, ratings.maturity_rating)}
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