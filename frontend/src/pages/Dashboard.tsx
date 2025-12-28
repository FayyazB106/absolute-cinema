import { useState } from 'react';
import Movies from '../components/movies/Movies';
import Actors from '../components/Actors';
import Directors from '../components/Directors';
import Genres from '../components/Genres';
import Languages from '../components/Languages';
import Maturities from '../components/Maturities';
import Statuses from '../components/Statuses';

export default function Dashboard() {
    const [activeModule, setActiveModule] = useState('movies');

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-lg">
                <div className="w-full px-8">
                    <div className="flex space-x-4 py-4">
                        <button
                            onClick={() => setActiveModule('movies')}
                            className={`px-4 py-2 rounded ${activeModule === 'movies' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Movies
                        </button>
                        <button
                            onClick={() => setActiveModule('actors')}
                            className={`px-4 py-2 rounded ${activeModule === 'actors' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Actors
                        </button>
                        <button
                            onClick={() => setActiveModule('directors')}
                            className={`px-4 py-2 rounded ${activeModule === 'directors' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Directors
                        </button>
                        <button
                            onClick={() => setActiveModule('genres')}
                            className={`px-4 py-2 rounded ${activeModule === 'genres' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Genres
                        </button>
                        <button
                            onClick={() => setActiveModule('languages')}
                            className={`px-4 py-2 rounded ${activeModule === 'languages' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Languages
                        </button>
                        <button
                            onClick={() => setActiveModule('maturities')}
                            className={`px-4 py-2 rounded ${activeModule === 'maturities' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Maturity Ratings
                        </button>
                        <button
                            onClick={() => setActiveModule('statuses')}
                            className={`px-4 py-2 rounded ${activeModule === 'statuses' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            Statuses
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
                {activeModule === 'maturities' && <Maturities />}
                {activeModule === 'statuses' && <Statuses />}
            </div>
        </div>
    );
}