import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Music, TrendingUp } from 'lucide-react';
import { getUsers, getUserHistory, getUserStatistics, getUserTopArtists, getUserRecommendations } from '../services/api';
import SongCard from '../components/SongCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './UserHistory.css';

const UserHistory = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleUserSelect = async (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setError('');
    
    if (!userId) {
      setHistory([]);
      setStatistics(null);
      setTopArtists([]);
      setRecommendations([]);
      return;
    }

    setLoading(true);
    
    try {
      const [historyRes, statsRes, artistsRes, recsRes] = await Promise.all([
        getUserHistory(userId),
        getUserStatistics(userId),
        getUserTopArtists(userId),
        getUserRecommendations(userId, 5)
      ]);
      
      setHistory(historyRes.data);
      setStatistics(statsRes.data);
      setTopArtists(artistsRes.data);
      setRecommendations(recsRes.data.recommendations || recsRes.data);
    } catch (err) {
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <motion.div
      className="page user-history-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="gradient-text">User Listening History</h1>
            <p className="page-description">
              Explore listening patterns and get personalized recommendations
            </p>
          </div>
        </div>

        <div className="user-selector-card card">
          <label htmlFor="user-select" className="selector-label">
            <User size={20} />
            Select a User
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={handleUserSelect}
            className="user-select"
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && <LoadingSpinner message="Loading user data..." />}

        {!loading && selectedUserId && statistics && (
          <>
            <div className="stats-grid grid grid-4">
              <motion.div
                className="stat-card card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h3>{formatTime(statistics.total_listening_time_seconds)}</h3>
                  <p>Total Listening Time</p>
                </div>
              </motion.div>

              <motion.div
                className="stat-card card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">
                  <Music size={24} />
                </div>
                <div className="stat-info">
                  <h3>{statistics.total_plays}</h3>
                  <p>Songs Played</p>
                </div>
              </motion.div>

              <motion.div
                className="stat-card card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h3>{statistics.favorite_genre?.genre || 'N/A'}</h3>
                  <p>Favorite Genre</p>
                </div>
              </motion.div>

              <motion.div
                className="stat-card card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="stat-icon">
                  <Music size={24} />
                </div>
                <div className="stat-info">
                  <h3>{statistics.most_played_song?.track_name?.substring(0, 20) || 'N/A'}</h3>
                  <p>Most Played Song</p>
                </div>
              </motion.div>
            </div>

            {topArtists.length > 0 && (
              <div className="top-artists-section">
                <h2>Top Artists</h2>
                <div className="top-artists-grid grid grid-3">
                  {topArtists.slice(0, 6).map((artist, index) => (
                    <motion.div
                      key={artist.artist_id}
                      className="artist-card card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="artist-rank">#{index + 1}</div>
                      <h4>{artist.artist_name}</h4>
                      <p>{artist.play_count} plays</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="recommendations-section">
                <h2>Recommended For You</h2>
                <p className="section-description">
                  Based on your listening history and preferences
                </p>
                <div className="songs-grid">
                  {recommendations.map((song) => (
                    <SongCard key={song.song_id} song={song} showReason={true} />
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="history-section">
                <h2>Listening History</h2>
                <div className="songs-grid">
                  {history.map((item) => (
                    <SongCard key={item.history_id} song={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !selectedUserId && (
          <div className="empty-state">
            <User size={64} className="empty-icon" />
            <h3>Select a user to view their listening history</h3>
            <p>Choose from the dropdown above to get started</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserHistory;