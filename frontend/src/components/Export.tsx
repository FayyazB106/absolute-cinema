import { useState } from 'react';
import * as XLSX from 'xlsx';
import Title from './shared/Title';
import { API_BASE_URL } from '../constants/api';
import { movieService } from '../services/movieService';
import { toast } from './shared/Toast';
import { useTranslation } from "react-i18next";

interface TableOption {
    id: string;
    name: string;
    endpoint: string;
    fetchFn: () => Promise<any>;
}

export default function Export() {
    const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
    const [isExporting, setIsExporting] = useState(false);
    const { t } = useTranslation();

    const tableOptions: TableOption[] = [
        {
            id: 'movies',
            name: t("nav.movies"),
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
            name: t('nav.actors'),
            endpoint: 'actors',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/actors`);
                return res.json();
            }
        },
        {
            id: 'directors',
            name: t('nav.directors'),
            endpoint: 'directors',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/directors`);
                return res.json();
            }
        },
        {
            id: 'genres',
            name: t('nav.genres'),
            endpoint: 'genres',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/genres`);
                return res.json();
            }
        },
        {
            id: 'languages',
            name: t('nav.languages'),
            endpoint: 'languages',
            fetchFn: async () => {
                const res = await fetch(`${API_BASE_URL}/languages`);
                return res.json();
            }
        },
        {
            id: 'ratings',
            name: t('nav.ratings'),
            endpoint: 'ratings',
            fetchFn: async () => {
                const data = await movieService.getRatings();
                return data;
            }
        },
        {
            id: 'statuses',
            name: t('nav.statuses'),
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
            toast.error(t('export.error_none'));
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading(t('export.preparing'));

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
                            if (item.bg_color) row['Background Color (#)'] = item.bg_color;
                            if (item.text_color) row['Text Color (#)'] = item.text_color;
                            if (item.ring_color) row['Border/Ring Color (#)'] = item.ring_color;
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

            const fileName = `Absolute-Cinema-Dataset.xlsx`;
            XLSX.writeFile(workbook, fileName);
            toast.success(t('export.success', { count: selectedTables.size }), { id: toastId });
        } catch (err) {
            console.error('Export failed', err);
            toast.error(t('export.error_failed'), { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-8 db-mainBG min-h-screen dark-transition">
            <div className="flex justify-between items-center mb-8">
                <Title text={t("titles.export")} />
            </div>

            <div className='max-w-2xl mx-auto'>
                <div className="rounded-xl shadow-md border db-border db-movieBG p-6 dark-transition">
                    <h2 className="text-lg font-bold mb-6 db-text">{t("export.subheading")}</h2>

                    <div className="space-y-4 mb-6">
                        {/* Select All Option */}
                        <div onClick={selectAll} className="flex items-center p-3 db-select-all rounded-lg border db-border cursor-pointer transition shadow-sm dark-transition">
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={selectedTables.size === tableOptions.length}
                                onChange={(e) => e.stopPropagation()}
                                className="w-5 h-5 cursor-pointer db-checkbox"
                            />
                            <label htmlFor="select-all" className="mx-3 cursor-pointer font-semibold db-text flex-grow" onClick={(e) => e.preventDefault()}>
                                {t("export.select_all")} ({selectedTables.size}/{tableOptions.length})
                            </label>
                        </div>

                        {/* Table Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tableOptions.map(table => (
                                <div
                                    key={table.id}
                                    onClick={() => toggleTable(table.id)}
                                    className={`flex items-center p-3 border rounded-lg transition cursor-pointer ${
                                        selectedTables.has(table.id)
                                            ? 'db-info-box-blue'
                                            : 'db-option-hover'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        id={table.id}
                                        checked={selectedTables.has(table.id)}
                                        onChange={(e) => e.stopPropagation()}
                                        className="w-4 h-4 cursor-pointer db-checkbox"
                                    />
                                    <label htmlFor={table.id} className="mx-3 cursor-pointer db-text flex-grow" onClick={(e) => e.preventDefault()}>
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
                        className="w-full px-6 py-3 db-btn-export font-semibold rounded-lg disabled:cursor-not-allowed transition dark-transition"
                    >
                        {isExporting ? t(("export.exporting")) : t('export.button_label', { count: selectedTables.size })}
                    </button>
                </div>

                {/* Info Section */}
                <div className="mt-6 db-info-box-blue rounded-xl p-4 dark-transition">
                    <h3 className="font-semibold db-text-info mb-2">{t("export.info")}</h3>
                    <ul className="text-md db-text-info space-y-1 list-disc list-inside">
                        <li>{t("export.info_point1")}</li>
                        <li>{t("export.info_point2")}</li>
                    </ul>
                </div>
            </div>
        </div >
    );
}