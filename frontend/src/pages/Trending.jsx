import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Music, Mic2, Award } from 'lucide-react';
import { getTrendingSongs, getPopularSongs, getTopArtists } from '../services/api';
import SongCard from '../components/SongCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Trending.css';

const Trending = () => {
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('Fetching trending data...');
      
      const trendingRes = await getTrendingSongs(10, 7);
      console.log('Trending songs:', trendingRes.data);
      setTrendingSongs(trendingRes.data || []);
      
      const popularRes = await getPopularSongs(10);
      console.log('Popular songs:', popularRes.data);
      setPopularSongs(popularRes.data || []);
      
      const artistsRes = await getTopArtists(10);
      console.log('Top artists:', artistsRes.data);
      setTopArtists(artistsRes.data || []);
      
    } catch (err) {
      console.error('Failed to load trending data:', err);
      alert('Error loading trending data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="page trending-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="gradient-text">Trending & Popular</h1>
            <p className="page-description">
              Discover what's hot right now in the music world
            </p>
          </div>
        </div>

        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <TrendingUp size={20} />
            Trending Songs
          </button>
          <button
            className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            <Award size={20} />
            Most Popular
          </button>
          <button
            className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            <Mic2 size={20} />
            Top Artists
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading trending data..." />}

        {!loading && (
          <>
            {activeTab === 'trending' && (
              <motion.div
                className="content-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="section-header">
                  <h2>
                    <TrendingUp size={28} />
                    Most Played This Week
                  </h2>
                  <p className="section-description">
                    Songs with the most plays in the last 7 days
                  </p>
                </div>
                {trendingSongs.length > 0 ? (
                  <div className="songs-grid">
                    {trendingSongs.map((song, index) => (
                      <motion.div
                        key={song.song_id}
                        className="trending-song-wrapper"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="rank-badge">
                          <span className="rank-number">#{index + 1}</span>
                          {song.recent_play_count && (
                            <span className="play-count">{song.recent_play_count} plays</span>
                          )}
                        </div>
                        <SongCard song={song} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <TrendingUp size={64} className="empty-icon" />
                    <h3>No trending songs this week</h3>
                    <p>Check back later for updated trends</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'popular' && (
              <motion.div
                className="content-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="section-header">
                  <h2>
                    <Award size={28} />
                    All-Time Popular Songs
                  </h2>
                  <p className="section-description">
                    Songs with the highest popularity scores
                  </p>
                </div>
                <div className="songs-grid">
                  {popularSongs.map((song, index) => (
                    <motion.div
                      key={song.song_id}
                      className="trending-song-wrapper"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="rank-badge gold">
                        <span className="rank-number">#{index + 1}</span>
                      </div>
                      <SongCard song={song} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'artists' && (
              <motion.div
                className="content-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="section-header">
                  <h2>
                    <Mic2 size={28} />
                    Top Artists
                  </h2>
                  <p className="section-description">
                    Artists with the most plays and unique listeners
                  </p>
                </div>
                <div className="artists-leaderboard">
                  {topArtists.map((artist, index) => (
                    <motion.div
                      key={artist.artist_id}
                      className="artist-leaderboard-item card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="artist-rank-large">
                        #{index + 1}
                      </div>
                      <div className="artist-leaderboard-info">
                        <h3>{artist.artist_name}</h3>
                        <div className="artist-stats">
                          <span>
                            <Music size={16} />
                            {artist.play_count} plays
                          </span>
                          <span>
                            <TrendingUp size={16} />
                            {artist.unique_listeners} listeners
                          </span>
                        </div>
                      </div>
                      <div className="trophy-icon">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && <Mic2 size={32} />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Trending;