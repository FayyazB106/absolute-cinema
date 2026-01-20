import { Earth } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DashboardHeader() {
    const { t, i18n } = useTranslation();

    return (
        <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
            <div className="w-full px-8 flex flex-row justify-between items-center py-4 gap-4">
                <p className='text-white font-bold text-2xl'>{t("dashboardHeader.title")}</p>
                {/* Language Switcher Section */}
                <button
                    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
                    className="flex flex-row gap-1 items-center justify-center w-10 aspect-square text-white rounded-full hover:text-blue-300 font-bold transition-all cursor-pointer"
                    title={i18n.language === 'en' ? t("dashboardHeader.switch_ar") : t("dashboardHeader.switch_en")}
                    dir="ltr"
                >
                    <Earth className='flex-shrink-0'/>
                    {i18n.language.startsWith('en') ? (
                        <span className="text-lg pb-1.5">ع</span>
                    ) : (
                        <span className="text-lg">EN</span>
                    )}
                </button>
            </div>
        </nav>
    );
}