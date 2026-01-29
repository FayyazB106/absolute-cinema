import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AbsoluteCinema from './pages/AbsoluteCinema';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import MainLayout from './layouts/MainLayout';
import MovieDetails from './components/movies/MovieDetails';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        {/* Material UI */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieId" element={<MovieDetails />} />
        </Route>

        {/* Traditional React UI */}
        <Route path="/lol" element={<AbsoluteCinema />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
