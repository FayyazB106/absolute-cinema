import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

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
}

export default function MultiSelect({ label, options, selected, onChange, placeholder, error }: MultiSelectProps) {
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

    const filteredOptions = options.filter(option =>
        option.name_en.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggle = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const getDisplayText = () => {
        if (selected.length === 0) return placeholder || 'Select...';
        if (selected.length === 1) {
            const item = options.find(o => o.id.toString() === selected[0]);
            return item?.name_en || 'Selected';
        }
        return `${selected.length} selected`;
    };

    return (
        <div className="flex flex-col">
            <label className="font-bold text-md mb-2">{label}</label>

            <div className='relative' ref={containerRef}>
                {/* Dropdown Trigger */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`border ${error ? 'border-red-500' : ''} rounded p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition w-full`}
                >
                    <span>{getDisplayText()}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-72 flex flex-col">
                        {/* Search Bar */}
                        <div className="p-3 border-b sticky top-0 bg-white rounded">
                            <div className="relative">
                                <div className="absolute right-3 top-2.5 flex items-center">
                                    {search ? (
                                        // Close/Clear Button (Visible when text exists)
                                        <button onClick={() => { setSearch("") }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                            <X size={18} />
                                        </button>
                                    ) : (
                                        // Search Icon (Visible when empty)
                                        <div className="text-gray-400">
                                            <Search size={18} />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full p-2 border rounded focus:outline-none focus:border-blue-400"
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto flex-1 no-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No options found</div>
                            ) : (
                                filteredOptions.sort((a, b) => a.name_en.localeCompare(b.name_en)).map(option => (
                                    <label key={option.id} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(option.id.toString())}
                                            onChange={() => handleToggle(option.id.toString())}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="flex-1 text-gray-900">{option.name_en}</span>
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
                                <span
                                    key={id}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                    {item.name_en}
                                    <button
                                        type="button"
                                        onClick={() => handleToggle(id)}
                                        className="hover:bg-blue-200 rounded-full"
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}