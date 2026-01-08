import { useState } from 'react';
import * as XLSX from 'xlsx';
import Title from './shared/Title';
import { API_BASE_URL } from '../constants/api';
import { movieService } from '../services/movieService';
import toast, { Toaster } from 'react-hot-toast';

interface TableOption {
    id: string;
    name: string;
    endpoint: string;
    fetchFn: () => Promise<any>;
}

export default function Export() {
    const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
    const [isExporting, setIsExporting] = useState(false);

    const tableOptions: TableOption[] = [
        {
            id: 'movies',
            name: 'Movies',
            endpoint: 'movies',
            fetchFn: async () => {
                const movies = await movieService.getMovies();
                // Fetch full details for each movie to get related data
                const movieDetails = await Promise.all(
                    movies.map(movie => movieService.getMovieById(movie.id))
                );
                return movieDetails;
            }
        },
        {
            id: 'actors',
            name: 'Actors',
            endpoint: 'actors',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/actors`);
                return res.json();
            }
        },
        {
            id: 'directors',
            name: 'Directors',
            endpoint: 'directors',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/directors`);
                return res.json();
            }
        },
        {
            id: 'genres',
            name: 'Genres',
            endpoint: 'genres',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/genres`);
                return res.json();
            }
        },
        {
            id: 'languages',
            name: 'Languages',
            endpoint: 'languages',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/languages`);
                return res.json();
            }
        },
        {
            id: 'ratings',
            name: 'Ratings',
            endpoint: 'ratings',
            fetchFn: async () => {
                const data = await movieService.getRatings();
                return data;
            }
        },
        {
            id: 'statuses',
            name: 'Statuses',
            endpoint: 'statuses',
            fetchFn: async () => {
                const data = await movieService.getStatuses();
                return data;
            }
        }
    ];

    const toggleTable = (tableId: string) => {
        const newSelected = new Set(selectedTables);
        if (newSelected.has(tableId)) {
            newSelected.delete(tableId);
        } else {
            newSelected.add(tableId);
        }
        setSelectedTables(newSelected);
    };

    const selectAll = () => {
        if (selectedTables.size === tableOptions.length) {
            setSelectedTables(new Set());
        } else {
            setSelectedTables(new Set(tableOptions.map(t => t.id)));
        }
    };

    const handleExport = async () => {
        if (selectedTables.size === 0) {
            toast.error('Please select at least one table to export');
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading('Preparing your export...');

        try {
            const workbook = XLSX.utils.book_new();

            // Fetch data for all selected tables
            for (const tableId of selectedTables) {
                const table = tableOptions.find(t => t.id === tableId);
                if (!table) continue;

                try {
                    const data = await table.fetchFn();
                    const sortedData = [...data].sort((a, b) => (a.id || 0) - (b.id || 0));

                    const transformedData = sortedData.map((item: any) => {
                        const row: any = {};
                        if (item.id) row['ID'] = item.id;

                        // For Movies table
                        if (tableId === 'movies') {
                            if (item.name_en) row['Title (English)'] = item.name_en;
                            if (item.name_ar) row['Title (Arabic)'] = item.name_ar;
                            if (item.desc_en) row['Description (English)'] = item.desc_en;
                            if (item.desc_ar) row['Description (Arabic)'] = item.desc_ar;
                            if (item.release_date) row['Release Date'] = new Date(item.release_date).toLocaleDateString("en-GB");
                            if (item.duration) row['Duration (mins)'] = item.duration;
                            if (item.imdb_url) row['IMDb URL'] = item.imdb_url;
                            if (item.maturity_ratings) row['Maturity Rating'] = item.maturity_ratings.maturity_rating;
                            if (item.status) row['Status'] = item.status.name_en;
                            if (item.genres && item.genres.length > 0) {
                                row['Genres'] = item.genres.map((g: any) => g.name_en).join('; ');
                            }
                            if (item.actors && item.actors.length > 0) {
                                row['Actors'] = item.actors.map((a: any) => a.name_en).join('; ');
                            }
                            if (item.directors && item.directors.length > 0) {
                                row['Directors'] = item.directors.map((d: any) => d.name_en).join('; ');
                            }
                            if (item.audio_languages && item.audio_languages.length > 0) {
                                row['Languages'] = item.audio_languages.map((l: any) => l.name_en).join('; ');
                            }
                            if (item.subtitles && item.subtitles.length > 0) {
                                row['Subtitles'] = item.subtitles.map((l: any) => l.name_en).join('; ');
                            }
                            if (item.is_featured !== undefined) row['Featured'] = item.is_featured ? 'Yes' : 'No';
                            if (item.created_at) row['Created'] = new Date(item.created_at).toLocaleDateString("en-GB");
                            if (item.updated_at) row['Updated'] = new Date(item.updated_at).toLocaleDateString("en-GB");
                        } else {
                            // For other tables
                            if (item.ranking) row['Ranking'] = item.ranking;
                            if (item.maturity_rating) row['Maturity Rating'] = item.maturity_rating;
                            if (item.name_en) row['Name (English)'] = item.name_en;
                            if (item.name_ar) row['Name (Arabic)'] = item.name_ar;
                            if (item.status) row['Status'] = item.status;
                            if (item.created_at) row['Created'] = new Date(item.created_at).toLocaleDateString("en-GB");
                            if (item.updated_at) row['Updated'] = new Date(item.updated_at).toLocaleDateString("en-GB");
                        }
                        return row;
                    });

                    const worksheet = XLSX.utils.json_to_sheet(transformedData);
                    const colWidths = Object.keys(transformedData[0] || {}).map(key => {
                        if (key === 'ID') {
                            return { wch: 6 };
                        }
                        if (key === 'Ranking') {
                            return { wch: 9 };
                        }
                        if (key.includes('Description') || key.includes('Genres') || key.includes('Actors') || key.includes('Directors') || key.includes('Languages')) {
                            return { wch: 30 };
                        }
                        return { wch: Math.max(key.length, 15) };
                    });
                    worksheet['!cols'] = colWidths;

                    XLSX.utils.book_append_sheet(workbook, worksheet, table.name);
                } catch (err) {
                    console.error(`Failed to fetch ${table.name}`, err);
                }
            }

            const fileName = `Absolute-Cinema-Data.xlsx`;
            XLSX.writeFile(workbook, fileName);
            toast.success(`Successfully exported ${selectedTables.size} tables`, { id: toastId });
        } catch (err) {
            console.error('Export failed', err);
            toast.error('Export failed. Please try again.', { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-8">
            <Toaster position="bottom-right" toastOptions={{ success: { style: { background: 'green', color: 'white' } } }} />

            <div className="flex justify-between items-center mb-8">
                <Title text="Export to Excel" />
            </div>

            <div className='max-w-2xl mx-auto'>
                <div className="bg-white rounded-xl shadow-md border p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Select Tables to Export</h2>

                    <div className="space-y-4 mb-6">
                        {/* Select All Option */}
                        <div
                            onClick={selectAll}
                            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition shadow-sm"
                        >
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={selectedTables.size === tableOptions.length}
                                onChange={(e) => e.stopPropagation()}
                                className="w-5 h-5 cursor-pointer"
                            />
                            <label
                                htmlFor="select-all"
                                className="ml-3 cursor-pointer font-semibold text-gray-700 flex-grow"
                                onClick={(e) => e.preventDefault()}
                            >
                                Select All Tables ({selectedTables.size}/{tableOptions.length})
                            </label>
                        </div>

                        {/* Table Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tableOptions.map(table => (
                                <div
                                    key={table.id}
                                    onClick={() => toggleTable(table.id)}
                                    className={`flex items-center p-3 border rounded-lg transition cursor-pointer ${selectedTables.has(table.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={table.id}
                                        checked={selectedTables.has(table.id)}
                                        onChange={(e) => e.stopPropagation()}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                    <label
                                        htmlFor={table.id}
                                        className="ml-3 cursor-pointer text-gray-700 flex-grow"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {table.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting || selectedTables.size === 0}
                        className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {isExporting ? 'Exporting...' : `Export Selected Tables (${selectedTables.size})`}
                    </button>
                </div>

                {/* Info Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Export Info</h3>
                    <ul className="text-md text-blue-800 space-y-1 list-disc list-inside">
                        <li>Each selected table will be exported as a separate sheet</li>
                        <li>All sheets will be in a single Excel file</li>
                    </ul>
                </div>
            </div>
        </div >
    );
}