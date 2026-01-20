import { useState } from 'react';
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

export default function Dashboard() {
    const [activeModule, setActiveModule] = useState('movies');
    const { t } = useTranslation();

    const navItems = [
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

    return (
        <div className="min-h-screen bg-gray-100">
            <Toast />
            <DashboardHeader />

            {/* Navigation */}
            <nav className="bg-white shadow-lg">
                <div className="w-full px-8">
                    <div className="flex space-x-4 py-4">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id)}
                                className={`px-4 py-2 rounded cursor-pointer transition-colors ${activeModule === item.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            {navItems.find(item => item.id === activeModule)?.component}
        </div>
    );
}