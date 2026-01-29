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
import DashboardHeader from '../components/shared/DashboardHeader';
import { ChevronLeft, ChevronRight, Film, Library } from 'lucide-react';
import { showMobileWarning, showScreenSizeWarning } from '../components/shared/SweetAlert';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [activeModule, setActiveModule] = useState('movies');
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const activeSection = pathname.split('/')[2] || 'library';

    const handleSectionChange = (id: string) => {
        navigate(`/dashboard/${id}`);
    };

    const sidebarNavItems = [
        { id: 'library', label: t('nav.library'), icon: <Library size={20} /> },
        { id: 'showtimes', label: t('nav.showtimes'), icon: <Film size={20} /> }
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
            const width = window.innerWidth;
            if (width < 768) { showMobileWarning(); }
            if (width >= 768 && width < 1280) { showScreenSizeWarning(); }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="flex flex-col h-screen db-mainBG">
            <Toast />
            <DashboardHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`db-navBar shadow-xl dark-transition transition-all flex flex-col sticky top-0 h-full ${isCollapsed ? 'w-19' : 'w-45'}`}>
                    {/* Toggle Button */}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-6 flex w-19 justify-start db-text-secondary hover:db-text cursor-pointer">
                        <div className={`transition-transform dark-transition ${isCollapsed ? (isEnglish ? 'rotate-180' : '-rotate-180') : 'rotate-0'}`}>
                            {isEnglish ? <ChevronLeft /> : <ChevronRight />}
                        </div>
                    </button>

                    {/* List */}
                    <nav className="flex-1 px-4 space-y-2">
                        {sidebarNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleSectionChange(item.id)}
                                title={isCollapsed ? item.label : ''}
                                className={`w-full flex items-center p-3 rounded-lg cursor-pointer h-11
                                    ${activeSection === item.id ? 'db-nav-active' : 'db-nav-inactive'} 
                                    ${isCollapsed ? 'justify-start' : 'space-x-4'}`}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && (<span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>)}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 overflow-y-auto db-mainBG no-scrollbar">
                    <Routes>
                        {/* Library */}
                        <Route path="library" element={
                            <>
                                <nav className="db-navBar shadow-lg db-border border-b">
                                    <div className="w-full px-8">
                                        <div className="flex space-x-4 py-4">
                                            {libraryItems.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveModule(item.id)}
                                                    className={`px-4 py-2 rounded cursor-pointer whitespace-nowrap ${activeModule === item.id ? 'db-tab-active' : 'db-tab-inactive'}`}
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
                        } />

                        {/* For future sections */}
                        <Route path="showtimes" element={<div className='flex justify-center items-center h-full text-7xl db-text'>{t("common.stay_tuned")}</div>} />

                        {/* Default Redirect */}
                        <Route path="*" element={<Navigate to="library" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}