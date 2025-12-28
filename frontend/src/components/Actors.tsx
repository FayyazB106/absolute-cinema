import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';

interface Actor {
    id: number;
    name_en: string;
    name_ar: string;
}

export default function Actors() {
    const [actors, setActors] = useState<Actor[]>([]);
    const [loading, setLoading] = useState(true);
    const [newActor, setNewActor] = useState({ name_en: '', name_ar: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name_en: '', name_ar: '' });

    const fetchActors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/actors`);
            const data = await res.json();
            setActors(data);
        } catch (err) {
            console.error("Failed to fetch actors", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchActors(); }, []);

    const handleAdd = async () => {
        if (!newActor.name_en || !newActor.name_ar) return alert("Fill both names");
        const res = await fetch(`${API_BASE_URL}/actors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newActor),
        });
        if (res.ok) {
            setNewActor({ name_en: '', name_ar: '' });
            fetchActors();
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/actors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditingId(null);
            fetchActors();
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) {
            await fetch(`${API_BASE_URL}/actors/${id}`, { method: 'DELETE' });
            fetchActors();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">Actors</h1>
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Row */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 mb-6 shadow-sm">
                    <input
                        placeholder="Name"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newActor.name_en}
                        onChange={(e) => setNewActor({ ...newActor, name_en: e.target.value })}
                    />
                    <input
                        placeholder="الاسم"
                        dir="rtl"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newActor.name_ar}
                        onChange={(e) => setNewActor({ ...newActor, name_ar: e.target.value })}
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
                                <tr><td colSpan={3} className="text-center py-10 animate-pulse text-gray-400">Loading actors...</td></tr>
                            ) : actors.map(actor => (
                                <tr key={actor.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === actor.id ? (
                                            <input
                                                value={editForm.name_en}
                                                onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : actor.name_en}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 text-right" dir="rtl">
                                        {editingId === actor.id ? (
                                            <input
                                                value={editForm.name_ar}
                                                onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                                className="border rounded px-2 py-1 w-full text-right"
                                            />
                                        ) : actor.name_ar}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {editingId === actor.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(actor.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(actor.id);
                                                            setEditForm({ name_en: actor.name_en, name_ar: actor.name_ar });
                                                        }}
                                                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(actor.id, actor.name_en)}
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