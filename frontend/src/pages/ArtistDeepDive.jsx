import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic2, Music } from 'lucide-react';
import { getAllArtists, getArtistById, getArtistSongs, getArtistAudioPatterns, getSimilarArtists } from '../services/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import SongCard from '../components/SongCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './ArtistDeepDive.css';

const ArtistDeepDive = () => {
  const [artists, setArtists] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [artistInfo, setArtistInfo] = useState(null);
  const [songs, setSongs] = useState([]);
  const [audioPatterns, setAudioPatterns] = useState(null);
  const [similarArtists, setSimilarArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await getAllArtists();
      console.log('Artists loaded:', response.data);
  
      // Extract artists array
      let artistsArray = response.data.artists || [];
  
      // Remove duplicates based on artist_id
      const uniqueArtistsMap = new Map();
      artistsArray.forEach((artist) => {
        if (!uniqueArtistsMap.has(artist.artist_id)) {
          uniqueArtistsMap.set(artist.artist_id, artist);
        }
      });
      const uniqueArtists = Array.from(uniqueArtistsMap.values());
  
      // Shuffle the unique artists array
      const shuffledArtists = uniqueArtists
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
  
      setArtists(shuffledArtists);
    } catch (err) {
      console.error('Failed to load artists:', err);
      alert('Error loading artists. Check console and verify backend is running on port 5002.');
    }
  };
  
  

  const handleArtistSelect = async (e) => {
    const artistId = e.target.value;
    console.log('Selected artist ID:', artistId);
    setSelectedArtistId(artistId);
    
    if (!artistId) {
      setArtistInfo(null);
      setSongs([]);
      setAudioPatterns(null);
      setSimilarArtists([]);
      return;
    }

    setLoading(true);
    
    try {
      console.log('Fetching data for artist:', artistId);
      
      const infoRes = await getArtistById(artistId);
      console.log('Artist info:', infoRes.data);
      setArtistInfo(infoRes.data);
      
      const songsRes = await getArtistSongs(artistId);
      console.log('Artist songs:', songsRes.data);
      setSongs(songsRes.data);
      
      const patternsRes = await getArtistAudioPatterns(artistId);
      console.log('Audio patterns:', patternsRes.data);
      
      // Format audio patterns for radar chart
      if (patternsRes.data) {
        const chartData = [
          { feature: 'Energy', value: parseFloat(patternsRes.data.avg_energy) || 0 },
          { feature: 'Danceability', value: parseFloat(patternsRes.data.avg_danceability) || 0 },
          { feature: 'Valence', value: parseFloat(patternsRes.data.avg_valence) || 0 },
          { feature: 'Acousticness', value: parseFloat(patternsRes.data.avg_acousticness) || 0 },
          { feature: 'Speechiness', value: parseFloat(patternsRes.data.avg_speechiness) || 0 },
        ];
        setAudioPatterns(chartData);
      }
      
      const similarRes = await getSimilarArtists(artistId);
      console.log('Similar artists:', similarRes.data);
      setSimilarArtists(similarRes.data);
      
    } catch (err) {
      console.error('Failed to load artist data:', err);
      alert('Error loading artist data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="page artist-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="gradient-text">Artist Deep Dive</h1>
            <p className="page-description">
              Explore artist profiles, songs, and audio characteristics
            </p>
          </div>
        </div>

        <div className="artist-selector-card card">
          <label htmlFor="artist-select" className="selector-label">
            <Mic2 size={20} />
            Select an Artist
          </label>
          <select
            id="artist-select"
            value={selectedArtistId}
            onChange={handleArtistSelect}
          >
            <option value="">Choose an artist...</option>
            {artists.map((artist) => (
              <option key={artist.artist_d} value={artist.artist_id}>
                {artist.artist_name} ({artist.song_count} songs)
              </option>
            ))}
          </select>
        </div>

        {loading && <LoadingSpinner message="Loading artist data..." />}

        {!loading && selectedArtistId && artistInfo && (
          <>
            <div className="artist-stats-grid grid grid-3">
              <motion.div
                className="stat-card card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-info">
                  <h3>{artistInfo.song_count || 0}</h3>
                  <p>Total Songs</p>
                </div>
              </motion.div>

              <motion.div
                className="stat-card card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-info">
                  <h3>{artistInfo.album_count || 0}</h3>
                  <p>Albums</p>
                </div>
              </motion.div>

              <motion.div
                className="stat-card card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-info">
                  <h3>{artistInfo.avg_popularity ? Math.round(artistInfo.avg_popularity) : 'N/A'}</h3>
                  <p>Avg Popularity</p>
                </div>
              </motion.div>
            </div>

            {audioPatterns && audioPatterns.length > 0 && (
              <div className="audio-patterns-section card">
                <h2>Audio Characteristics</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={audioPatterns}>
                      <PolarGrid stroke="#404040" />
                      <PolarAngleAxis 
                        dataKey="feature" 
                        tick={{ fill: '#B3B3B3', fontSize: 14 }}
                      />
                      <Radar
                        name="Audio Features"
                        dataKey="value"
                        stroke="#1DB954"
                        fill="#1DB954"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {similarArtists.length > 0 && (
              <div className="similar-artists-section">
                <h2>Similar Artists</h2>
                <div className="similar-artists-grid grid grid-3">
                  {similarArtists.map((artist) => (
                    <motion.div
                      key={artist.artist_id}
                      className="similar-artist-card card"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Mic2 size={32} />
                      <h4>{artist.artist_name}</h4>
                      <p className="text-muted">Similar style and sound</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {songs.length > 0 && (
              <div className="songs-section">
                <h2>All Songs by {artistInfo.artist_name}</h2>
                <div className="songs-grid">
                  {songs.map((song) => (
                    <SongCard key={song.song_id} song={song} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !selectedArtistId && (
          <div className="empty-state">
            <Mic2 size={64} className="empty-icon" />
            <h3>Select an artist to explore</h3>
            <p>Choose from the dropdown above to see detailed artist information</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ArtistDeepDive;