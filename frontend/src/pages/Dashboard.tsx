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

export default function Dashboard() {
    const [activeModule, setActiveModule] = useState('movies');

    return (
        <div className="min-h-screen bg-gray-100">
            <Toast />
            
            {/* Navigation */}
            <nav className="bg-white shadow-lg">
                <div className="w-full px-8">
                    <div className="flex space-x-4 py-4">
                        <button
                            onClick={() => setActiveModule('movies')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'movies' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Movies
                        </button>
                        <button
                            onClick={() => setActiveModule('actors')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'actors' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Actors
                        </button>
                        <button
                            onClick={() => setActiveModule('directors')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'directors' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Directors
                        </button>
                        <button
                            onClick={() => setActiveModule('genres')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'genres' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Genres
                        </button>
                        <button
                            onClick={() => setActiveModule('languages')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'languages' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Languages
                        </button>
                        <button
                            onClick={() => setActiveModule('ratings')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'ratings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Maturity Ratings
                        </button>
                        <button
                            onClick={() => setActiveModule('statuses')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'statuses' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Statuses
                        </button>
                        <button
                            onClick={() => setActiveModule('export')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'export' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Export
                        </button>
                        <button
                            onClick={() => setActiveModule('playground')}
                            className={`px-4 py-2 rounded cursor-pointer ${activeModule === 'playground' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Playground
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div>
                {activeModule === 'movies' && <Movies />}
                {activeModule === 'actors' && <Actors />}
                {activeModule === 'directors' && <Directors />}
                {activeModule === 'genres' && <Genres />}
                {activeModule === 'languages' && <Languages />}
                {activeModule === 'ratings' && <Ratings />}
                {activeModule === 'statuses' && <Statuses />}
                {activeModule === 'export' && <Export />}
                {activeModule === 'playground' && <LanguageStyler />}
            </div>
        </div>
    );
}