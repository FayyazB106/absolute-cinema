import { useEffect, useState } from 'react';
import Movies from '../components/movies/Movies';
import Actors from '../components/Actors';
import Directors from '../components/Directors';
import Genres from '../components/Genres';
import Languages from '../components/Languages';
import Statuses from '../components/Statuses';
import Ratings from '../components/Ratings';
import Export from '../components/Export';
import LanguageStyler from '../components/LanguageStyler';
import Toast from '../components/shared/Toast';
import { useTranslation } from "react-i18next";
import DashboardHeader from '../components/DashboardHeader';
import { ChevronLeft, ChevronRight, /*Film,*/ Library } from 'lucide-react';
import { showMobileWarning } from '../components/shared/SweetAlert';

export default function Dashboard() {
    const [activeModule, setActiveModule] = useState('movies');
    const [activeSection, setActiveSection] = useState('library');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";

    const sidebarNavItems = [
        { id: 'library', label: t('nav.library'), icon: <Library size={20} /> },
        // { id: 'showtimes', label: t('nav.showtimes'), icon: <Film size={20} />}
    ];

    const libraryItems = [
        { id: 'movies', label: t('nav.movies'), component: <Movies /> },
        { id: 'actors', label: t('nav.actors'), component: <Actors /> },
        { id: 'directors', label: t('nav.directors'), component: <Directors /> },
        { id: 'genres', label: t('nav.genres'), component: <Genres /> },
        { id: 'languages', label: t('nav.languages'), component: <Languages /> },
        { id: 'ratings', label: t('nav.ratings'), component: <Ratings /> },
        { id: 'statuses', label: t('nav.statuses'), component: <Statuses /> },
        { id: 'export', label: t('nav.export'), component: <Export /> },
        { id: 'playground', label: t('nav.playground'), component: <LanguageStyler /> },
    ];

    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth < 768) { showMobileWarning(); }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Toast />
            <DashboardHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`db-navBar shadow-xl transition-all duration-300 flex flex-col sticky top-0 h-full ${isCollapsed ? 'w-19' : 'w-45'}`}>
                    {/* Toggle Button */}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-6 flex justify-start text-gray-500 hover:text-blue-600 cursor-pointer">
                        {isCollapsed ? (isEnglish ? <ChevronRight /> : <ChevronLeft />) : (isEnglish ? <ChevronLeft /> : <ChevronRight />)}
                    </button>

                    <nav className="flex-1 px-4 space-y-2">
                        {sidebarNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                title={isCollapsed ? item.label : ''}
                                className={`w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer h-11
                                    ${activeSection === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'} 
                                    ${isCollapsed ? 'justify-start' : 'space-x-4'}`}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && (<span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>)}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 overflow-y-auto db-mainBG no-scrollbar">
                    {activeSection === 'library' && (
                        <>
                            {/* Library */}
                            <nav className="db-navBar shadow-lg">
                                <div className="w-full px-8">
                                    <div className="flex space-x-4 py-4">
                                        {libraryItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveModule(item.id)}
                                                className={`px-4 py-2 rounded cursor-pointer transition-colors ${activeModule === item.id ? 'bg-blue-600 text-white' : 'db-navInactiveButton'}`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </nav>

                            {/* Content */}
                            {libraryItems.find(item => item.id === activeModule)?.component}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}