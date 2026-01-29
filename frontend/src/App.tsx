import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AbsoluteCinema from './pages/AbsoluteCinema';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import MainLayout from './layouts/MainLayout';
import MovieTemplate from './pages/MovieTemplate';
import ScrollToTop from './components/utils/ScrollToTop';
import MaturityRatings from './pages/MaturityRatings';
import MoviesPage from './pages/MoviesPage';

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        {/* Material UI */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieId" element={<MovieTemplate />} />
          <Route path="/maturity-ratings" element={<MaturityRatings />} />
          <Route path="/movies" element={<MoviesPage />} />
        </Route>

        {/* Traditional React UI */}
        <Route path="/lol" element={<AbsoluteCinema />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
