import { useState, useEffect } from 'react';
import { Palette, Save, RefreshCw, ChevronDown } from 'lucide-react';
import Title from './shared/Title';
import { API_BASE_URL } from '../constants/api';
import type { Language } from '../types/movie';
import { movieService } from '../services/movieService';
import { toast } from './shared/Toast';
import { useTranslation } from 'react-i18next';

export default function LanguageStyler() {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
    const [editedLanguage, setEditedLanguage] = useState<Language | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadLanguages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/languages`);
            const data = await response.json();
            setLanguages(data);
            if (data.length > 0 && !selectedLanguageId) {
                setSelectedLanguageId(data[0].id);
                setEditedLanguage({ ...data[0] });
            }
        } catch (error) {
            console.error('Failed to load languages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLanguages();
    }, []);

    useEffect(() => {
        if (selectedLanguageId) {
            const lang = languages.find(l => l.id === selectedLanguageId);
            if (lang) {
                setEditedLanguage({ ...lang });
            }
        }
    }, [selectedLanguageId, languages]);

    // Default colors
    const DEFAULT_BG_COLOR = '6b7280';
    const DEFAULT_TEXT_COLOR = 'ffffff';
    const DEFAULT_RING_COLOR = '6b7280';

    // Normalize hex to include # prefix for color input
    const normalizeHex = (hex: string | null | undefined, defaultHex: string): string => {
        if (!hex) return `#${defaultHex}`;
        const cleaned = hex.replace('#', '');
        return cleaned ? `#${cleaned}` : `#${defaultHex}`;
    };

    // Strip # prefix and limit to 6 characters
    const stripHex = (hex: string): string => {
        return hex.replace('#', '').slice(0, 6);
    };

    const updateColor = (field: 'bg_color' | 'text_color' | 'ring_color', hex: string) => {
        if (!editedLanguage) return;

        const sanitized = hex
            .replace('#', '')
            .replace(/[^0-9A-Fa-f]/g, '')
            .slice(0, 6);

        // Use stripped value or fall back to default
        const finalValue = sanitized || (
            field === 'bg_color' ? DEFAULT_BG_COLOR :
                field === 'text_color' ? DEFAULT_TEXT_COLOR :
                    DEFAULT_RING_COLOR
        );
        setEditedLanguage({ ...editedLanguage, [field]: finalValue });
    };

    const handleSave = async () => {
        if (!editedLanguage) return;

        setSaving(true);
        const toastId = toast.loading(t("languageStyler.submitting"));
        try {
            const response = await movieService.updateLanguageColors(editedLanguage.id, {
                bg_color: editedLanguage.bg_color,
                text_color: editedLanguage.text_color,
                ring_color: editedLanguage.ring_color,
            });

            if (!response.ok) {
                toast.error(t("languageStyler.update_failed", { name: editedLanguage.name_en }));
            }

            toast.success(t("languageStyler.save_success"), { id: toastId })
            setLanguages(prevLanguages =>
                prevLanguages.map(lang =>
                    lang.id === editedLanguage.id ? editedLanguage : lang
                )
            );
        } catch (error) {
            console.error('Failed to save language style:', error);
            toast.error(t("languageStyler.save_error"), { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (selectedLanguageId) {
            const original = languages.find(l => l.id === selectedLanguageId);
            if (original) {
                setEditedLanguage({ ...original });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-10 space-y-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!editedLanguage) {
        return <div className="p-10 text-center text-xl">{t("languageStyler.empty")}</div>;
    }

    const bgHex = normalizeHex(editedLanguage.bg_color, DEFAULT_BG_COLOR);
    const textHex = normalizeHex(editedLanguage.text_color, DEFAULT_TEXT_COLOR);
    const ringHex = normalizeHex(editedLanguage.ring_color, DEFAULT_RING_COLOR);

    // Preview styles using inline CSS for accurate color display
    const previewStyle = {
        backgroundColor: bgHex,
        color: textHex,
        boxShadow: `0 0 0 8px ${ringHex}`
    };
    const previewClass = "px-27 py-9 rounded-full text-3xl font-bold uppercase shadow-md text-center"

    const renderColorPicker = (label: string, field: 'bg_color' | 'text_color' | 'ring_color') => {
        // Determine the current hex based on the field
        const currentHex = field === 'bg_color' ? bgHex : field === 'text_color' ? textHex : ringHex;
        const placeholder = field === 'text_color' ? "ffffff" : "6b7280";

        return (
            <div className="flex items-center gap-6">
                <div className="flex-1">
                    <label className="block text-xl font-semibold mb-3">{label}</label>
                    <div className="flex items-center gap-4">
                        {/* The Visual Color Picker */}
                        <input type="color" value={currentHex} onChange={(e) => updateColor(field, e.target.value)} className="w-24 h-24 rounded-lg cursor-pointer" />

                        {/* The Text Input */}
                        <div className="flex-1">
                            <input
                                type="text"
                                value={stripHex(currentHex)}
                                maxLength={6}
                                onChange={(e) => updateColor(field, e.target.value)}
                                placeholder={placeholder}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all font-mono uppercase"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">{t("languageStyler.hex_hint")}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <Title text={t("titles.playground")} />
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        disabled={saving}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw size={18} />
                        {t("languageStyler.reset")}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        <Save size={18} />
                        {saving ? t("languageStyler.saving") : t("languageStyler.save")}
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Palette className="text-purple-600 mt-0.5" size={20} />
                <p className="text-purple-900 font-medium mb-1">{t("languageStyler.customize")}</p>
            </div>

            {/* Language Selection Dropdown */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t("languageStyler.select")}</label>
                <div className="relative max-w-md">
                    <select
                        value={selectedLanguageId || ''}
                        onChange={(e) => setSelectedLanguageId(Number(e.target.value))}
                        className="w-full p-4 pr-10 border text-lg cursor-pointer bg-white appearance-none"
                    >
                        {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>
                                {isEnglish
                                    ? `${lang.name_en} (${lang.name_ar})`
                                    : `${lang.name_ar} (${lang.name_en})`
                                }
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
            </div>

            {/* Styling Card */}
            <div className="border rounded-xl p-8 bg-white shadow-lg">
                <div dir="ltr" className="flex items-center justify-between mb-8 pb-6 border-b text-3xl font-bold text-black">
                    <p>{editedLanguage.name_en}</p>
                    <p>{editedLanguage.name_ar}</p>
                </div>

                <div className='flex flex-row justify-between'>
                    {/* Color Pickers */}
                    <div className="flex flex-row justify-evenly w-full">
                        {renderColorPicker(t("languageStyler.bg_color"), 'bg_color')}
                        {renderColorPicker(t("languageStyler.text_color"), 'text_color')}
                        {renderColorPicker(t("languageStyler.ring_color"), 'ring_color')}
                    </div>

                    {/* Live Preview */}
                    <div className="flex flex-col items-center gap-3 pointer-events-none select-none">
                        <div className='flex flex-col gap-6'>
                            <div style={previewStyle} className={previewClass}>{editedLanguage.name_en}</div>
                            <div style={previewStyle} className={previewClass}>{editedLanguage.name_ar}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-10'>
                <Title text={t("languageStyler.all")} />
                <div className='grid grid-cols-4 gap-y-5 mt-5'>
                    {languages.map(lang => (
                        <div key={lang.id}>
                            <p className='text-center text-2xl font-bold mb-5'>{isEnglish ? lang.name_en : lang.name_ar}</p>
                            <div className='flex flex-wrap justify-center gap-2'>
                                {[lang.name_en, lang.name_ar].map((name, index) => (
                                    <p
                                        key={index}
                                        className="px-9 py-3 rounded-full text-[15px] font-bold uppercase pointer-events-none select-none"
                                        style={{
                                            backgroundColor: `#${lang.bg_color || '6b7280'}`,
                                            color: `#${lang.text_color || 'ffffff'}`,
                                            boxShadow: `0 0 0 2px #${lang.ring_color || '6b7280'}`
                                        }}
                                    >
                                        {name}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}