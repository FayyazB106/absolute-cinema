import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';

interface Statuses {
    id: number;
    status: string;
}

export default function Statuses() {
    const [statuses, setStatuses] = useState<Statuses[]>([]);
    const [loading, setLoading] = useState(true);
    const [newStatuses, setNewStatuses] = useState({ status: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ status: '' });

    const fetchStatuses = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/status`);
            const data = await res.json();
            setStatuses(data);
        } catch (err) {
            console.error("Failed to fetch statuses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStatuses(); }, []);

    const handleAdd = async () => {
        if (!newStatuses.status) return alert("Fill the field");
        const res = await fetch(`${API_BASE_URL}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStatuses),
        });
        if (res.ok) {
            setNewStatuses({ status: '' });
            fetchStatuses();
        }
    };

    const handleUpdate = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/status/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditingId(null);
            fetchStatuses();
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) {
            await fetch(`${API_BASE_URL}/status/${id}`, { method: 'DELETE' });
            fetchStatuses();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">Statuses</h1>
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Row */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 mb-6 shadow-sm">
                    <input
                        placeholder="Status"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={newStatuses.status}
                        onChange={(e) => setNewStatuses({ ...newStatuses, status: e.target.value })}
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
                                <th className="px-6 py-4 font-bold text-gray-700">Statuses</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-center w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-10 animate-pulse text-gray-400">Loading statuses...</td></tr>
                            ) : statuses.map(statuses => (
                                <tr key={statuses.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === statuses.id ? (
                                            <input
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        ) : statuses.status}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {editingId === statuses.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(statuses.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:bg-gray-50 p-2 rounded-full"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(statuses.id);
                                                            setEditForm({ status: statuses.status });
                                                        }}
                                                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-full transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(statuses.id, statuses.status)}
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