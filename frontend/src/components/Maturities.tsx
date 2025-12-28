import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';

interface Maturities {
    id: number;
    maturity: string;
}

export default function Maturities() {
    const [maturities, setMaturities] = useState<Maturities[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMaturities, setNewMaturities] = useState({ maturity: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ maturity: '' });

    const fetchMaturities = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/maturity`);
            const data = await res.json();
            setMaturities(data);
        } catch (err) {
            console.error("Failed to fetch maturities", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMaturities(); }, []);

    const handleAdd = async () => {
        if (!newMaturities.maturity) return alert("Fill the field");
        const res = await fetch(`${API_BASE_URL}/maturity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMaturities),
        });
        if (res.ok) {
            setNewMaturities({ maturity: '' });
            fetchMaturities();
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/maturity/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditingId(null);
            fetchMaturities();
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) {
            await fetch(`${API_BASE_URL}/maturity/${id}`, { method: 'DELETE' });
            fetchMaturities();
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
                        value={newMaturities.maturity}
                        onChange={(e) => setNewMaturities({ ...newMaturities, maturity: e.target.value })}
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
                                <th className="px-6 py-4 font-bold text-gray-700">Maturity Ratings</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-center w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-10 animate-pulse text-gray-400">Loading maturities...</td></tr>
                            ) : maturities.map(maturities => (
                                <tr key={maturities.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === maturities.id ? (
                                            <input
                                                value={editForm.maturity}
                                                onChange={(e) => setEditForm({ ...editForm, maturity: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : maturities.maturity}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {editingId === maturities.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(maturities.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(maturities.id);
                                                            setEditForm({ maturity: maturities.maturity });
                                                        }}
                                                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(maturities.id, maturities.maturity)}
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