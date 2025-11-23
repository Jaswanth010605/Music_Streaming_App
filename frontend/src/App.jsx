import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import UserHistory from './pages/UserHistory';
import Discovery from './pages/Discovery';
import ArtistDeepDive from './pages/ArtistDeepDive';
import AlbumExplorer from './pages/AlbumExplorer';
import Trending from './pages/Trending';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<UserHistory />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/artists" element={<ArtistDeepDive />} />
              <Route path="/albums" element={<AlbumExplorer />} />
              <Route path="/trending" element={<Trending />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;