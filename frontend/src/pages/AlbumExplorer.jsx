import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Disc, Calendar, Clock } from 'lucide-react';
import { getAllAlbums, getAlbumById, getAlbumTracks, getAlbumAudioFeatures, getSimilarAlbums } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SongCard from '../components/SongCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './AlbumExplorer.css';

const AlbumExplorer = () => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [albumInfo, setAlbumInfo] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [similarAlbums, setSimilarAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await getAllAlbums();
      console.log('Albums loaded:', response.data);
  
      // Handle both possible formats (array or object)
      const data = response.data;
      if (Array.isArray(data)) {
        setAlbums(data); // old format
      } else if (data.albums && Array.isArray(data.albums)) {
        setAlbums(data.albums); // new format with pagination
      } else {
        console.error('Unexpected album data format:', data);
        setAlbums([]);
      }
  
    } catch (err) {
      console.error('Failed to load albums:', err);
      alert('Error loading albums. Check console for details.');
    }
  };
  

  const handleAlbumSelect = async (e) => {
    const albumId = e.target.value;
    console.log('Selected album ID:', albumId);
    setSelectedAlbumId(albumId);
    
    if (!albumId) {
      setAlbumInfo(null);
      setTracks([]);
      setAudioFeatures(null);
      setSimilarAlbums([]);
      return;
    }

    setLoading(true);
    
    try {
      console.log('Fetching data for album:', albumId);
      
      const infoRes = await getAlbumById(albumId);
      console.log('Album info:', infoRes.data);
      setAlbumInfo(infoRes.data);
      
      const tracksRes = await getAlbumTracks(albumId);
      console.log('Album tracks:', tracksRes.data);
      setTracks(tracksRes.data);
      
      const featuresRes = await getAlbumAudioFeatures(albumId);
      console.log('Audio features:', featuresRes.data);
      
      // Format audio features for bar chart
      if (featuresRes.data) {
        const chartData = [
          { name: 'Energy', value: parseFloat(featuresRes.data.avg_energy) || 0 },
          { name: 'Dance', value: parseFloat(featuresRes.data.avg_danceability) || 0 },
          { name: 'Valence', value: parseFloat(featuresRes.data.avg_valence) || 0 },
          { name: 'Acoustic', value: parseFloat(featuresRes.data.avg_acousticness) || 0 },
          { name: 'Speech', value: parseFloat(featuresRes.data.avg_speechiness) || 0 },
        ];
        setAudioFeatures(chartData);
      }
      
      const similarRes = await getSimilarAlbums(albumId);
      console.log('Similar albums:', similarRes.data);
      setSimilarAlbums(similarRes.data);
      
    } catch (err) {
      console.error('Failed to load album data:', err);
      alert('Error loading album data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      className="page album-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="gradient-text">Album Explorer</h1>
            <p className="page-description">
              Discover album details, tracks, and audio characteristics
            </p>
          </div>
        </div>

        <div className="album-selector-card card">
          <label htmlFor="album-select" className="selector-label">
            <Disc size={20} />
            Select an Album
          </label>
          <select
            id="album-select"
            value={selectedAlbumId}
            onChange={handleAlbumSelect}
          >
            <option value="">Choose an album...</option>
            {albums.map((album) => (
              <option key={album.album_id} value={album.album_id}>
                {album.album_name} - {album.artists} ({album.track_count} tracks)
              </option>
            ))}
          </select>
        </div>

        {loading && <LoadingSpinner message="Loading album data..." />}

        {!loading && selectedAlbumId && albumInfo && (
          <>
            <div className="album-header-card card">
              <div className="album-icon">
                <Disc size={80} />
              </div>
              <div className="album-details">
                <h2>{albumInfo.album_name}</h2>
                <p className="album-artist">{albumInfo.artists}</p>
                <div className="album-meta">
                  <span>
                    <Calendar size={16} />
                    {formatDate(albumInfo.release_date)}
                  </span>
                  <span>
                    <Clock size={16} />
                    {formatDuration(albumInfo.total_duration || 0)}
                  </span>
                  <span>
                    {albumInfo.track_count} tracks
                  </span>
                  <span>
                    ⭐ {albumInfo.avg_popularity ? Math.round(albumInfo.avg_popularity) : 'N/A'} avg
                  </span>
                </div>
              </div>
            </div>

            {audioFeatures && audioFeatures.length > 0 && (
              <div className="audio-features-section card">
                <h2>Audio Features Overview</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={audioFeatures}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#B3B3B3' }}
                      />
                      <YAxis 
                        domain={[0, 1]}
                        tick={{ fill: '#B3B3B3' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#282828', 
                          border: '1px solid #404040',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#1DB954" 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {similarAlbums.length > 0 && (
              <div className="similar-albums-section">
                <h2>Similar Albums</h2>
                <div className="similar-albums-grid grid grid-3">
                  {similarAlbums.map((album) => (
                    <motion.div
                      key={album.album_id}
                      className="similar-album-card card"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Disc size={32} />
                      <h4>{album.album_name}</h4>
                      <p className="text-secondary">{album.artists}</p>
                      <p className="text-muted">{formatDate(album.release_date)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {tracks.length > 0 && (
              <div className="tracks-section">
                <h2>Album Tracks</h2>
                <div className="songs-grid">
                  {tracks.map((track, index) => (
                    <div key={track.song_id} className="track-with-number">
                      <span className="track-number">{index + 1}</span>
                      <SongCard song={track} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !selectedAlbumId && (
          <div className="empty-state">
            <Disc size={64} className="empty-icon" />
            <h3>Select an album to explore</h3>
            <p>Choose from the dropdown above to see album details and tracks</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AlbumExplorer;