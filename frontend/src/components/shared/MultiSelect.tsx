import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

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

    const handleSelectAll = () => {
        if (selected.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(o => o.id.toString()));
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
        <div className="flex flex-col relative">
            <label className="font-bold mb-2">{label}</label>
            
            {/* Dropdown Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`border ${error ? 'border-red-500' : ''} rounded p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition`}
            >
                <span>{getDisplayText()}</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-72 flex flex-col">
                    {/* Search Bar */}
                    <div className="p-3 border-b sticky top-0 bg-white">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Select All Button */}
                    <div className="p-2 border-b bg-gray-50">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm font-semibold text-blue-600"
                        >
                            {selected.length === options.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No options found</div>
                        ) : (
                            filteredOptions.map(option => (
                                <label
                                    key={option.id}
                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option.id.toString())}
                                        onChange={() => handleToggle(option.id.toString())}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="flex-1 text-gray-900">
                                        {option.name_en}
                                        {option.code && <span className="text-gray-500 ml-2">({option.code})</span>}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>

                    {/* Close Button */}
                    <div className="p-2 border-t bg-gray-50">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
                        >
                            Done
                        </button>
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
    );
}