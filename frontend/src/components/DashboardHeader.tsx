import { Earth, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DashboardHeader() {
    const { t, i18n } = useTranslation();
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <nav className="db-header shadow-lg sticky top-0 z-50 transition-colors dark-duration">
            <div className="w-full px-8 flex flex-row justify-between items-center py-4 gap-4">
                <p className='text-white font-bold text-2xl'>{t("dashboard_header.title")}</p>
                {/* Dark Mode Toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className={`relative w-20 h-12 flex items-center rounded-full p-1 cursor-pointer transition-colors dark-duration shadow-inner
                            ${isDark ? 'bg-slate-700' : 'bg-blue-400'}`}
                        title={t("dashboard_header.dark_mode")}
                        dir="ltr"
                    >
                        <div
                            className={`flex items-center justify-center bg-white w-10 h-10 rounded-full shadow-lg transform transition-transform dark-duration ease-in-out
                                ${isDark ? 'translate-x-8 rotate-[360deg]' : 'translate-x-0 rotate-0'}`}
                        >
                            {isDark
                                ? (<Moon className="text-slate-700 animate-in fade-in zoom-in dark-duration flex-shrink-0" />)
                                : (<Sun className="text-yellow-500 animate-in fade-in zoom-in dark-duration flex-shrink-0" />)
                            }
                        </div>
                    </button>

                </div>

                {/* Language Switcher Section */}
                <button
                    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
                    className="flex flex-row gap-1 items-center justify-center w-10 aspect-square text-white rounded-full hover:text-blue-300 font-bold transition-all cursor-pointer"
                    title={i18n.language === 'en' ? t("dashboard_header.switch_ar") : t("dashboard_header.switch_en")}
                    dir="ltr"
                >
                    <Earth className='flex-shrink-0' />
                    {i18n.language.startsWith('en')
                        ? (<span className="text-lg pb-1.5">ع</span>)
                        : (<span className="text-lg">EN</span>)
                    }
                </button>
            </div>
        </nav>
    );
}