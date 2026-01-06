import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import PlusButton from './shared/PlusButton';
import type { Rating } from '../types/movie';
import Title from './shared/Title';
import { movieService } from '../services/movieService';
import { validateRating } from '../utils/validation';

export default function Ratings() {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
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
    const quickInputStyle = "flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-0 outline-none"
    const inputStyle = "border rounded px-2 py-1 w-full"
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

    const handleAdd = async () => {
        const localErrors = validateRating(newRatings);
        if (Object.keys(localErrors).length > 0) {
            setAddErrors(localErrors);
            return;
        }

        const res = await movieService.createRating(newRatings);
        if (res.ok) {
            setNewRatings({
                maturity_rating: '',
                name_en: '',
                name_ar: '',
                ranking: 1
            });
            setAddErrors({});
            fetchRatings();
        } else if (res.status === 422) {
            const data = await res.json();
            const backendErrors: any = {};
            Object.keys(data.errors).forEach(key => {
                let msg = data.errors[key][0];
                // CUSTOM ERROR MESSAGE LOGIC
                if (msg === "The maturity rating has already been taken.") {
                    msg = "Rating must be unique";
                }
                backendErrors[key] = msg;
            });
            setAddErrors(backendErrors);
        }
    };

    const handleUpdate = async (id: number) => {
        const localErrors = validateRating(editForm);
        if (Object.keys(localErrors).length > 0) {
            setEditErrors(localErrors);
            return;
        }

        const res = await movieService.updateRating(id, editForm);
        if (res.ok) {
            setEditingId(null);
            setEditErrors({});
            fetchRatings();
        } else if (res.status === 422) {
            const data = await res.json();
            const backendErrors: any = {};
            Object.keys(data.errors).forEach(key => {
                let msg = data.errors[key][0];
                // CUSTOM ERROR MESSAGE LOGIC
                if (msg === "The maturity rating has already been taken.") {
                    msg = "Rating must be unique";
                }
                backendErrors[key] = msg;
            });
            setEditErrors(backendErrors);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) {
            const res = await movieService.deleteRating(id);
            if (res.ok) fetchRatings();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <Title text="Maturity Ratings" />
            </div>
            <div className='max-w-7xl mx-auto flex flex-col justify-center'>
                {/* Quick Add Row */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 mb-6 shadow-sm">
                    <div className="flex flex-col w-full">
                        <input
                            placeholder="Ranking"
                            type="number"
                            className={quickInputStyle}
                            value={newRatings.ranking}
                            onChange={(e) => setNewRatings({ ...newRatings, ranking: Number(e.target.value) })}
                        />
                        {addErrors.maturity_rating && <br />} {/* Dummy space to maintain height */}
                    </div>
                    <div className="flex flex-col w-full">
                        <input
                            placeholder="Maturity Rating"
                            className={`${quickInputStyle} ${(addErrors.maturity_rating) ? 'border-red-500' : ''}`}
                            value={newRatings.maturity_rating}
                            onChange={(e) => {
                                setNewRatings({ ...newRatings, maturity_rating: e.target.value });
                                // Clear error as user types
                                if (addErrors.maturity_rating) setAddErrors({ ...addErrors, maturity_rating: '' });
                            }}
                        />
                        {addErrors.maturity_rating && (<span className={errorStyle}>{addErrors.maturity_rating}</span>)}
                    </div>
                    <div className="flex flex-col w-full">
                        <input
                            placeholder="Name"
                            className={quickInputStyle}
                            value={newRatings.name_en}
                            onChange={(e) => setNewRatings({ ...newRatings, name_en: e.target.value })}
                        />
                        {addErrors.maturity_rating && <br />} {/* Dummy space to maintain height */}
                    </div>
                    <div className="flex flex-col w-full">
                        <input
                            placeholder="الاسم"
                            className={quickInputStyle}
                            value={newRatings.name_ar}
                            dir="rtl"
                            onChange={(e) => setNewRatings({ ...newRatings, name_ar: e.target.value })}
                        />
                        {addErrors.maturity_rating && <br />} {/* Dummy space to maintain height */}
                    </div>
                    <div><PlusButton onClick={handleAdd} /></div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Ranking</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Maturity Ratings</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Name</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-right">الاسم</th>
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
                                            <div className='flex flex-col'>
                                                <input
                                                    value={editForm.ranking}
                                                    type="number"
                                                    onChange={(e) => setEditForm({ ...editForm, ranking: Number(e.target.value) })}
                                                    className={inputStyle}
                                                />
                                                {editErrors.maturity_rating && <br />} {/* Dummy space to maintain height */}
                                            </div>
                                        ) : ratings.ranking}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 flex justify-center">
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
                                                {editErrors.maturity_rating && (<span className="text-xs text-red-500 text-left">{editErrors.maturity_rating}</span>)}
                                            </div>
                                        ) : ratings.maturity_rating}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        {editingId === ratings.id ? (
                                            <div className='flex flex-col'>
                                                <input
                                                    value={editForm.name_en}
                                                    onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                                    className={inputStyle}
                                                />
                                                {editErrors.maturity_rating && <br />} {/* Dummy space to maintain height */}
                                            </div>
                                        ) : ratings.name_en}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 text-right">
                                        {editingId === ratings.id ? (
                                            <div className='flex flex-col'>
                                                <input
                                                    value={editForm.name_ar}
                                                    onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                                    className={inputStyle}
                                                    dir="rtl"
                                                />
                                                {editErrors.maturity_rating && <br />} {/* Dummy space to maintain height */}
                                            </div>
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
        </div >
    );
}