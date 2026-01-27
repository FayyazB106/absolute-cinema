import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AbsoluteCinema from './pages/AbsoluteCinema';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Material UI */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Traditional React UI */}
        <Route path="/lol" element={<AbsoluteCinema />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
