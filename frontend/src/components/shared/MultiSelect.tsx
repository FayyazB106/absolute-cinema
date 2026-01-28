import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import Asterisk from './Asterisk';
import { useTranslation } from 'react-i18next';

interface Option {
    id: number;
    name_en: string;
    name_ar?: string;
    code?: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
}

export default function MultiSelect({ label, options, selected, onChange, placeholder, error, required }: MultiSelectProps) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // If the menu is open and the click target is NOT inside our container, close it
            if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // Attach the listener
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the listener when component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]); // Re-run when isOpen changes

    const filteredOptions = options.filter(option => {
        const searchLower = search.toLowerCase();
        const matchesEn = option.name_en.toLowerCase().includes(searchLower);
        const matchesAr = option.name_ar?.toLowerCase().includes(searchLower);
        return matchesEn || matchesAr;
    });

    const handleToggle = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const getDisplayText = () => {
        if (selected.length === 0) return placeholder || t("movie_form.select_placeholder");
        if (selected.length === 1) {
            const item = options.find(o => o.id.toString() === selected[0]);
            return (isEnglish ? item?.name_en : item?.name_ar) || t('movie_form.selected');
        }
        return t('movie_form.items_selected', { count: selected.length });
    };

    return (
        <div className="flex flex-col">
            <label className="font-bold text-md mb-2 db-label">{label} {required && <Asterisk />}</label>

            <div className='relative' ref={containerRef}>
                {/* Dropdown Trigger */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`db-input border ${error ? 'border-red-500' : 'db-border'} rounded p-3 flex justify-between items-center hover:opacity-90 transition w-full`}
                >
                    <span className="db-text">{getDisplayText()}</span>
                    {isOpen ? <ChevronUp size={20} className="db-text-secondary" /> : <ChevronDown size={20} className="db-text-secondary" />}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 db-movieBG border db-border rounded shadow-lg z-50 max-h-72 flex flex-col">
                        {/* Search Bar */}
                        <div className="p-3 border-b db-divider sticky top-0 db-movieBG">
                            <div className="relative">
                                <div className={`absolute ${isEnglish ? "right-3" : "left-3"} top-2.5 flex items-center`}>
                                    {search ? (
                                        // Close/Clear Button (Visible when text exists)
                                        <button onClick={() => { setSearch("") }} className="db-text-secondary hover:db-text cursor-pointer">
                                            <X size={18} />
                                        </button>
                                    ) : (
                                        // Search Icon (Visible when empty)
                                        <div className="db-text-secondary">
                                            <Search size={18} />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder={t("movie_form.search_placeholder")}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full p-2 db-input border db-border rounded focus:outline-none db-focus-border"
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto flex-1 no-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="p-4 text-center db-text-secondary">{t("movie_form.no_options")}</div>
                            ) : (
                                filteredOptions.sort((a, b) => a.name_en.localeCompare(b.name_en)).map(option => (
                                    <label key={option.id} className="flex items-center gap-3 p-3 cursor-pointer transition db-hover-light">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(option.id.toString())}
                                            onChange={() => handleToggle(option.id.toString())}
                                            className="w-4 h-4 rounded cursor-pointer db-checkbox"
                                        />
                                        <span className="flex-1 db-text">{isEnglish ? option.name_en : option.name_ar}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Selected Items Display */}
                {selected.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selected.map(id => {
                            const item = options.find(o => o.id.toString() === id);
                            if (!item) return null;
                            return (
                                <span key={id} className="db-badge-select px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                    {isEnglish ? item.name_en : item.name_ar}
                                    <button type="button" onClick={() => handleToggle(id)} className="db-badge-select-hover rounded-full cursor-pointer"><X size={14} /></button>
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}