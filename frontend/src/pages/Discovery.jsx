import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Search } from 'lucide-react';
import { filterSongs, getAllSongs } from '../services/api';
import SongCard from '../components/SongCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Discovery.css';

const Discovery = () => {
  const [filters, setFilters] = useState({
    genre: '',
    energy_min: 0,
    energy_max: 1,
    danceability_min: 0,
    danceability_max: 1,
    tempo_min: 60,
    tempo_max: 200,
    acousticness_min: 0,
    acousticness_max: 1,
    valence_min: 0,
    valence_max: 1,
  });

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const genres = ['Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const handleGenreChange = (e) => {
    setFilters(prev => ({
      ...prev,
      genre: e.target.value
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await filterSongs(filters);
      setSongs(response.data);
    } catch (err) {
      console.error('Failed to filter songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      genre: '',
      energy_min: 0,
      energy_max: 1,
      danceability_min: 0,
      danceability_max: 1,
      tempo_min: 60,
      tempo_max: 200,
      acousticness_min: 0,
      acousticness_max: 1,
      valence_min: 0,
      valence_max: 1,
    });
    setSongs([]);
    setSearched(false);
  };

  return (
    <motion.div
      className="page discovery-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="gradient-text">Discover Music</h1>
            <p className="page-description">
              Find songs by adjusting audio features and selecting genres
            </p>
          </div>
        </div>

        <div className="filters-card card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={24} />
              Audio Features
            </h3>
          </div>

          <div className="genre-selector mb-3">
            <label>Genre (Optional)</label>
            <select value={filters.genre} onChange={handleGenreChange}>
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="sliders-grid">
            <div className="slider-group">
              <label>
                Energy
                <span className="slider-values">
                  {filters.energy_min.toFixed(2)} - {filters.energy_max.toFixed(2)}
                </span>
              </label>
              <div className="slider-inputs">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.energy_min}
                  onChange={(e) => handleFilterChange('energy_min', e.target.value)}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.energy_max}
                  onChange={(e) => handleFilterChange('energy_max', e.target.value)}
                />
              </div>
            </div>

            <div className="slider-group">
              <label>
                Danceability
                <span className="slider-values">
                  {filters.danceability_min.toFixed(2)} - {filters.danceability_max.toFixed(2)}
                </span>
              </label>
              <div className="slider-inputs">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.danceability_min}
                  onChange={(e) => handleFilterChange('danceability_min', e.target.value)}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.danceability_max}
                  onChange={(e) => handleFilterChange('danceability_max', e.target.value)}
                />
              </div>
            </div>

            <div className="slider-group">
              <label>
                Tempo (BPM)
                <span className="slider-values">
                  {Math.round(filters.tempo_min)} - {Math.round(filters.tempo_max)}
                </span>
              </label>
              <div className="slider-inputs">
                <input
                  type="range"
                  min="60"
                  max="200"
                  step="1"
                  value={filters.tempo_min}
                  onChange={(e) => handleFilterChange('tempo_min', e.target.value)}
                />
                <input
                  type="range"
                  min="60"
                  max="200"
                  step="1"
                  value={filters.tempo_max}
                  onChange={(e) => handleFilterChange('tempo_max', e.target.value)}
                />
              </div>
            </div>

            <div className="slider-group">
              <label>
                Acousticness
                <span className="slider-values">
                  {filters.acousticness_min.toFixed(2)} - {filters.acousticness_max.toFixed(2)}
                </span>
              </label>
              <div className="slider-inputs">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.acousticness_min}
                  onChange={(e) => handleFilterChange('acousticness_min', e.target.value)}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.acousticness_max}
                  onChange={(e) => handleFilterChange('acousticness_max', e.target.value)}
                />
              </div>
            </div>

            <div className="slider-group">
              <label>
                Valence (Mood)
                <span className="slider-values">
                  {filters.valence_min.toFixed(2)} - {filters.valence_max.toFixed(2)}
                </span>
              </label>
              <div className="slider-inputs">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.valence_min}
                  onChange={(e) => handleFilterChange('valence_min', e.target.value)}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.valence_max}
                  onChange={(e) => handleFilterChange('valence_max', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-primary" onClick={handleSearch}>
              <Search size={20} />
              Search Songs
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              Reset Filters
            </button>
          </div>
        </div>

        {loading && <LoadingSpinner message="Finding songs..." />}

        {!loading && searched && (
          <div className="results-section">
            <h2>
              Found {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </h2>
            {songs.length > 0 ? (
              <div className="songs-grid">
                {songs.map((song) => (
                  <SongCard key={song.song_id} song={song} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={64} className="empty-icon" />
                <h3>No songs match your criteria</h3>
                <p>Try adjusting your filters to find more results</p>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="empty-state">
            <Sliders size={64} className="empty-icon" />
            <h3>Adjust filters and search</h3>
            <p>Use the sliders above to customize your music discovery</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Discovery;